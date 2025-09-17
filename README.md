# Webshot API

A Node.js API service for capturing website screenshots using Puppeteer and Express. This service provides a simple REST endpoint to capture screenshots of websites in PNG format with a 16:9 aspect ratio.

## Features

- ✅ **Simple REST API** - Single endpoint for screenshot capture
- ✅ **URL Validation** - Validates HTTP/HTTPS URLs before processing
- ✅ **16:9 Screenshots** - Captures viewport screenshots in 1920x1080 resolution
- ✅ **Error Handling** - Comprehensive error handling with meaningful messages
- ✅ **Resource Management** - Automatic browser cleanup after each request
- ✅ **Timeout Protection** - 30-second timeout for page loading
- ✅ **Bot Detection Avoidance** - Uses realistic user agent strings
- ✅ **Scalable** - Efficient resource usage for multiple concurrent requests

## Installation

1. Clone or download this project
2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will start on port 3000 by default (or the port specified in the `PORT` environment variable).

## API Usage

### Health Check
```
GET /
```

Returns server status and available endpoints.

**Response:**
```json
{
  "message": "Webshot API is running",
  "endpoints": {
    "screenshot": "/screenshot?url=<URL>",
    "health": "/"
  }
}
```

### Screenshot Capture
```
GET /screenshot?url=<URL>
```

Captures a screenshot of the specified website.

**Parameters:**
- `url` (required): The website URL to capture (must be HTTP or HTTPS)

**Example Requests:**
```bash
# Capture Google homepage
curl "http://localhost:3000/screenshot?url=https://www.google.com" --output google.png

# Capture GitHub homepage
curl "http://localhost:3000/screenshot?url=https://github.com" --output github.png

# Using wget
wget "http://localhost:3000/screenshot?url=https://www.example.com" -O example.png
```

**Success Response:**
- **Status:** 200 OK
- **Content-Type:** image/png
- **Body:** PNG image data

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing required parameter | No URL provided |
| 400 | Invalid URL format | URL is not a valid HTTP/HTTPS URL |
| 400 | Invalid URL | URL could not be resolved |
| 400 | Connection refused | Could not connect to the URL |
| 408 | Request timeout | Website took too long to load (>30s) |
| 500 | Internal server error | Unexpected server error |

**Error Response Format:**
```json
{
  "error": "Error type",
  "message": "Detailed error description"
}
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)

### Screenshot Settings

The service captures screenshots with the following settings:
- **Resolution:** Exactly 1920x1080 (16:9 aspect ratio)
- **Device Scale Factor:** 1.0 (no scaling for true browser resolution)
- **Format:** PNG
- **Viewport Only:** Does not capture full page, only visible area
- **Timeout:** 30 seconds for page loading
- **Wait Strategy:** Waits for network idle (no requests for 500ms)

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing the API

1. Start the server:
```bash
npm start
```

2. Test the health endpoint:
```bash
curl http://localhost:3000/
```

3. Test screenshot capture:
```bash
curl "http://localhost:3000/screenshot?url=https://www.google.com" --output test.png
```

4. Open the generated PNG file to verify the screenshot.

### Automated Testing

A comprehensive test script is included to verify all API functionality:

```bash
node test-api.js
```

This script tests:
- Health endpoint functionality
- Valid screenshot capture
- URL validation error handling
- Missing parameter error handling
- 404 error handling

## Browser Configuration

The service uses Puppeteer-core with @sparticuz/chromium-min for optimal performance:
- **Local Development**: Automatically detects and uses local Chrome installation
- **Production/Serverless**: Downloads optimized Chromium binary from @sparticuz/chromium-min
- **Headless mode**: For better performance and server compatibility
- **Optimized flags**: Configured for both local and serverless environments
- **16:9 Viewport**: 1920x1080 resolution with 1.4x device scale factor

## Error Handling

The API includes comprehensive error handling for:
- Invalid or missing URLs
- Network connectivity issues
- Page loading timeouts
- DNS resolution failures
- Server errors

All errors return appropriate HTTP status codes and JSON error messages.

## Performance Considerations

- Each request launches a new browser instance for isolation
- Browser instances are automatically closed after screenshot capture
- Memory usage is optimized for concurrent requests
- Network idle detection ensures dynamic content is loaded

## Security

- URL validation prevents malicious input
- Sandboxed browser execution
- No file system access beyond screenshot generation
- Timeout protection against hanging requests

## Deployment

### Vercel Deployment

This project is optimized for Vercel deployment with full CORS support:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### CORS Support

The API includes comprehensive CORS support for:
- All origins (including Vercel domains)
- All common HTTP methods
- Proper preflight handling
- Custom headers support

## Dependencies

- **express**: Web framework for the REST API
- **puppeteer-core**: Headless Chrome automation (core library)
- **@sparticuz/chromium-min**: Optimized Chromium binary for serverless environments
- **validator**: URL validation utilities
- **cors**: Cross-Origin Resource Sharing middleware

## License

ISC License

## Support

For issues or questions, please check the error messages returned by the API. Common issues:
- Ensure the target website is accessible
- Check that the URL includes the protocol (http:// or https://)
- Verify network connectivity to the target website
