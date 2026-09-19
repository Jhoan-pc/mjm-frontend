import fs from 'fs';
import path from 'path';

const outTextDir = "C:/Users/German Higuera/.gemini/antigravity/brain/c4d9ef62-0314-44cb-8345-03f30b528d1a/scratch/extracted";

const lpFiles = [
  "LP-0363-26.pdf.txt", "LP-0364-26.pdf.txt", "LP-0365-26.pdf.txt", "LP-0366-26.pdf.txt",
  "LP-0367-26.pdf.txt", "LP-0368-26.pdf.txt", "LP-0369-26.pdf.txt", "LP-0370-26.pdf.txt"
];

for (const f of lpFiles) {
  const text = fs.readFileSync(path.join(outTextDir, f), 'utf8');
  console.log(`\n========================================\nFILE: ${f}\n========================================`);
  
  // Extract Range and scale division
  const rangeMatch = text.match(/(?:0\s*psi\s*a\s*\d+\s*psi|\d+\s*psi\s*a\s*\d+\s*psi)/i);
  const divMatch = text.match(/(\d+[,\.]?\d*)\s*psi\s*(?:0\s*psi\s*a|\t)/i);
  const serialMatch = text.match(/(?:Número de serie|Serial)[^\n\r]*[\r\n]+([^\r\n]+)/i);

  console.log(`Range: ${rangeMatch ? rangeMatch[0] : 'N/A'}`);
  console.log(`Division/Match: ${divMatch ? divMatch[0] : 'N/A'}`);
  
  // Look for measurement lines
  const lines = text.split('\n');
  const tableLines = lines.filter(l => /^\s*\d+\s+\d+/.test(l) || /Error de medida|Incertidumbre de/i.test(l));
  console.log("Table lines sample:");
  console.log(tableLines.slice(0, 15).join('\n'));
}
