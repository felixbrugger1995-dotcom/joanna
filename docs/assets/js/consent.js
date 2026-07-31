/* ==========================================================================
   Joanna – Mobile Tierphysiotherapie
   Einwilligung fuer Google Analytics
   --------------------------------------------------------------------------
   Google Analytics setzt Cookies und uebertraegt Daten an Google — dafuer
   braucht es nach § 25 Abs. 1 TDDDG und Art. 6 Abs. 1 lit. a DSGVO eine
   vorherige Einwilligung. Deshalb steht kein einziges Google-Schnipsel im
   HTML: Das Messskript wird erst hier nachgeladen, und erst nachdem jemand
   zugestimmt hat. Wer ablehnt oder die Seite ohne JavaScript aufruft, baut
   nie eine Verbindung zu Google auf.

   Die Entscheidung selbst liegt im localStorage. Das ist nach § 25 Abs. 2
   Nr. 2 TDDDG ohne Einwilligung erlaubt: Ohne diesen Eintrag koennte man den
   Wunsch "nein" nicht respektieren und muesste bei jedem Aufruf neu fragen.

   Das eingebettete Tally-Formular haengt bewusst nicht an diesem Banner —
   es holt seine Einwilligung an Ort und Stelle ab (siehe termin.html).
   ========================================================================== */

(() => {
  'use strict';

  const SCHLUESSEL = 'joanna-einwilligung';
  const FASSUNG = 2;          // hochzaehlen, wenn neue Dienste dazukommen
  const GUELTIG_TAGE = 365;   // danach wird erneut gefragt (Empfehlung der DSK)
  const MESS_ID = 'G-WHWF9CP9E3';

  /* ── Gespeicherte Entscheidungen ───────────────────────────────────────── */

  // Ein Eintrag je Dienst, jeder mit eigenem Zeitstempel:
  //   { fassung: 2, analyse: { ja: false, zeit: … }, tally: { ja: true, zeit: … } }
  // Getrennte Zeitstempel, weil die Entscheidungen an verschiedenen Stellen
  // und zu verschiedenen Zeiten fallen — eine gemeinsame Frist wuerde eine
  // frische Zustimmung mit einer alten zusammen ablaufen lassen.
  const alles = () => {
    try {
      // Im privaten Modus mancher Browser wirft schon der Zugriff.
      const eintrag = JSON.parse(localStorage.getItem(SCHLUESSEL));
      return eintrag && eintrag.fassung === FASSUNG ? eintrag : null;
    } catch {
      return null;
    }
  };

  // true, false oder null. null heisst: nicht gefragt, Fassung veraltet oder
  // abgelaufen — in allen drei Faellen wird erneut gefragt.
  const stand = (dienst) => {
    const eintrag = (alles() || {})[dienst];
    if (!eintrag) return null;
    if (Date.now() - eintrag.zeit > GUELTIG_TAGE * 86400000) return null;
    return eintrag.ja === true;
  };

  const sichern = (eintrag) => {
    try {
      localStorage.setItem(SCHLUESSEL, JSON.stringify(eintrag));
    } catch {
      // Kein Speicher verfuegbar: Die Entscheidung gilt dann nur fuer diesen
      // Besuch und wird beim naechsten Aufruf erneut erfragt. Lieber einmal
      // zu viel fragen als ungefragt messen oder laden.
    }
  };

  const merken = (dienst, ja) => {
    const eintrag = alles() || { fassung: FASSUNG };
    eintrag[dienst] = { ja, zeit: Date.now() };
    sichern(eintrag);
  };

  const vergessen = (dienst) => {
    const eintrag = alles();
    if (!eintrag) return;
    delete eintrag[dienst];
    sichern(eintrag);
  };

  /* ── Google Analytics ──────────────────────────────────────────────────── */

  let laeuft = false;

  const analyticsLaden = () => {
    if (laeuft) return;
    laeuft = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    // GA4 kuerzt IP-Adressen von sich aus, ein Schalter dafuer existiert nicht
    // mehr. Abschaltbar sind dagegen die Werbefunktionen — die braucht diese
    // Website nicht, und ohne sie bleibt die Verarbeitung deutlich kleiner.
    gtag('config', MESS_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    // Die Aufrufe oben landen zunaechst in dataLayer und werden abgearbeitet,
    // sobald das Skript da ist. Deshalb darf es zuletzt kommen.
    const skript = document.createElement('script');
    skript.async = true;
    skript.src = 'https://www.googletagmanager.com/gtag/js?id=' + MESS_ID;
    document.head.appendChild(skript);
  };

  // Beim Widerruf reicht es nicht, kuenftig nichts mehr zu laden — was schon
  // auf dem Geraet liegt, muss weg. Die Cookies koennen auf der Host- wie auf
  // der Domain-Ebene gesetzt sein, deshalb beide Varianten loeschen.
  const analyticsCookiesLoeschen = () => {
    const namen = document.cookie
      .split(';')
      .map((c) => c.split('=')[0].trim())
      .filter((n) => n === '_ga' || n.startsWith('_ga_') || n === '_gid' || n.startsWith('_gat'));

    if (!namen.length) return;

    const teile = location.hostname.split('.');
    const bereiche = ['', location.hostname, '.' + location.hostname];
    if (teile.length > 2) bereiche.push('.' + teile.slice(-2).join('.'));

    namen.forEach((name) => bereiche.forEach((bereich) => {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
        + (bereich ? '; domain=' + bereich : '');
    }));
  };

  /* ── Banner ────────────────────────────────────────────────────────────── */

  let banner = null;
  let vorheriger = null;   // Fokus, zu dem nach dem Klick zurueckgekehrt wird

  const bannerBauen = () => {
    const el = document.createElement('div');
    el.className = 'einwilligung';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-labelledby', 'einwilligung-titel');
    el.setAttribute('aria-describedby', 'einwilligung-text');
    el.hidden = true;

    // Kurzfassung mit Verweis, keine Vollinformation: Auf der ersten Ebene
    // muessen Dienst, Zweck, Speicherung auf dem Geraet, Empfaenger samt
    // Drittland und die Freiwilligkeit stehen — alles Weitere darf in der
    // Datenschutzerklaerung folgen.
    //
    // Dass hier nichts ueber Zugriffe von US-Behoerden steht, haengt an einer
    // Bedingung: Die Uebermittlung stuetzt sich auf den Angemessenheitsbeschluss
    // zum EU-US Data Privacy Framework (Art. 45 DSGVO), ergaenzt um die
    // Standardvertragsklauseln. Sollte der Beschluss einmal fallen und die
    // Datenschutzerklaerung wieder auf Art. 49 Abs. 1 lit. a DSGVO ausweichen,
    // muss die Risikoaufklaerung zurueck in diesen Text — jene Ausnahme traegt
    // nur, wenn vor dem Klick aufgeklaert wird, und ein Link genuegt dafuer nicht.
    //
    // Absolute Pfade: 404.html wird von GitHub Pages auch unter tiefen
    // Adressen ausgeliefert, relative Verweise zeigten dort ins Leere.
    el.innerHTML = `
      <h2 id="einwilligung-titel">Darf ich mitzählen?</h2>
      <p id="einwilligung-text">Mit Google Analytics würde ich gern sehen, welche Seiten gelesen
        werden — das hilft mir, die Website zu verbessern. Dabei werden Cookies auf deinem Gerät
        gespeichert und Daten an Google übertragen, auch in die USA. Nötig ist das nicht: Die
        Website funktioniert ohne genauso. Näheres in der
        <a href="/datenschutz#analytics">Datenschutzerklärung</a>.</p>
      <div class="einwilligung-knoepfe">
        <button type="button" data-einwilligung="nein">Ablehnen</button>
        <button type="button" data-einwilligung="ja">Einverstanden</button>
      </div>
      <div class="einwilligung-zusatz" data-tally-zeile hidden>
        <p>Das Terminformular von Tally hast du freigegeben — es lädt jetzt ohne Nachfrage.</p>
        <button type="button" data-tally-widerruf>Freigabe zurücknehmen</button>
      </div>
      <p class="einwilligung-fuss">Du kannst das jederzeit ändern.
        <a href="/datenschutz">Datenschutz</a> · <a href="/impressum">Impressum</a></p>`;

    el.querySelectorAll('[data-einwilligung]').forEach((btn) => {
      btn.addEventListener('click', () => entscheiden(btn.dataset.einwilligung === 'ja'));
    });

    el.querySelector('[data-tally-widerruf]').addEventListener('click', tallyZuruecknehmen);

    // Ganz vorn im Body, nicht am Ende: So ist der Banner fuer Tastatur und
    // Screenreader das Erste auf der Seite. Sichtbar sitzt er trotzdem unten,
    // das macht position:fixed im CSS.
    document.body.insertBefore(el, document.body.firstChild);
    return el;
  };

  const zeigen = (fokussieren) => {
    banner = banner || bannerBauen();
    // Die Tally-Zeile nur zeigen, wenn es dort etwas zurueckzunehmen gibt.
    // Beim ersten Aufschlagen ist das nie der Fall — die Frage nach Tally
    // stellt die Terminseite, und dorthin kommt niemand vor dem Banner.
    banner.querySelector('[data-tally-zeile]').hidden = stand('tally') !== true;

    // Das Einblenden macht das CSS von allein: Der Wechsel von display:none
    // zu sichtbar startet die Animation, auch beim erneuten Oeffnen.
    banner.hidden = false;

    // Beim ersten Aufschlagen der Seite nicht in den Banner springen — das
    // reisst den Leser aus dem Text. Wer ihn selbst aufruft, will dagegen
    // dorthin.
    if (fokussieren) {
      vorheriger = document.activeElement;
      banner.querySelector('[data-einwilligung="nein"]').focus();
    }
  };

  const verbergen = () => {
    if (!banner) return;
    // Ohne Ausblendung: Nach dem Klick soll die Entscheidung sofort sichtbar
    // wirken, und ein halb durchsichtiger Banner faengt keine Klicks mehr ab.
    banner.hidden = true;

    if (vorheriger && document.contains(vorheriger)) vorheriger.focus();
    vorheriger = null;
  };

  // Nimmt die gemerkte Freigabe fuer das Terminformular zurueck. Liegt auf
  // dieser Seite schon ein Tally-Rahmen, muss die Seite neu geladen werden —
  // einen geladenen iframe bekommt man nicht zurueck, nur weg.
  const tallyZuruecknehmen = () => {
    vergessen('tally');
    if (document.querySelector('iframe[src*="tally.so"], iframe[data-tally-src]')) {
      location.reload();
      return;
    }
    banner.querySelector('[data-tally-zeile]').hidden = true;
  };

  const entscheiden = (analyse) => {
    merken('analyse', analyse);
    verbergen();

    if (analyse) {
      analyticsLaden();
      return;
    }

    // Widerruf nach vorheriger Zustimmung: Das Messskript laeuft in diesem
    // Tab schon und laesst sich nicht zurueckholen. Also Cookies loeschen und
    // die Seite frisch laden — danach ist wirklich nichts von Google aktiv.
    analyticsCookiesLoeschen();
    if (laeuft) location.reload();
  };

  /* ── Widerruf ──────────────────────────────────────────────────────────── */

  // <a href="/datenschutz#einwilligung" data-einwilligung-oeffnen>
  // Ohne JavaScript bleibt der Link ein normaler Verweis auf den Abschnitt in
  // der Datenschutzerklaerung — dann gibt es auch nichts zu widerrufen.
  const widerrufVerdrahten = () => {
    document.querySelectorAll('[data-einwilligung-oeffnen]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        zeigen(true);
      });
    });
  };

  /* ── Schnittstelle fuer die Seiten ─────────────────────────────────────── */

  // Die Terminseite fragt hierueber, ob das Formular schon einmal freigegeben
  // wurde, und meldet eine neue Freigabe zurueck. Bleibt diese Datei aus,
  // ist window.Einwilligung schlicht nicht da — die Terminseite faellt dann
  // auf ihr Tor zurueck und fragt wie bisher bei jedem Besuch.
  window.Einwilligung = {
    erteilt: (dienst) => stand(dienst) === true,
    erteilen: (dienst) => merken(dienst, true),
  };

  /* ── Abgleich mit dem gespeicherten Stand ──────────────────────────────── */

  // Bringt die Seite auf den Stand des Speichers. Laeuft beim Aufbau und noch
  // einmal, wenn die Seite aus dem Vor/Zurueck-Speicher zurueckkommt.
  const abgleichen = () => {
    const entscheidung = stand('analyse');

    // Anderswo widerrufen, hier laeuft die Messung noch: Ein geladenes gtag
    // bekommt man nicht zurueck, nur weg — also neu laden.
    if (entscheidung !== true && laeuft) {
      analyticsCookiesLoeschen();
      location.reload();
      return;
    }

    // Dasselbe fuer ein Terminformular, dessen Freigabe inzwischen weg ist.
    if (stand('tally') !== true
        && document.querySelector('iframe[src*="tally.so"], iframe[data-tally-src]')) {
      location.reload();
      return;
    }

    if (entscheidung === null) {
      zeigen(false);
      return;
    }

    if (banner) banner.hidden = true;
    if (entscheidung === true) analyticsLaden();
  };

  /* ── Start ─────────────────────────────────────────────────────────────── */

  const start = () => {
    widerrufVerdrahten();
    abgleichen();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Zurueck-Taste: Der Browser holt die Seite aus dem Vor/Zurueck-Speicher und
  // stellt das DOM wieder her, wie es beim Verlassen war — die Skripte laufen
  // nicht neu. Eine inzwischen woanders getroffene Entscheidung waere hier
  // also nie angekommen: Der Banner staende wieder da, obwohl laengst
  // geantwortet wurde, und schlimmer, eine widerrufene Messung liefe weiter.
  window.addEventListener('pageshow', (e) => { if (e.persisted) abgleichen(); });
})();
