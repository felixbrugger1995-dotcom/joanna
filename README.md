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

**Fotos.** Alle Bilder sind echte Aufnahmen von Joanna und ihrer Chihuahua-Hündin
Nala, als optimierte WebP unter `docs/assets/img/`. Die iPhone-Originale (HEIC/JPG)
liegen nicht im Repo; sie wurden mit `heic-convert` + `sharp` verkleinert und ins
WebP-Format gebracht (Hero 1600 px, Portrait 1100 px, Leistungskarten 760 px,
404-Rundbild 500 px Quadrat).

**Einzugsgebiet:** einheitlich ca. 50 km um Thannhausen (Text und Grafik im
Entwurf widersprachen sich, von Felix auf 50 km bestätigt). Die Preisliste nennt
davon unabhängig 15 km als Radius, innerhalb dessen keine Fahrtkosten anfallen.

## Werkzeuge

| Skript | Zweck |
|---|---|
| `tools/dc-extract.mjs` | packt eine per Design-API geholte Datei auf die Platte aus |
| `tools/extract-images.mjs` | schneidet die Leistungs-Fotos aus dem image-slot-Sidecar |

Beide werden nur beim Import gebraucht, nicht im laufenden Betrieb.

## Veröffentlichen

Jeder Push auf `main` wird von GitHub Pages ausgeliefert. Die Domain
`joanna-tierphysio.de` liegt bei IONOS und zeigt per A-Record auf GitHub.
