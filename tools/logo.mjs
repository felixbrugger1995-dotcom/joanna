// Erzeugt Logo-Varianten aus der echten Website-Schrift.
//
// Zwei Fallstricke stecken hier drin:
//
// 1. outfit-700.woff2 ist eine variable Schrift mit der Achse wght 100–900,
//    Standardwert 100. Der Browser stellt ueber font-weight: 700 im @font-face
//    auf fett; wer die Datei direkt ausliest, bekommt sonst Haarlinien.
//    Darum font.variation.set({ wght: 700 }).
//
// 2. Zentriert wird ueber die Bounding-Box der fertigen Pfade, nicht ueber die
//    Vorschubbreite. Bei einem einzelnen "J" sind die Seitenabstaende stark
//    asymmetrisch — nach Vorschub zentriert sitzt der Buchstabe sichtbar
//    daneben.
//
// Die Buchstaben werden als Pfade gesetzt, nicht als <text>: sonst haenge die
// Darstellung davon ab, ob Outfit auf dem rendernden System installiert ist.
import { readFileSync, writeFileSync } from 'node:fs';
import opentype from 'opentype.js';
import wawoff2 from 'wawoff2';
import sharp from 'sharp';

const AUS = process.argv[2];

const OLIV = '#586d46';
const WEISS = '#faf8f2';
const K = 720;                      // Google empfiehlt 720x720

const ttf = await wawoff2.decompress(readFileSync('docs/assets/fonts/outfit-700.woff2'));
const font = opentype.parse(new Uint8Array(ttf).buffer);
font.variation.set({ wght: 700 });

// Sperrung wie in der Navigation — von Hand, weil getPath sie nicht kennt:
// Glyphe fuer Glyphe setzen und den Vorschub selbst aufaddieren.
function wortmarke(text, groesse, sperrung) {
  const extra = groesse * sperrung;
  const pfad = new opentype.Path();
  let x = 0;
  for (const z of text) {
    pfad.extend(font.getPath(z, x, 0, groesse));
    x += font.getAdvanceWidth(z, groesse) + extra;
  }
  const b = pfad.getBoundingBox();
  return { d: pfad.toPathData(3), x1: b.x1, y1: b.y1, breite: b.x2 - b.x1, hoehe: b.y2 - b.y1 };
}

// Setzt die Wortmarke so, dass ihre Bounding-Box auf (mx, my) zentriert ist.
function mittig(w, mx, my, farbe) {
  return `<path transform="translate(${(mx - w.breite / 2 - w.x1).toFixed(2)} ${(my - w.hoehe / 2 - w.y1).toFixed(2)})" d="${w.d}" fill="${farbe}"/>`;
}

const PFOTE = (mx, my, s, farbe) => `
  <g transform="translate(${(mx - 28 * s / 2).toFixed(2)} ${(my - 26 * s / 2).toFixed(2)}) scale(${s})" fill="${farbe}">
    <ellipse cx="6" cy="11" rx="2.6" ry="3.1"/>
    <ellipse cx="11.3" cy="7" rx="2.8" ry="3.4"/>
    <ellipse cx="16.7" cy="7" rx="2.8" ry="3.4"/>
    <ellipse cx="22" cy="11" rx="2.6" ry="3.1"/>
    <path d="M14 12.2c-4 0-7 2.9-7 6 0 2.4 2 3.6 4.1 3.6 1.1 0 2-.5 2.9-.5s1.8.5 2.9.5c2.1 0 4.1-1.2 4.1-3.6 0-3.1-3-6-7-6z"/>
  </g>`;

// Google beschneidet Logos je nach Ansicht zum Kreis. Alles Wesentliche liegt
// darum innerhalb des einbeschriebenen Kreises, nicht nur im Quadrat.
function variante(name, inhalt) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${K}" height="${K}" viewBox="0 0 ${K} ${K}">${inhalt}</svg>`;
  writeFileSync(`${AUS}/${name}.svg`, svg);
  return sharp(Buffer.from(svg)).png().toFile(`${AUS}/${name}.png`)
    .then(i => console.log(`${name.padEnd(26)} ${i.width}x${i.height}  ${Math.round(i.size / 1024)} KB`));
}

const auftraege = [
  // A — Pfote ueber der Wortmarke, weiss auf Oliv
  variante('logo-a-pfote-oliv', `
    <rect width="${K}" height="${K}" fill="${OLIV}"/>
    ${PFOTE(K / 2, 292, 4.2, WEISS)}
    ${mittig(wortmarke('JOANNA', 84, 0.16), K / 2, 432, WEISS)}`),

  // B — dieselbe Anordnung hell
  variante('logo-b-pfote-hell', `
    <rect width="${K}" height="${K}" fill="${WEISS}"/>
    ${PFOTE(K / 2, 292, 4.2, OLIV)}
    ${mittig(wortmarke('JOANNA', 84, 0.16), K / 2, 432, OLIV)}`),

  // C — nur die Wortmarke, gross und mittig; haelt am laengsten stand, wenn
  //     Google das Logo auf Briefmarkengroesse verkleinert
  variante('logo-c-wortmarke', `
    <rect width="${K}" height="${K}" fill="${OLIV}"/>
    ${mittig(wortmarke('JOANNA', 122, 0.1), K / 2, K / 2, WEISS)}`),

  // D — Monogramm. Bei 40 px Avatar ist "JOANNA" nur noch ein Strich; ein
  //     einzelnes J bleibt erkennbar.
  variante('logo-d-monogramm', `
    <rect width="${K}" height="${K}" fill="${OLIV}"/>
    ${mittig(wortmarke('J', 400, 0), K / 2, 330, WEISS)}
    ${PFOTE(K / 2, 560, 3.4, 'rgba(250,248,242,.6)')}`),
];

await Promise.all(auftraege);
