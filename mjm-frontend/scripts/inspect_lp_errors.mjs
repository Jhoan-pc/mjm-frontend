import fs from 'fs';
import path from 'path';

const outTextDir = "C:/Users/German Higuera/.gemini/antigravity/brain/c4d9ef62-0314-44cb-8345-03f30b528d1a/scratch/extracted";

const files = ["LP-0364-26.pdf.txt", "LP-0365-26.pdf.txt", "LP-0366-26.pdf.txt", "LP-0367-26.pdf.txt", "LP-0370-26.pdf.txt"];

for (const f of files) {
  const text = fs.readFileSync(path.join(outTextDir, f), 'utf8');
  console.log(`\n================== ${f} ==================`);
  // find lines containing numbers and negative numbers
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  // Look for error line
  const errIdx = lines.findIndex(l => l.includes("Error de medida de la"));
  if (errIdx !== -1) {
    console.log("Found near error:");
    console.log(lines.slice(errIdx - 15, errIdx + 25).join(' \n '));
  }
}
