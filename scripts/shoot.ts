import { readFileSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function main() {
  const [url, out, cookieFile, clickSel, waitMs] = process.argv.slice(2);
  if (!url || !out) {
    console.error(
      "usage: tsx scripts/shoot.ts <url> <out.png> [cookie-file|-] [click-selector] [extra-wait-ms]",
    );
    process.exit(1);
  }
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
  if (cookieFile && cookieFile !== "-") {
    const cookie = readFileSync(cookieFile, "utf8").trim();
    await page.setExtraHTTPHeaders({ cookie });
  }
  if (process.env.SHOOT_PRINT === "1") await page.emulateMediaType("print");
  await page.goto(url, { waitUntil: "networkidle0", timeout: 45000 });
  if (clickSel) {
    await page.click(clickSel);
    await new Promise((r) => setTimeout(r, Number(waitMs ?? 4000)));
  }
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: out as `${string}.png`,
    fullPage: process.env.SHOOT_VIEWPORT !== "1",
  });
  await browser.close();
  console.log(`shot ${url} -> ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
