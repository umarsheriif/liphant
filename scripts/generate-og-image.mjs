import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read the logo as base64
const logoPath = join(rootDir, 'public', 'logo-footer.png');
const logoBase64 = readFileSync(logoPath).toString('base64');
const logoDataUrl = `data:image/png;base64,${logoBase64}`;

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 1200px;
      height: 630px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #9333EA 0%, #7C3AED 50%, #6366F1 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .logo {
      max-width: 400px;
      max-height: 200px;
      margin-bottom: 40px;
    }
    .tagline {
      color: white;
      font-size: 32px;
      font-weight: 500;
      text-align: center;
      opacity: 0.95;
    }
    .url {
      color: white;
      font-size: 24px;
      margin-top: 20px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <img src="${logoDataUrl}" alt="Liphant" class="logo" />
  <p class="tagline">Where every child flourishes</p>
  <p class="url">liphant.co</p>
</body>
</html>
`;

async function generateOgImage() {
  console.log('Generating OG image...');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 630 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outputPath = join(rootDir, 'public', 'og-image.png');
  await page.screenshot({ path: outputPath, type: 'png' });

  await browser.close();

  console.log(`✓ OG image saved to: ${outputPath}`);
}

generateOgImage().catch(console.error);
