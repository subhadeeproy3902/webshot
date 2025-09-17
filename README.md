# Website Screenshot API

A powerful Next.js API for capturing high-quality screenshots of websites using Puppeteer and Chromium. Built for serverless deployment on Vercel.

## Features

- 📸 High-quality website screenshots
- 🎨 Multiple image formats (PNG, JPEG, WebP)
- 📱 Customizable viewport dimensions
- 🔧 Device scale factor support
- 🚀 Serverless-ready for Vercel deployment
- 🌐 CORS enabled for cross-origin requests
- ✅ URL validation and error handling
- 🎯 Simple REST API interface

## API Usage

### Endpoint

```
GET /api/screenshot
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | ✅ Yes | - | The website URL to screenshot |
| `width` | number | ❌ No | 1920 | Viewport width in pixels (100-4000) |
| `height` | number | ❌ No | 1080 | Viewport height in pixels (100-4000) |
| `scale` | number | ❌ No | 1 | Device scale factor (0.5-3.0) |
| `format` | string | ❌ No | png | Image format (png, jpeg, webp) |

### Example Requests

```bash
# Basic screenshot
curl "https://your-domain.vercel.app/api/screenshot?url=https://example.com"

# Custom dimensions and format
curl "https://your-domain.vercel.app/api/screenshot?url=https://example.com&width=1280&height=720&format=jpeg"

# High DPI screenshot
curl "https://your-domain.vercel.app/api/screenshot?url=https://example.com&scale=2"
```

### Response

- **Success**: Returns the screenshot image as binary data
- **Error**: Returns JSON with error details

```json
{
  "error": "Invalid URL provided",
  "message": "Failed to capture screenshot"
}
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/webshot.git
cd webshot
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see the web interface.

### Local Development

For local development, you can set the `CHROME_EXECUTABLE_PATH` environment variable to use your local Chrome installation:

```bash
# Windows
set CHROME_EXECUTABLE_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"

# macOS
export CHROME_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Linux
export CHROME_EXECUTABLE_PATH="/usr/bin/google-chrome"
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

The app is configured for Vercel's serverless functions with:
- 45-second timeout for screenshot generation
- Optimized Chromium binary for serverless environments
- CORS headers for API access

### Environment Variables

No environment variables are required for production deployment on Vercel.

## Technical Details

- **Framework**: Next.js 15 with App Router
- **Screenshot Engine**: Puppeteer Core + @sparticuz/chromium-min
- **Deployment**: Vercel Serverless Functions
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
