// Haengt an CSS/JS-Verweise einen Versionsstempel (?v=...), damit Browser
// nach einer Aenderung wirklich die neue Datei laden und nicht die alte aus
// dem Cache. Ohne das sieht man Aenderungen erst nach manuellem Cache-Leeren.
//
// Nach jeder Aenderung an einer Datei unter assets/ ausfuehren:
//   node tools/bump-assets.mjs

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DOCS = 'docs';
const ASSETS = [
  'assets/css/site.css',
  'assets/css/fonts.css',
  'assets/js/site.js',
  'assets/js/consent.js',
];

// Kurzer, aufsteigender Stempel: Minuten seit 2026-01-01.
const stamp = Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 60000).toString(36);

let geaendert = 0;
for (const datei of (await readdir(DOCS)).filter((f) => f.endsWith('.html'))) {
  const pfad = join(DOCS, datei);
  const vorher = await readFile(pfad, 'utf8');
  let nachher = vorher;

  for (const asset of ASSETS) {
    // Auch fuehrendes "/" (404.html nutzt absolute Pfade) und ein bereits
    // vorhandenes ?v=... beruecksichtigen.
    const re = new RegExp(`((?:/|")${asset.replace(/[/.]/g, '\\$&')})(\\?v=[^"]*)?"`, 'g');
    nachher = nachher.replace(re, `$1?v=${stamp}"`);
  }

  if (nachher !== vorher) { await writeFile(pfad, nachher); geaendert++; }
}

console.log(`Versionsstempel ?v=${stamp} in ${geaendert} Seiten gesetzt.`);
