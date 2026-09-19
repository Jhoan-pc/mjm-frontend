import fs from 'fs';
import path from 'path';

const outTextDir = "C:\\Users\\German Higuera\\.gemini\\antigravity\\brain\\c4d9ef62-0314-44cb-8345-03f30b528d1a\\scratch\\extracted";

const files = fs.readdirSync(outTextDir).filter(f => f.endsWith('.pdf.txt'));

const summary = [];

for (const file of files) {
  const text = fs.readFileSync(path.join(outTextDir, file), 'utf8');
  
  // Extract key fields
  const getMatch = (regex) => {
    const m = text.match(regex);
    return m ? m[1].trim() : null;
  };

  const certNo = getMatch(/(?:Certificado N[°o]|CERTIFICADO N[°o]|No\.\s*de\s*Certificado|Certificado No\.?)\s*[:.]?\s*([A-Z0-9\-_/ ]+?)(?:\r|\n|Magnitud|Cliente|$)/i) || file.replace('.pdf.txt', '');
  const cliente = getMatch(/(?:Cliente|Customer|Solicitante)\s*[:.*]?\s*([^\n\r]+)/i);
  const instrumento = getMatch(/(?:Instrumento|Equipo|Item|Objeto|DESCRIPCIÓN)\s*[:.*]?\s*([^\n\r]+)/i);
  const marca = getMatch(/(?:Fabricante|Marca|Manufacturer)\s*[:.*]?\s*([^\n\r]+)/i);
  const modelo = getMatch(/(?:Modelo|Model)\s*[:.*]?\s*([^\n\r]+)/i);
  const serie = getMatch(/(?:Número de serie|Serie|Serial|Serial number)\s*[:.*]?\s*([^\n\r]+)/i);
  const magnitud = getMatch(/(?:Magnitud|Magnitude)\s*[:.*]?\s*([^\n\r]+)/i);
  const fechaCal = getMatch(/(?:Fecha de calibración|Calibration date|Fecha Calibración)\s*[:.*]?\s*([^\n\r]+)/i);

  // Check for conformity statements
  const hasConformity = /conforme|no conforme|cumple|no cumple|aprobado|rechazado|tolerancia|error m[aá]ximo|emp|clase/i.test(text);
  const conformitySnippets = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/(?:declaraci[oó]n de conformidad|criterio de aceptaci[oó]n|tolerancia|error m[aá]ximo permisible|emp|clase de exactitud|cumple|no cumple|conforme|no conforme|regla de decisi[oó]n|dictamen)/i.test(line)) {
      conformitySnippets.push(lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(' -- '));
    }
  }

  summary.push({
    file: file.replace('.txt', ''),
    certNo,
    cliente,
    instrumento,
    marca,
    modelo,
    serie,
    magnitud,
    fechaCal,
    conformitySnippets: conformitySnippets.slice(0, 5)
  });
}

fs.writeFileSync(path.join(outTextDir, 'overview.json'), JSON.stringify(summary, null, 2), 'utf8');
console.log(`Saved overview of ${summary.length} certificates.`);
