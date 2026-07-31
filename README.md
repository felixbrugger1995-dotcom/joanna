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

## Einwilligung und Reichweitenmessung

Google Analytics 4 (`G-WHWF9CP9E3`) läuft nur mit Einwilligung. Im HTML steht
kein Google-Schnipsel; `docs/assets/js/consent.js` lädt `gtag.js` erst, nachdem
jemand im Banner zugestimmt hat. Ohne Zustimmung — und ohne JavaScript —
entsteht keine Verbindung zu Google und es wird nichts auf dem Gerät abgelegt.
Werbefunktionen (Google Signals, personalisierte Werbung) sind abgeschaltet.

Die Entscheidungen liegen als `joanna-einwilligung` im localStorage, ein
Eintrag je Dienst mit eigenem Zeitstempel:

```json
{ "fassung": 2,
  "analyse": { "ja": false, "zeit": 1785497397025 },
  "tally":   { "ja": true,  "zeit": 1785497391013 } }
```

Getrennte Zeitstempel, weil die Entscheidungen an verschiedenen Stellen fallen —
eine gemeinsame Frist würde eine frische Zustimmung mit einer alten ablaufen
lassen. Jeder Eintrag gilt ein Jahr, danach wird erneut gefragt. Beim Widerruf
von `analyse` werden die `_ga`-Cookies gelöscht und die Seite neu geladen. Der
Widerrufs-Link steht im Fuß jeder Seite und im Abschnitt „Cookies und
Einwilligung" der Datenschutzerklärung.

Beim Zurückgehen holt der Browser die Seite aus dem Vor/Zurück-Speicher und
stellt das DOM wieder her, ohne die Skripte neu laufen zu lassen. `consent.js`
gleicht deshalb auch bei `pageshow` mit `persisted` erneut ab — sonst stünde
dort noch der Banner, obwohl längst geantwortet wurde, oder eine widerrufene
Messung liefe weiter.

Ändert sich das Format oder kommt ein Dienst dazu, in `consent.js` die Konstante
`FASSUNG` hochzählen. Gespeicherte Entscheidungen werden dann verworfen und neu
erfragt — bei einem Formatwechsel die einzig sichere Richtung, eine alte
Zustimmung darf nie stillschweigend auf einen neuen Umfang übertragen werden.

## Das Terminformular

Tally hängt bewusst **nicht** am Banner, sondern holt seine Einwilligung per
Zwei-Klick-Lösung auf `termin.html` selbst ab. Der Grund ist nicht nur
rechtlich: Der Banner könnte das Tor gar nicht ersetzen. Wer dort ablehnt,
bräuchte auf der Terminseite trotzdem eines — man hätte also beides, nur den
Banner länger. Und die Frage käme zu einem Zeitpunkt, zu dem noch niemand
weiß, dass es ein Formular gibt.

Was der Banner sehr wohl übernimmt, ist der Widerruf: Wurde Tally freigegeben,
erscheint dort eine zusätzliche Zeile. `termin.html` fragt über
`window.Einwilligung.erteilt('tally')` ab, ob schon zugestimmt wurde, und lädt
das Formular dann sofort. Fehlt `consent.js`, ist die Schnittstelle nicht da
und es bleibt beim Tor bei jedem Besuch — lieber einmal zu viel fragen als
ungefragt laden.

## Offene Punkte

**Vor dem Livegang im Google-Analytics-Konto zu erledigen:** den Vertrag zur
Auftragsverarbeitung nach Art. 28 DSGVO annehmen (Verwaltung → Kontoeinstellungen
→ Zusatz zur Datenverarbeitung) und die Aufbewahrung der Nutzungsdaten auf
14 Monate stellen. Die Datenschutzerklärung sagt beides zu.

Die Datenschutzerklärung aus dem Design beschrieb eine andere Website — Hosting
bei Framer, eingebettete Instagram-Inhalte, andere Dienste. Sie wurde auf den
tatsächlichen Aufbau umgeschrieben und sollte fachkundig geprüft werden.

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
| `tools/fetch-fonts.mjs` | holt die Schriften zu `docs/assets/fonts/`, damit nichts von Google nachgeladen wird |
| `tools/bump-assets.mjs` | setzt den Versionsstempel `?v=…` — nach jeder Änderung unter `assets/` ausführen |

Die ersten drei werden nur beim Import gebraucht, `bump-assets.mjs` im
laufenden Betrieb.

## Veröffentlichen

Jeder Push auf `main` wird von GitHub Pages ausgeliefert. Die Domain
`joanna-tierphysio.de` liegt bei IONOS und zeigt per A-Record auf GitHub.
