// Schreibt eine per DesignSync.get_file geholte Datei auf die Platte.
//
// Grosse get_file-Antworten landen als JSON-Datei im tool-results-Ordner, statt
// im Modellkontext. Dieses Skript packt den content-Teil daraus wieder aus —
// so kommen auch 74-KB-Seiten und Base64-Bilder ins Repo, ohne dass ihr Inhalt
// durch den Kontext muss.
//
//   node tools/dc-extract.mjs <ergebnis.json> <zieldatei>

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const [src, dest] = process.argv.slice(2);
if (!src || !dest) {
  console.error('Aufruf: node tools/dc-extract.mjs <ergebnis.json> <zieldatei>');
  process.exit(1);
}

const payload = JSON.parse(await readFile(src, 'utf8'));
if (typeof payload.content !== 'string') {
  console.error(`${src}: kein content-Feld — womoeglich eine Fehlerantwort`);
  process.exit(1);
}

await mkdir(dirname(dest), { recursive: true });
const data = payload.isBase64
  ? Buffer.from(payload.content, 'base64')
  : Buffer.from(payload.content, 'utf8');
await writeFile(dest, data);

console.log(`${dest}  ${data.length} Bytes${payload.truncated ? '  (ABGESCHNITTEN!)' : ''}`);
