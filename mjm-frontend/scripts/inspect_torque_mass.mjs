import fs from 'fs';
import path from 'path';

const outTextDir = "C:/Users/German Higuera/.gemini/antigravity/brain/c4d9ef62-0314-44cb-8345-03f30b528d1a/scratch/extracted";

const files = [
  "TOR-1127-24 ASESORIAS INTEGRALES MJM S.A.S. 1877.F (1).pdf.txt",
  "TORCÓMETRO_DISHEGRO_2025.pdf.txt",
  "TORCÓMETRO_DISHEGRO_2025(2).pdf.txt",
  "MASA PATRÓN_FRIOGAN_2026.pdf.txt"
];

for (const f of files) {
  const text = fs.readFileSync(path.join(outTextDir, f), 'utf8');
  console.log(`\n================== ${f} ==================`);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  // find lines containing numbers and % or lbf or g or kg
  const p2Idx = lines.findIndex(l => l.includes("-- 2 of") || l.includes("Página 2"));
  if (p2Idx !== -1) {
    console.log(lines.slice(p2Idx, p2Idx + 45).join('\n'));
  }
}
