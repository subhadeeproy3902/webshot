const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium-min');
const validator = require('validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for JSON parsing
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Webshot API is running',
    endpoints: {
      screenshot: '/screenshot?url=<URL>',
      health: '/'
    }
  });
});

// Screenshot endpoint
app.get('/screenshot', async (req, res) => {
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

    // Check if running locally or in production
    const isLocal = process.platform === 'win32' || process.platform === 'darwin' || process.platform === 'linux';

    let executablePath;
    let args;

    if (isLocal) {
      // For local development, try to find Chrome/Chromium
      const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser'
      ];

      executablePath = possiblePaths.find(path => {
        try {
          require('fs').accessSync(path);
          return true;
        } catch {
          return false;
        }
      });

      args = [
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
      // For production/serverless
      executablePath = await chromium.executablePath(
        `https://github.com/Sparticuz/chromium/releases/download/v130.0.0/chromium-v130.0.0-pack.tar`,
      );
      args = chromium.args;
    }

    // Launch Puppeteer browser
    const browser = await puppeteer.launch({
      args: args,
      executablePath: executablePath,
      headless: 'new',
    });

    const page = await browser.newPage();

    // Set viewport to 16:9 ratio (1920x1080 for high quality)
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1.4
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
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': screenshot.length,
      'Cache-Control': 'no-cache',
      'Content-Disposition': `inline; filename="screenshot-${Date.now()}.png"`
    });

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
      message: 'Failed to capture screenshot'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Webshot API server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log(`Screenshot API: http://localhost:${PORT}/screenshot?url=<URL>`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
