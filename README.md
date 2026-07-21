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

## Bekannte Lücken beim Import

Die Design-API gibt pro Datei höchstens 256 KiB heraus. Davon betroffen:

- `_quelle/.image-slots.state.json` ist abgeschnitten. Aus dem lesbaren Teil
  konnten `svc-1` bis `svc-4` gerettet werden (siehe `docs/assets/img/`),
  `svc-5` steckt im fehlenden Rest, `svc-6` war nie befüllt.
- Die Fotos unter `uploads/` (iPhone-Aufnahmen) sind allesamt zu groß und
  fehlen. Sie müssen separat aus Claude Design geladen werden.

## Werkzeuge

| Skript | Zweck |
|---|---|
| `tools/dc-extract.mjs` | packt eine per Design-API geholte Datei auf die Platte aus |
| `tools/extract-images.mjs` | schneidet die Leistungs-Fotos aus dem image-slot-Sidecar |

Beide werden nur beim Import gebraucht, nicht im laufenden Betrieb.

## Veröffentlichen

Jeder Push auf `main` wird von GitHub Pages ausgeliefert. Die Domain
`joanna-tierphysio.de` liegt bei IONOS und zeigt per A-Record auf GitHub.
