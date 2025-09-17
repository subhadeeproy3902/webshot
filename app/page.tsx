'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('https://example.com');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [scale, setScale] = useState(1);
  const [format, setFormat] = useState('png');
  const [loading, setLoading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [error, setError] = useState('');

  const takeScreenshot = async () => {
    setLoading(true);
    setError('');
    setScreenshotUrl('');

    try {
      const params = new URLSearchParams({
        url,
        width: width.toString(),
        height: height.toString(),
        scale: scale.toString(),
        format,
      });

      const response = await fetch(`/api/screenshot?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to take screenshot');
      }

      // Create blob URL for the image
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setScreenshotUrl(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Website Screenshot API
          </h1>
          <p className="text-gray-600">
            Take high-quality screenshots of any website
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                min="100"
                max="4000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                min="100"
                max="4000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Scale Factor
              </label>
              <input
                type="number"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                min="0.5"
                max="3"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={takeScreenshot}
              disabled={loading || !url}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Taking Screenshot...' : 'Take Screenshot'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {screenshotUrl && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Screenshot Result
            </h2>
            <div className="border rounded-lg overflow-hidden">
              <img
                src={screenshotUrl}
                alt="Website screenshot"
                className="w-full h-auto"
              />
            </div>
            <div className="mt-4">
              <a
                href={screenshotUrl}
                download={`screenshot.${format}`}
                className="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Download Screenshot
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            API Usage
          </h2>
          <div className="bg-gray-100 rounded-md p-4">
            <code className="text-sm">
              GET /api/screenshot?url={encodeURIComponent(url)}&width={width}&height={height}&scale={scale}&format={format}
            </code>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Parameters:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><code>url</code> (required): The website URL to screenshot</li>
              <li><code>width</code> (optional): Viewport width in pixels (default: 1920)</li>
              <li><code>height</code> (optional): Viewport height in pixels (default: 1080)</li>
              <li><code>scale</code> (optional): Device scale factor (default: 1)</li>
              <li><code>format</code> (optional): Image format - png, jpeg, or webp (default: png)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
