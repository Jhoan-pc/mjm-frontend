import fs from 'fs';
import path from 'path';

const outTextDir = "C:/Users/German Higuera/.gemini/antigravity/brain/c4d9ef62-0314-44cb-8345-03f30b528d1a/scratch/extracted";

const tempFiles = [
  "LT-1918-26.pdf.txt", "LT-1919-26.pdf.txt", "LT-1920-26.pdf.txt", "LT-1921-26.pdf.txt",
  "LT-1922-26.pdf.txt", "LT-1923-26.pdf.txt", "LT-1924-26.pdf.txt", "LT-1925-26.pdf.txt",
  "LT-2173-26.pdf.txt", "LT-2174-26.pdf.txt",
  "TERMÓMETRO_METROLOGICAL_2025.pdf.txt",
  "SEI260609.pdf.txt", "SEI260610.pdf.txt", "SEI260611.pdf.txt", "SEI260612.pdf.txt"
];

for (const f of tempFiles) {
  const text = fs.readFileSync(path.join(outTextDir, f), 'utf8');
  console.log(`\n========================================\n${f.replace('.pdf.txt', '')}\n========================================`);
  
  // Find instrument description, range, resolution
  const inst = text.match(/(?:Instrumento|Item|EQUIPO CALIBRADO)\s*[:.*]?\s*([^\n\r]+)/i);
  const marca = text.match(/(?:Fabricante|Marca)\s*[:.*]?\s*([^\n\r]+)/i);
  const modelo = text.match(/(?:Modelo)\s*[:.*]?\s*([^\n\r]+)/i);
  const serie = text.match(/(?:Número de serie|Serie)\s*[:.*]?\s*([^\n\r]+)/i);
  
  console.log(`Inst: ${inst ? inst[1].trim() : 'N/A'} | Marca: ${marca ? marca[1].trim() : 'N/A'} | Modelo: ${modelo ? modelo[1].trim() : 'N/A'} | Serie: ${serie ? serie[1].trim() : 'N/A'}`);
  
  // Find table of results
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const resIdx = lines.findIndex(l => /Resultados de (?:la )?calibración|Resultados de medición|Resultado de Calibración/i.test(l));
  if (resIdx !== -1) {
    console.log(lines.slice(resIdx, resIdx + 30).join(' \n '));
  } else {
    // print lines with numbers and °C
    const tempLines = lines.filter(l => /°C/.test(l));
    console.log(tempLines.slice(0, 15).join(' \n '));
  }
}
