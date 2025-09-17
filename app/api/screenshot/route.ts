import chromium from "@sparticuz/chromium-min";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import validator from "validator";

export const maxDuration = 45;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    // Fixed defaults - only URL is required
    const width = 1920;
    const height = 1080;
    const deviceScaleFactor = 1;

    // Validate URL
    if (!url) {
      return new NextResponse(
        JSON.stringify({ error: "URL parameter is required" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    if (!validator.isURL(url)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid URL provided" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }



    console.log(`Taking screenshot of: ${url}`);
    console.log(`Using default viewport: ${width}x${height}`);

    // Check if running locally or in production
    const isLocal = process.env.NODE_ENV === 'development';
    console.log(`Environment: ${isLocal ? 'local' : 'production'}`);

    let executablePath: string;
    let args: string[];

    if (isLocal) {
      // For local development - try common Chrome paths
      const possiblePaths = [
        process.env.CHROME_EXECUTABLE_PATH,
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      ].filter(Boolean);

      executablePath = possiblePaths[0] || 'google-chrome';
      args = [
        ...puppeteer.defaultArgs(),
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ];
    } else {
      // For production/serverless (Vercel)
      executablePath = await chromium.executablePath();
      args = [...puppeteer.defaultArgs(), ...chromium.args];
    }

    // Launch Puppeteer browser
    console.log(`Launching browser with executablePath: ${executablePath}`);
    console.log(`Browser args: ${JSON.stringify(args)}`);

    const browser = await puppeteer.launch({
      args: args,
      executablePath: executablePath,
      headless: 'shell', // Required for newer versions of @sparticuz/chromium
    });

    console.log('Browser launched successfully');

    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({
      width: width,
      height: height,
      deviceScaleFactor: deviceScaleFactor,
    });

    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to the URL with timeout
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    console.log('Page loaded successfully');

    // Wait a bit for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
    });

    await browser.close();
    console.log('Screenshot captured successfully');

    // Return the screenshot as binary data
    return new NextResponse(Buffer.from(screenshot), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': 'inline; filename="screenshot.png"',
      },
    });

  } catch (error) {
    console.error('Screenshot error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal server error", 
        message: "Failed to capture screenshot" 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
