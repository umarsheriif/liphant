import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const files = [
  { input: 'html/LIPHANT_PRODUCT_GUIDE.html', output: 'pdf/LIPHANT_PRODUCT_GUIDE.pdf' },
  { input: 'html/guides/PARENT_QUICK_START.html', output: 'pdf/guides/PARENT_QUICK_START.pdf' },
  { input: 'html/guides/TEACHER_QUICK_START.html', output: 'pdf/guides/TEACHER_QUICK_START.pdf' },
  { input: 'html/guides/CENTER_QUICK_START.html', output: 'pdf/guides/CENTER_QUICK_START.pdf' },
  { input: 'html/guides/LIPHANT_ONE_PAGER.html', output: 'pdf/guides/LIPHANT_ONE_PAGER.pdf' },
];

async function convertToPdf() {
  console.log('Starting PDF generation...\n');

  // Ensure output directories exist
  if (!existsSync(join(__dirname, 'pdf'))) {
    mkdirSync(join(__dirname, 'pdf'));
  }
  if (!existsSync(join(__dirname, 'pdf/guides'))) {
    mkdirSync(join(__dirname, 'pdf/guides'));
  }

  const browser = await puppeteer.launch({ headless: true });

  for (const file of files) {
    const inputPath = join(__dirname, file.input);
    const outputPath = join(__dirname, file.output);

    if (!existsSync(inputPath)) {
      console.log(`✗ Skipping ${file.input} - file not found`);
      continue;
    }

    try {
      const page = await browser.newPage();
      await page.goto(`file://${inputPath}`, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        printBackground: true,
      });
      await page.close();
      console.log(`✓ ${file.output}`);
    } catch (error) {
      console.log(`✗ Failed to convert ${file.input}: ${error.message}`);
    }
  }

  await browser.close();
  console.log('\nDone! PDF files are in the ./pdf directory');
}

convertToPdf().catch(console.error);
