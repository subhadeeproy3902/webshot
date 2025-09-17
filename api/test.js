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

  try {
    const chromium = require('@sparticuz/chromium-min');
    const puppeteer = require('puppeteer-core');
    
    console.log('Testing Chromium setup...');
    console.log(`Node version: ${process.version}`);
    console.log(`Platform: ${process.platform}`);
    
    // Test Chromium executable path
    const executablePath = await chromium.executablePath();
    const args = chromium.args;
    
    res.json({
      message: 'Test successful',
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        chromiumPath: executablePath,
        chromiumArgs: args.slice(0, 5), // First 5 args only
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    });
  }
};
