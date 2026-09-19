import fs from 'fs';
import path from 'path';

const outTextDir = "C:/Users/German Higuera/.gemini/antigravity/brain/c4d9ef62-0314-44cb-8345-03f30b528d1a/scratch/extracted";

const lpFiles = [
  "LP-0363-26.pdf.txt", "LP-0364-26.pdf.txt", "LP-0365-26.pdf.txt", "LP-0366-26.pdf.txt",
  "LP-0367-26.pdf.txt", "LP-0368-26.pdf.txt", "LP-0369-26.pdf.txt", "LP-0370-26.pdf.txt"
];

for (const f of lpFiles) {
  const text = fs.readFileSync(path.join(outTextDir, f), 'utf8');
  console.log(`\n========================================\n${f.replace('.pdf.txt', '')}\n========================================`);
  
  // Find lines with table data
  // Table columns: Puntos de Calibracion (psi), Patrón (kPa), M1 (psi), M1 (kPa), M2 (psi), M2 (kPa), M3...
  // And there is a summary of Error de medida de la indicacion and Incertidumbre U
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Find where results are
  const resIdx = lines.findIndex(l => l.includes("Resultados de la calibración"));
  if (resIdx !== -1) {
    const chunk = lines.slice(resIdx, resIdx + 80);
    console.log(chunk.join(' | '));
  }
}
