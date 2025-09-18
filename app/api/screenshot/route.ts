/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { screenshotCache } from "../../../lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");
  if (!urlParam) {
    return new NextResponse("Please provide a URL.", { status: 400 });
  }

  // Prepend http:// if missing
  let inputUrl = urlParam.trim();
  if (!/^https?:\/\//i.test(inputUrl)) {
    inputUrl = `http://${inputUrl}`;
  }

  // Validate the URL is a valid HTTP/HTTPS URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(inputUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return new NextResponse("URL must start with http:// or https://", {
        status: 400,
      });
    }
  } catch {
    return new NextResponse("Invalid URL provided.", { status: 400 });
  }

  // Check cache first
  const cachedScreenshot = await screenshotCache.get(inputUrl);
  if (cachedScreenshot) {
    return new NextResponse(cachedScreenshot as BodyInit, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="screenshot.png"',
        "Cache-Control": "public, max-age=86400", // 24 hours
        "X-Cache": "HIT",
      },
    });
  }

  let browser;
  try {
    const isVercel = !!process.env.VERCEL_ENV;
    const viewport = {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    };
    let puppeteer: any,
      launchOptions: any = {
        headless: true,
        defaultViewport: viewport,
      };

    if (isVercel) {
      const chromium = (await import("@sparticuz/chromium")).default;
      puppeteer = await import("puppeteer-core");
      launchOptions = {
        ...launchOptions,
        args: chromium.args,
        executablePath: await chromium.executablePath(),
      };
    } else {
      puppeteer = await import("puppeteer");
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Optimize page loading for faster screenshots
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Block unnecessary resources for faster loading
    await page.setRequestInterception(true);
    page.on('request', (req: any) => {
      const resourceType = req.resourceType();
      if (['font', 'media', 'other'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate with optimized settings
    await page.goto(parsedUrl.toString(), {
      waitUntil: "domcontentloaded", // Faster than networkidle2
      timeout: 15000 // 15 second timeout
    });

    // Wait a bit for dynamic content to load
    await page.waitForTimeout(2000);

    const screenshot = await page.screenshot({
      type: "png",
      quality: 80, // Optimize file size
      fullPage: false // Only capture viewport for speed
    });

    // Cache the screenshot
    await screenshotCache.set(inputUrl, screenshot as Buffer);

    return new NextResponse(screenshot as BodyInit, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="screenshot.png"',
        "Cache-Control": "public, max-age=86400", // 24 hours
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      "An error occurred while generating the screenshot.",
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
