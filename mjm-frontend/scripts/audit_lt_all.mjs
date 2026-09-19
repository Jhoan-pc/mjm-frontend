import fs from 'fs';
import path from 'path';

const outTextDir = "C:/Users/German Higuera/.gemini/antigravity/brain/c4d9ef62-0314-44cb-8345-03f30b528d1a/scratch/extracted";

const ltFiles = [
  "LT-1918-26.pdf.txt", "LT-1919-26.pdf.txt", "LT-1920-26.pdf.txt", "LT-1921-26.pdf.txt",
  "LT-1922-26.pdf.txt", "LT-1923-26.pdf.txt", "LT-1924-26.pdf.txt", "LT-1925-26.pdf.txt",
  "LT-2173-26.pdf.txt", "LT-2174-26.pdf.txt"
];

for (const f of ltFiles) {
  const text = fs.readFileSync(path.join(outTextDir, f), 'utf8');
  console.log(`\n================== ${f} ==================`);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Find serial, model, instrument
  const header = lines.slice(0, 30).filter(l => /(?:Certificado|Instrumento|Fabricante|Modelo|Serie|Cliente)/i.test(l));
  console.log(header.join(' | '));
  
  // Find measurement table
  const p2Idx = lines.findIndex(l => /Valor nominal de|Indicación promedio|Resultados de calibración/i.test(l));
  if (p2Idx !== -1) {
    const chunk = lines.slice(p2Idx, p2Idx + 25);
    console.log(chunk.join(' \n '));
  }
}
