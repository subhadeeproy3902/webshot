const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium-min');
const validator = require('validator');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  const { url } = req.query;

  try {
    // Validate URL parameter
    if (!url) {
      return res.status(400).json({
        error: 'Missing required parameter: url',
        message: 'Please provide a URL in the query parameter'
      });
    }

    // Validate URL format
    if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'URL must be a valid HTTP or HTTPS URL'
      });
    }

    console.log(`Taking screenshot of: ${url}`);
    console.log(`Environment: Vercel Serverless`);
    console.log(`Node version: ${process.version}`);
    console.log(`Platform: ${process.platform}`);

    // Get Chromium executable path for Vercel
    let executablePath;
    let args;

    try {
      executablePath = await chromium.executablePath();
      args = chromium.args;
      console.log(`Chromium executable path: ${executablePath}`);
      console.log(`Chromium args: ${JSON.stringify(args)}`);
    } catch (chromiumError) {
      console.error('Failed to get Chromium executable:', chromiumError);
      return res.status(500).json({
        error: 'Chromium setup failed',
        message: chromiumError.message
      });
    }

    // Launch Puppeteer browser
    let browser;
    try {
      console.log('Launching Puppeteer...');
      browser = await puppeteer.launch({
        args: args,
        executablePath: executablePath,
        headless: 'new',
      });
      console.log('Puppeteer launched successfully');
    } catch (launchError) {
      console.error('Failed to launch Puppeteer:', launchError);
      return res.status(500).json({
        error: 'Browser launch failed',
        message: launchError.message
      });
    }

    const page = await browser.newPage();

    // Set viewport to exactly 1920x1080 (16:9 ratio)
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });

    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to the URL with timeout
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait a bit for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 700));

    // Take screenshot (viewport only, not full page)
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false // This ensures we only capture the viewport (16:9)
    });

    // Close browser to free resources
    await browser.close();

    console.log(`Screenshot captured successfully for: ${url}`);

    // Set appropriate headers and send the image
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', screenshot.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Disposition', `inline; filename="screenshot-${Date.now()}.png"`);

    res.send(screenshot);

  } catch (error) {
    console.error('Screenshot error:', error);

    // Handle specific error types
    if (error.name === 'TimeoutError') {
      return res.status(408).json({
        error: 'Request timeout',
        message: 'The website took too long to load'
      });
    }

    if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'The provided URL could not be resolved'
      });
    }

    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      return res.status(400).json({
        error: 'Connection refused',
        message: 'Could not connect to the provided URL'
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to capture screenshot',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
