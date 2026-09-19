import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const certDir = "C:\\Users\\German Higuera\\.gemini\\antigravity\\brain\\c4d9ef62-0314-44cb-8345-03f30b528d1a\\scratch\\certs";
const outTextDir = "C:\\Users\\German Higuera\\.gemini\\antigravity\\brain\\c4d9ef62-0314-44cb-8345-03f30b528d1a\\scratch\\extracted";

if (!fs.existsSync(outTextDir)) fs.mkdirSync(outTextDir, { recursive: true });

async function analyzeAll() {
  const files = fs.readdirSync(certDir).filter(f => f.endsWith('.pdf'));
  console.log(`Total PDF files to process: ${files.length}`);

  const results = [];

  for (const file of files) {
    const fullPath = path.join(certDir, file);
    try {
      const buffer = fs.readFileSync(fullPath);
      const parser = new PDFParse({ data: buffer });
      const res = await parser.getText();
      const text = res.text || '';

      fs.writeFileSync(path.join(outTextDir, `${file}.txt`), text, 'utf8');

      results.push({
        file,
        totalTextLength: text.length,
        totalPages: res.total || res.pages?.length || 1
      });
      console.log(`Extracted: ${file} (${text.length} chars, ${res.total} pages)`);
      await parser.destroy();
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
      results.push({ file, error: err.message });
    }
  }

  console.log(`Finished extracting all ${results.length} files.`);
}

analyzeAll();
