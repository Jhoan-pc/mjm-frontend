import fs from 'fs';
import path from 'path';

const outTextDir = "C:/Users/German Higuera/.gemini/antigravity/brain/c4d9ef62-0314-44cb-8345-03f30b528d1a/scratch/extracted";

const files = [
  "LE-0138-26.pdf.txt", "LE-0139-26.pdf.txt", "LE-0140-26.pdf.txt", "LE-0141-26.pdf.txt", "LE-0142-26.pdf.txt",
  "MASA PATRÓN_FRIOGAN_2026.pdf.txt",
  "PHMETRO_METROLOGICAL_2025.pdf.txt",
  "TOR-1127-24 ASESORIAS INTEGRALES MJM S.A.S. 1877.F (1).pdf.txt",
  "TORCÓMETRO_DISHEGRO_2025.pdf.txt",
  "TORCÓMETRO_DISHEGRO_2025(2).pdf.txt"
];

for (const f of files) {
  const text = fs.readFileSync(path.join(outTextDir, f), 'utf8');
  console.log(`\n========================================\n${f.replace('.pdf.txt', '')}\n========================================`);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Find instrument description
  const headerLines = lines.slice(0, 30).filter(l => /(?:Certificado|Cliente|Instrumento|Fabricante|Modelo|Serie|Magnitud|Capacidad|Exactitud)/i.test(l));
  console.log(headerLines.join(' | '));
  
  // Find results
  const resIdx = lines.findIndex(l => /Resultados de|Error|Sesgo|Masa convencional|Desviación|Conformidad|Cumplimiento/i.test(l));
  if (resIdx !== -1) {
    console.log("--- RESULTS ---");
    console.log(lines.slice(resIdx, resIdx + 35).join(' \n '));
  }
}
