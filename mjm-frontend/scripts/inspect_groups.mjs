import fs from 'fs';
import path from 'path';

const outTextDir = "C:\\Users\\German Higuera\\.gemini\\antigravity\\brain\\c4d9ef62-0314-44cb-8345-03f30b528d1a\\scratch\\extracted";

const targetFiles = [
  "MASA PATRÓN_FRIOGAN_2026.pdf.txt",
  "PHMETRO_METROLOGICAL_2025.pdf.txt",
  "TERMÓMETRO_METROLOGICAL_2025.pdf.txt",
  "TOR-1127-24 ASESORIAS INTEGRALES MJM S.A.S. 1877.F (1).pdf.txt",
  "TORCÓMETRO_DISHEGRO_2025.pdf.txt",
  "TORCÓMETRO_DISHEGRO_2025(2).pdf.txt",
  "SEI260609.pdf.txt",
  "SEI260610.pdf.txt",
  "SEI260611.pdf.txt",
  "SEI260612.pdf.txt",
  "LH-1011-26.pdf.txt",
  "LH-1012-26.pdf.txt"
];

for (const f of targetFiles) {
  const filePath = path.join(outTextDir, f);
  if (!fs.existsSync(filePath)) {
    console.log(`MISSING: ${f}`);
    continue;
  }
  const text = fs.readFileSync(filePath, 'utf8');
  console.log(`\n======================================================`);
  console.log(`FILE: ${f}`);
  console.log(`======================================================`);
  // print first 40 lines and lines containing Error, Incertidumbre, Tolerancia, Conforme
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  console.log("--- HEADER ---");
  console.log(lines.slice(0, 20).join('\n'));
  console.log("--- KEY DATA LINES ---");
  const keyLines = lines.filter(l => /(?:error|sesgo|incertidumbre|tolerancia|emp|clase|conforme|cumple|declaraci|dictamen|resultado|promedio|patr[oó]n|nominal)/i.test(l));
  console.log(keyLines.slice(0, 25).join('\n'));
}
