/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache
const screenshotCache = new Map<string, { data: Buffer; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Cache-Control",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");
  if (!urlParam) {
    return new NextResponse("Please provide a URL.", {
      status: 400,
      headers: corsHeaders,
    });
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
        headers: corsHeaders,
      });
    }
  } catch {
    return new NextResponse("Invalid URL provided.", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Check cache first
  const cached = screenshotCache.get(inputUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new NextResponse(cached.data as BodyInit, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="screenshot.png"',
        "Cache-Control": "public, max-age=3600",
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

    // Optimize for faster loading
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // Navigate with faster settings
    await page.goto(parsedUrl.toString(), {
      waitUntil: "domcontentloaded", // Faster than networkidle2
      timeout: 30000,
    });

    // Wait a bit for content to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const screenshot = await page.screenshot({
      type: "png",
    });

    // Cache the screenshot
    screenshotCache.set(inputUrl, {
      data: screenshot as Buffer,
      timestamp: Date.now(),
    });

    return new NextResponse(screenshot, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="screenshot.png"',
        "Cache-Control": "public, max-age=3600",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      "An error occurred while generating the screenshot.",
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
