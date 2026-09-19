import fs from 'fs';
import path from 'path';

const outTextDir = "C:\\Users\\German Higuera\\.gemini\\antigravity\\brain\\c4d9ef62-0314-44cb-8345-03f30b528d1a\\scratch\\extracted";
const files = fs.readdirSync(outTextDir).filter(f => f.endsWith('.pdf.txt'));

const results = [];

for (const file of files) {
  const text = fs.readFileSync(path.join(outTextDir, file), 'utf8');
  const baseName = file.replace('.pdf.txt', '');

  // Extract common metadata
  const findRegex = (re) => {
    const m = text.match(re);
    return m ? m[1].trim() : '';
  };

  const certNum = findRegex(/(?:Certificado N[°o]|CERTIFICADO N[°o]|No\.\s*de\s*Certificado|Certificado No\.?|NÚMERO\s*:)\s*[:.]?\s*([A-Z0-9\-_/ ]+?)(?:\r|\n|Magnitud|Cliente|PÁGINAS|$)/i) || baseName;
  const cliente = findRegex(/(?:Cliente|Customer|Solicitante|CLIENTE)\s*[:.*]?\s*([^\n\r]+)/i);
  const instrumento = findRegex(/(?:Instrumento|Equipo|Item|Objeto|DESCRIPCIÓN|EQUIPO CALIBRADO)\s*[:.*]?\s*([^\n\r]+)/i);
  const fabricante = findRegex(/(?:Fabricante|Marca|Manufacturer|FABRICANTE)\s*[:.*]?\s*([^\n\r]+)/i);
  const modelo = findRegex(/(?:Modelo|Model|MODELO)\s*[:.*]?\s*([^\n\r]+)/i);
  const serie = findRegex(/(?:Número de serie|Serie|Serial|Serial number|NÚMERO DE SERIE)\s*[:.*]?\s*([^\n\r]+)/i);
  const magnitud = findRegex(/(?:Magnitud|Magnitude|MAGNITUD)\s*[:.*]?\s*([^\n\r]+)/i);
  const fechaCal = findRegex(/(?:Fecha de calibración|Calibration date|Fecha Calibración|FECHA DE CALIBRACIÓN)\s*[:.*]?\s*([^\n\r]+)/i);
  const rango = findRegex(/(?:Intervalo de medid[ao]|Measurement [rR]ange|INTERVALO DE MEDICIÓN|Rango)\s*[:.*]?\s*([^\n\r]+)/i);
  const resolucion = findRegex(/(?:División de [eE]scala|Resolución|Resolution)\s*[:.*]?\s*([^\n\r]+)/i);

  results.push({
    file: baseName,
    certNum,
    cliente,
    instrumento,
    fabricante,
    modelo,
    serie,
    magnitud,
    fechaCal,
    rango,
    resolucion,
    fullTextPreview: text.slice(0, 1500)
  });
}

fs.writeFileSync(path.join(outTextDir, 'metadata_all.json'), JSON.stringify(results, null, 2), 'utf8');
console.log(`Saved metadata for all ${results.length} certificates.`);
