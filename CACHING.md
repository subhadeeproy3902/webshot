# Screenshot Caching System

This document describes the enhanced caching system implemented for the webshot screenshot API to dramatically improve performance from 10-12 seconds to 2-3 seconds.

## Overview

The caching system operates on multiple levels:

1. **Server-side file cache** - Persistent storage of generated screenshots
2. **Server-side memory cache** - Fast in-memory access for frequently requested screenshots
3. **Client-side cache** - Browser-based caching with localStorage persistence
4. **Smart preloading** - Intelligent cache warming based on project priority

## Server-Side Caching

### File Cache
- **Location**: `.cache/screenshots/` directory
- **Format**: PNG files with MD5-hashed filenames
- **Metadata**: JSON files containing URL, timestamp, and file info
- **TTL**: 24 hours (configurable)

### Memory Cache
- **Purpose**: Ultra-fast access for recently accessed screenshots
- **Cleanup**: Automatic cleanup every hour
- **Fallback**: Falls back to file cache if memory cache misses

### API Endpoints

#### GET /api/screenshot
- **Enhanced with caching**: Checks cache before generating new screenshots
- **Optimizations**: 
  - Faster page loading with `domcontentloaded` instead of `networkidle2`
  - Resource blocking for fonts, media, and other non-essential resources
  - Reduced quality (80%) for smaller file sizes
  - Viewport-only capture for speed

#### POST /api/warm-cache
- **Purpose**: Pre-generate screenshots for multiple URLs
- **Usage**: Batch processing to warm cache before users request screenshots
- **Response**: Status report for each URL processed

#### GET /api/warm-cache
- **Purpose**: Get cache statistics
- **Returns**: Memory cache size and cache directory info

## Client-Side Caching

### Enhanced ScreenshotImage Component
- **Memory cache**: Fast in-memory storage for current session
- **localStorage persistence**: Survives browser restarts
- **Smart cleanup**: Automatic removal of old entries
- **Error handling**: Graceful fallback with retry logic

### Features
- **Fetch with timeout**: 30-second timeout to prevent hanging
- **Cache-Control headers**: Requests cached versions when available
- **Base64 storage**: Efficient storage in localStorage
- **Automatic cleanup**: Removes entries older than 12 hours

## Smart Cache Warming

### Project-Based Preloading
- **Priority system**: Published sites > Preview sites
- **Recency factor**: Recent projects get higher priority
- **Concurrency control**: Limits simultaneous requests to avoid server overload
- **Progress tracking**: Real-time feedback on cache warming progress

### Integration Points

#### Projects List Page
- **Auto-warming**: Automatically warms cache for all visible projects
- **Smart prioritization**: Published and recent projects first
- **Background processing**: Non-blocking cache warming

#### Individual Project Page
- **Immediate preload**: Preloads screenshots as soon as project data loads
- **Multiple URLs**: Handles both preview and publish URLs
- **Error resilience**: Continues working even if some screenshots fail

## Performance Improvements

### Before Caching
- **Cold load**: 10-12 seconds per screenshot
- **No persistence**: Every request required full generation
- **Resource intensive**: Full browser automation for each request

### After Caching
- **Cache hit**: < 1 second (served from cache)
- **Cache miss**: 2-3 seconds (optimized generation + caching)
- **Persistence**: Screenshots cached for 24 hours
- **Resource efficient**: Minimal server load for cached content

## Configuration

### Cache Settings
```typescript
// Cache TTL (Time To Live)
maxAge: 24 * 60 * 60 * 1000 // 24 hours

// Cleanup interval
cleanupInterval: 60 * 60 * 1000 // 1 hour

// Screenshot optimization
quality: 80 // 80% quality for smaller files
timeout: 15000 // 15 second generation timeout
```

### Preloading Settings
```typescript
// Concurrency limits
maxConcurrency: 2 // Max simultaneous screenshot generations
delayBetweenBatches: 500 // 500ms delay between batches

// Retry logic
maxRetries: 2 // Retry failed screenshots up to 2 times
retryDelay: 1000 // 1 second delay between retries
```

## Monitoring

### Cache Statistics
- **Memory entries**: Number of screenshots in memory cache
- **Cache directory**: Location of persistent cache files
- **Hit/miss ratio**: Available via X-Cache headers (HIT/MISS)

### Performance Metrics
- **Generation time**: Time to create new screenshots
- **Cache efficiency**: Percentage of requests served from cache
- **Error rates**: Failed screenshot generation attempts

## Maintenance

### Automatic Cleanup
- **Memory cache**: Cleaned every hour
- **File cache**: Old files removed based on TTL
- **localStorage**: Client-side cleanup of expired entries

### Manual Operations
```bash
# Clear all cache
curl -X DELETE https://webshot.mvp-subha.me/api/cache

# Get cache stats
curl https://webshot.mvp-subha.me/api/warm-cache

# Warm cache for specific URLs
curl -X POST https://webshot.mvp-subha.me/api/warm-cache \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://example.com", "https://another-site.com"]}'
```

## Best Practices

1. **Preload important screenshots** during low-traffic periods
2. **Monitor cache hit rates** to optimize TTL settings
3. **Use smart warming** for new projects to improve user experience
4. **Implement graceful fallbacks** for cache failures
5. **Regular cleanup** to prevent storage bloat

## Troubleshooting

### Common Issues
- **Cache misses**: Check if URLs are properly encoded
- **Storage full**: Implement cache size limits and cleanup
- **Generation timeouts**: Increase timeout for complex sites
- **Memory leaks**: Monitor memory cache size and cleanup frequency

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG_SCREENSHOT_CACHE=true
```

This will log cache operations, hit/miss ratios, and performance metrics.
