import fs from 'fs';
import path from 'path';

const outTextDir = "C:/Users/German Higuera/.gemini/antigravity/brain/c4d9ef62-0314-44cb-8345-03f30b528d1a/scratch/extracted";

const files = ["LE-0138-26.pdf.txt", "LE-0139-26.pdf.txt", "LE-0141-26.pdf.txt"];

for (const f of files) {
  const text = fs.readFileSync(path.join(outTextDir, f), 'utf8');
  console.log(`\n================== ${f} ==================`);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Find lines with sesgo instrumental
  const sesgoLines = lines.filter(l => /(?:Sesgo instrumental|0,0|mV|V|Ω|kΩ|MΩ)/.test(l) && /\d+,\d+/.test(l));
  console.log(sesgoLines.slice(0, 25).join('\n'));
}
