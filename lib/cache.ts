import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

interface CacheEntry {
  data: Buffer;
  timestamp: number;
  contentType: string;
}

class ScreenshotCache {
  private cacheDir: string;
  private maxAge: number; // in milliseconds
  private memoryCache: Map<string, CacheEntry>;

  constructor() {
    this.cacheDir = path.join(process.cwd(), '.cache', 'screenshots');
    this.maxAge = 7 * 24 * 60 * 60 * 1000; // 1 week
    this.memoryCache = new Map();
    this.ensureCacheDir();
  }

  private async ensureCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create cache directory:', error);
    }
  }

  private getCacheKey(url: string): string {
    return createHash('md5').update(url).digest('hex');
  }

  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.png`);
  }

  private getMetaFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.meta.json`);
  }

  async get(url: string): Promise<Buffer | null> {
    const key = this.getCacheKey(url);
    
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && Date.now() - memoryEntry.timestamp < this.maxAge) {
      return memoryEntry.data;
    }

    // Check file cache
    try {
      const metaPath = this.getMetaFilePath(key);
      const filePath = this.getCacheFilePath(key);
      
      const [metaExists, fileExists] = await Promise.all([
        fs.access(metaPath).then(() => true).catch(() => false),
        fs.access(filePath).then(() => true).catch(() => false)
      ]);

      if (metaExists && fileExists) {
        const metaData = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
        
        // Check if cache is still valid
        if (Date.now() - metaData.timestamp < this.maxAge) {
          const data = await fs.readFile(filePath);
          
          // Store in memory cache for faster access
          this.memoryCache.set(key, {
            data,
            timestamp: metaData.timestamp,
            contentType: metaData.contentType
          });
          
          return data;
        } else {
          // Cache expired, clean up
          await this.delete(url);
        }
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }

    return null;
  }

  async set(url: string, data: Buffer, contentType: string = 'image/png'): Promise<void> {
    const key = this.getCacheKey(url);
    const timestamp = Date.now();
    
    const entry: CacheEntry = {
      data,
      timestamp,
      contentType
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);

    // Store in file cache
    try {
      const metaPath = this.getMetaFilePath(key);
      const filePath = this.getCacheFilePath(key);
      
      await Promise.all([
        fs.writeFile(filePath, data),
        fs.writeFile(metaPath, JSON.stringify({
          url,
          timestamp,
          contentType,
          size: data.length
        }))
      ]);
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }

  async delete(url: string): Promise<void> {
    const key = this.getCacheKey(url);
    
    // Remove from memory cache
    this.memoryCache.delete(key);

    // Remove from file cache
    try {
      const metaPath = this.getMetaFilePath(key);
      const filePath = this.getCacheFilePath(key);
      
      await Promise.all([
        fs.unlink(filePath).catch(() => {}),
        fs.unlink(metaPath).catch(() => {})
      ]);
    } catch (error) {
      console.error('Error deleting from cache:', error);
    }
  }

  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear file cache
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => 
          fs.unlink(path.join(this.cacheDir, file)).catch(() => {})
        )
      );
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp >= this.maxAge) {
        this.memoryCache.delete(key);
      }
    }

    // Clean file cache
    try {
      const files = await fs.readdir(this.cacheDir);
      const metaFiles = files.filter(file => file.endsWith('.meta.json'));
      
      for (const metaFile of metaFiles) {
        try {
          const metaPath = path.join(this.cacheDir, metaFile);
          const metaData = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
          
          if (now - metaData.timestamp >= this.maxAge) {
            const key = metaFile.replace('.meta.json', '');
            await this.delete(metaData.url);
          }
        } catch (error) {
          console.error('Error cleaning up cache file:', error);
        }
      }
    } catch (error) {
      console.error('Error during cache cleanup:', error);
    }
  }

  getStats(): { memoryEntries: number; cacheDir: string } {
    return {
      memoryEntries: this.memoryCache.size,
      cacheDir: this.cacheDir
    };
  }
}

// Singleton instance
export const screenshotCache = new ScreenshotCache();

// Cleanup old cache entries every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    screenshotCache.cleanup();
  }, 60 * 60 * 1000); // 1 hour
}
