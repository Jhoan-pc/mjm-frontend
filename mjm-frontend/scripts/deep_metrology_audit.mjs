import fs from 'fs';
import path from 'path';

const outTextDir = "C:\\Users\\German Higuera\\.gemini\\antigravity\\brain\\c4d9ef62-0314-44cb-8345-03f30b528d1a\\scratch\\extracted";
const files = fs.readdirSync(outTextDir).filter(f => f.endsWith('.pdf.txt'));

console.log(`Analyzing ${files.length} certificates in detail...`);

for (const f of files) {
  const text = fs.readFileSync(path.join(outTextDir, f), 'utf8');
  console.log(`\n======================================================`);
  console.log(`FILE: ${f.replace('.pdf.txt', '')}`);
  console.log(`======================================================`);
  
  // Print lines with key headers or table values
  const lines = text.split('\n');
  const relevantLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (/Certificado|Cliente|Instrumento|Fabricante|Modelo|Serie|Magnitud|Exactitud|Clase|Tolerancia|EMP|Error M|Conformidad|Cumple|Regla/i.test(l)) {
      relevantLines.push(`[H] ${l}`);
    }
  }
  console.log(relevantLines.slice(0, 15).join('\n'));
}
