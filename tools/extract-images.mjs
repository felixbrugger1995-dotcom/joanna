// Holt die Leistungs-Fotos aus dem image-slot-Sidecar heraus.
//
// Die Fotos liegen im Design nicht als Dateien vor, sondern als Data-URLs in
// .image-slots.state.json. Die Design-API deckelt Downloads bei 256 KiB, das
// Sidecar ist groesser — die Datei ist also mitten in einem Base64-String
// abgeschnitten und als JSON nicht mehr parsebar.
//
// Deshalb wird hier nicht geparst, sondern gescannt: jeder Slot-Eintrag, dessen
// Data-URL sauber mit einem Anfuehrungszeichen endet, ist vollstaendig
// angekommen und wird geschrieben. Der abgeschnittene Rest wird gemeldet.
//
//   node tools/extract-images.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises';

const SIDECAR = '_quelle/.image-slots.state.json';
const OUT = 'docs/assets/img';

const raw = await readFile(SIDECAR, 'utf8');
await mkdir(OUT, { recursive: true });

// "slot-id":{ ... "u":"data:image/webp;base64,AAAA..." ... }
// Base64 enthaelt keine Anfuehrungszeichen, das schliessende " markiert also
// zuverlaessig das Ende — ein Treffer bedeutet: dieser Slot ist komplett.
const entry = /"([^"]+)":\s*\{[^{}]*?"u":\s*"data:image\/([a-z]+);base64,([A-Za-z0-9+/=]+)"/g;

const found = [];
for (const [, id, format, b64] of raw.matchAll(entry)) {
  const bytes = Buffer.from(b64, 'base64');
  const name = `${id}.${format}`;
  await writeFile(`${OUT}/${name}`, bytes);
  found.push({ id, name, kb: Math.round(bytes.length / 1024) });
}

// Alle im Sidecar erwaehnten Slot-Ids — auch die, deren Bild im
// abgeschnittenen Teil steckt.
const alle = [...raw.matchAll(/"((?:svc|hero|ueber)[^"]*)":\s*\{/g)].map((m) => m[1]);
const fehlend = alle.filter((id) => !found.some((f) => f.id === id));

for (const f of found) console.log(`  ok       ${f.name}  ${f.kb} KB`);
for (const id of fehlend) console.log(`  fehlt    ${id}  (im abgeschnittenen Teil)`);
console.log(`\n${found.length} von ${alle.length} Bildern extrahiert.`);
