import fs from 'fs';
import path from 'path';

const outTextDir = "C:/Users/German Higuera/.gemini/antigravity/brain/c4d9ef62-0314-44cb-8345-03f30b528d1a/scratch/extracted";

const leFiles = [
  "LE-0138-26.pdf.txt", "LE-0139-26.pdf.txt", "LE-0140-26.pdf.txt", "LE-0141-26.pdf.txt", "LE-0142-26.pdf.txt"
];

for (const f of leFiles) {
  const text = fs.readFileSync(path.join(outTextDir, f), 'utf8');
  console.log(`\n================== ${f} ==================`);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Header details
  const header = lines.slice(0, 30).filter(l => /(?:Certificado|Instrumento|Fabricante|Modelo|Serie|Cliente)/i.test(l));
  console.log(header.join(' | '));
  
  // Look for tables in page 2
  const p2Idx = lines.findIndex(l => l.includes("-- 1 of") || l.includes("Página 2"));
  if (p2Idx !== -1) {
    const chunk = lines.slice(p2Idx, p2Idx + 60);
    console.log(chunk.filter(l => /(?:Tensión|Corriente|Resistencia|Sesgo|Incertidumbre|V|A|Ω|kΩ|MΩ|Hz)/.test(l)).slice(0, 20).join('\n'));
  }
}
