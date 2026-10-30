// Erzeugt docs/behandlungsvereinbarung.pdf aus tools/vereinbarung-pdf.html
// mit einem lokal installierten Edge oder Chrome im Headless-Modus.
//
//   node tools/vereinbarung-pdf.mjs

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const browser = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find(existsSync);

if (!browser) {
  console.error('Weder Edge noch Chrome gefunden.');
  process.exit(1);
}

const quelle = pathToFileURL(resolve('tools/vereinbarung-pdf.html')).href;
const ziel = resolve(process.argv[2] ?? 'docs/behandlungsvereinbarung.pdf');

execFileSync(browser, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${ziel}`,
  quelle,
], { stdio: 'inherit' });

console.log(`Geschrieben: ${ziel}`);
