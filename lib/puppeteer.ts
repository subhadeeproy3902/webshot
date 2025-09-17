import puppeteer from "puppeteer";

export async function renderScreenshotWithPuppeteer(url: string) {
  const viewport = {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  };

  const browser = await puppeteer.launch({
    defaultViewport: viewport,
  });

  const page = await browser.newPage();
  await page.goto(url);
  const screenshot = await page.screenshot({
    encoding: "binary",
    type: "jpeg",
  });

  await browser.close();

  return screenshot;
}
