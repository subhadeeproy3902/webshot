import { renderScreenshotWithPuppeteer } from "@/lib/puppeteer";
import { unstable_noStore } from "next/cache";
import validator from "validator";

export async function GET(req: Request) {
  try {
    unstable_noStore();
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    // Validate URL
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL parameter is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!validator.isURL(url)) {
      return new Response(
        JSON.stringify({ error: "Invalid URL provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const screenshot = await renderScreenshotWithPuppeteer(
      url
    );

     return new Response(Buffer.from(screenshot), {
        headers: { "content-type": "image/jpeg" },
    });
    
  } catch (error) {
    console.error("Screenshot error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to capture screenshot",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
