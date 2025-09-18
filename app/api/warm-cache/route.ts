import { NextRequest, NextResponse } from "next/server";
import { screenshotCache } from "../../../lib/cache";

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();
    
    if (!Array.isArray(urls)) {
      return new NextResponse("URLs must be an array", { status: 400 });
    }

    const results = [];
    
    for (const url of urls) {
      if (!url || typeof url !== 'string') {
        results.push({ url, status: 'skipped', reason: 'Invalid URL' });
        continue;
      }

      try {
        // Check if already cached
        const cached = await screenshotCache.get(url);
        if (cached) {
          results.push({ url, status: 'cached', reason: 'Already in cache' });
          continue;
        }

        // Trigger screenshot generation by making a request to our own API
        const screenshotUrl = new URL('/api/screenshot', request.url);
        screenshotUrl.searchParams.set('url', url);
        
        const response = await fetch(screenshotUrl.toString(), {
          headers: {
            'User-Agent': 'Cache-Warmer/1.0'
          }
        });

        if (response.ok) {
          results.push({ url, status: 'generated', reason: 'Screenshot created and cached' });
        } else {
          results.push({ url, status: 'failed', reason: `HTTP ${response.status}` });
        }
      } catch (error) {
        results.push({ 
          url, 
          status: 'error', 
          reason: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: urls.length,
      results
    });

  } catch (error) {
    console.error('Cache warming error:', error);
    return new NextResponse(
      "Failed to warm cache",
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const stats = screenshotCache.getStats();
    
    return NextResponse.json({
      cache: {
        memoryEntries: stats.memoryEntries,
        cacheDirectory: stats.cacheDir
      }
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    return new NextResponse(
      "Failed to get cache stats",
      { status: 500 }
    );
  }
}
