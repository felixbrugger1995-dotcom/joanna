# joanna-tierphysio.de

Website von **Joanna – Mobile Tierphysiotherapie für Kleintiere**, Thannhausen und Umkreis.

Statisches HTML ohne Build-Schritt, ausgeliefert über GitHub Pages.

## Aufbau

```
docs/       das, was veröffentlicht wird — GitHub Pages liefert aus main /docs
_quelle/    die Original-Dateien aus Claude Design, als Vergleichsmaßstab
tools/      Hilfsskripte für den einmaligen Import
```

`docs/` ist reines HTML, CSS und ein wenig Vanilla-JavaScript. Kein Framework,
kein Build. Zum Ansehen genügt:

```
npx serve docs
```

## Herkunft

Das Design entstand in Claude Design (Projekt „Joanna – Mobile
Tierphysiotherapie"). Dessen `.dc.html`-Dateien sind kein normales HTML: sie
brauchen die Runtime `support.js`, die React und Babel zur Laufzeit von unpkg.com
nachlädt und die Seite erst im Browser zusammenbaut. Für eine Website, die über
Google gefunden werden soll, ist das ungeeignet — Suchmaschinen sehen eine leere
Seite, und vor dem ersten Pixel stehen rund 3 MB Nachladen.

Die Seiten unter `docs/` sind deshalb von Hand in statisches HTML übersetzt. Die
Originale liegen in `_quelle/` und bleiben dort lauffähig, um Abweichungen
nachschlagen zu können.

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite (Hero, Über mich, Leistungen, Ablauf, Einzugsgebiet, Preise, Kontakt) |
| `preise.html` | Preisliste |
| `termin.html` | Terminanfrage über ein eingebettetes Tally-Formular |
| `kontakt.html` | Direktkontakt: Telefon, E-Mail, Instagram |
| `danke.html` | Bestätigung nach dem Absenden |
| `impressum.html` | Impressum |
| `datenschutz.html` | Datenschutzerklärung |
| `404.html` | Fehlerseite (von GitHub Pages automatisch genutzt) |

## Offene Punkte

**Vor der Veröffentlichung zwingend zu erledigen:** Die Datenschutzerklärung
sagt zu, dass die Schriftarten vom eigenen Server kommen. Solange oben in den
HTML-Dateien noch `fonts.googleapis.com` steht, stimmt das nicht. Erst die
Schriften lokal einbinden, dann live gehen.

Die Datenschutzerklärung aus dem Design beschrieb eine andere Website — Hosting
bei Framer, Google Analytics, Cookie-Banner, eingebettete Instagram-Inhalte.
Nichts davon trifft hier zu. Sie wurde auf den tatsächlichen Aufbau umgeschrieben
und sollte vor dem Livegang fachkundig geprüft werden.

**Fehlende Fotos.** Die Design-API gibt pro Datei höchstens 256 KiB heraus:

- `_quelle/.image-slots.state.json` ist abgeschnitten. Aus dem lesbaren Teil
  konnten `svc-1` bis `svc-4` gerettet werden, `svc-5` steckt im fehlenden Rest,
  `svc-6` war nie befüllt.
- Die Fotos unter `uploads/` (iPhone-Aufnahmen) sind zu groß und fehlen ganz.

Betroffen sind vier Stellen, die derzeit Platzhalter zeigen: `hero.svg`,
`portrait.svg`, `svc-5.svg`, `svc-6.svg` und `404-dog.svg`. Echte Bilder in
`docs/assets/img/` ablegen und die Verweise in `index.html` bzw. `404.html`
umbiegen.

**Inhaltlicher Widerspruch.** Der Text im Einzugsgebiet nennt „ca. 30 km", die
Grafik daneben stand im Entwurf auf „ca. 50 km"; sie wurde vorläufig auf 30 km
angeglichen. Welcher Wert stimmt, muss Joanna entscheiden — die Preisliste nennt
zusätzlich 15 km als Radius, innerhalb dessen keine Fahrtkosten anfallen.

## Werkzeuge

| Skript | Zweck |
|---|---|
| `tools/dc-extract.mjs` | packt eine per Design-API geholte Datei auf die Platte aus |
| `tools/extract-images.mjs` | schneidet die Leistungs-Fotos aus dem image-slot-Sidecar |

Beide werden nur beim Import gebraucht, nicht im laufenden Betrieb.

## Veröffentlichen

Jeder Push auf `main` wird von GitHub Pages ausgeliefert. Die Domain
`joanna-tierphysio.de` liegt bei IONOS und zeigt per A-Record auf GitHub.
