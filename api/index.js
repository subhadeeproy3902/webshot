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

  res.json({
    message: 'Webshot API is running',
    endpoints: {
      screenshot: '/screenshot?url=<URL>',
      health: '/'
    },
    timestamp: new Date().toISOString(),
    environment: 'Vercel Serverless'
  });
};
