// Laedt die tatsaechlich genutzten Schriften von Google als WOFF2 herunter und
// erzeugt ein lokales fonts.css. Danach braucht die Website Google nicht mehr —
// DSGVO-relevant, weil sonst bei jedem Besuch die IP an Google geht.
//
// Google liefert je nach User-Agent ein anderes Format; mit einer aktuellen
// Chrome-Kennung kommt WOFF2 und der latin-Subset. Nur diese eine Anfrage
// geht zu Google, kein Font-CDN-Aufruf zur Laufzeit.
//
//   node tools/fetch-fonts.mjs

import { writeFile, mkdir } from 'node:fs/promises';

const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@500;700&display=swap';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const OUT_DIR = 'docs/assets/fonts';

const slug = (fam, wght, i) =>
  `${fam.toLowerCase().replace(/\s+/g, '-')}-${wght}${i ? '-' + i : ''}.woff2`;

const css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text();

await mkdir(OUT_DIR, { recursive: true });

// Jeder @font-face-Block: Familie, Gewicht, unicode-range, woff2-URL.
// Der Subset-Kommentar steht VOR dem Block und ist nach dem Split nicht
// zuverlaessig zuzuordnen — deshalb wird am unicode-range gefiltert, nicht
// am Kommentar. Der Latin-Subset ist der, der U+0000-00FF abdeckt; darin
// liegen ASCII, die deutschen Umlaute (U+00E4/F6/FC, U+00DF) und der
// Gedankenstrich. Genau dieser eine Schnitt je Gewicht wird gebraucht.
const blocks = css.split('@font-face').slice(1);
const faces = [];

for (const b of blocks) {
  const fam = /font-family:\s*'([^']+)'/.exec(b)?.[1];
  const wght = /font-weight:\s*(\d+)/.exec(b)?.[1];
  const range = /unicode-range:\s*([^;]+);/.exec(b)?.[1]?.trim();
  const url = /url\(([^)]+\.woff2)\)/.exec(b)?.[1];

  if (!fam || !wght || !url || !range) continue;
  if (!/U\+0000-00FF/.test(range)) continue;   // nur der echte Latin-Subset

  const file = slug(fam, wght, 0);

  const bytes = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer());
  await writeFile(`${OUT_DIR}/${file}`, bytes);
  console.log(`  ${file}  ${Math.round(bytes.length / 1024)} KB`);

  faces.push(
    `@font-face {\n` +
    `  font-family: '${fam}';\n` +
    `  font-style: normal;\n` +
    `  font-weight: ${wght};\n` +
    `  font-display: swap;\n` +
    `  src: url('../fonts/${file}') format('woff2');\n` +
    (range ? `  unicode-range: ${range};\n` : '') +
    `}`
  );
}

const header =
  '/* Selbst ausgelieferte Schriften — kein Aufruf an Google zur Laufzeit.\n' +
  '   Erzeugt von tools/fetch-fonts.mjs; nicht von Hand bearbeiten. */\n\n';

await writeFile('docs/assets/css/fonts.css', header + faces.join('\n\n') + '\n');
console.log(`\n${faces.length} Schnitte -> docs/assets/css/fonts.css`);
