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
  const FASSUNG = 1;          // hochzaehlen, wenn neue Dienste dazukommen
  const GUELTIG_TAGE = 365;   // danach wird erneut gefragt (Empfehlung der DSK)
  const MESS_ID = 'G-WHWF9CP9E3';

  /* ── Gespeicherte Entscheidung ─────────────────────────────────────────── */

  // Gibt true, false oder null zurueck. null heisst: noch nicht gefragt,
  // Fassung veraltet oder abgelaufen — in allen drei Faellen wird gefragt.
  const gespeichert = () => {
    let roh;
    // Im privaten Modus mancher Browser wirft schon der Zugriff.
    try { roh = localStorage.getItem(SCHLUESSEL); } catch { return null; }
    if (!roh) return null;

    try {
      const eintrag = JSON.parse(roh);
      if (eintrag.fassung !== FASSUNG) return null;
      if (Date.now() - eintrag.zeit > GUELTIG_TAGE * 86400000) return null;
      return eintrag.analyse === true;
    } catch {
      return null;
    }
  };

  const merken = (analyse) => {
    try {
      localStorage.setItem(SCHLUESSEL, JSON.stringify({
        fassung: FASSUNG,
        analyse,
        zeit: Date.now(),
      }));
    } catch {
      // Kein Speicher verfuegbar: Die Entscheidung gilt dann nur fuer diesen
      // Besuch und wird beim naechsten Aufruf erneut erfragt. Lieber einmal
      // zu viel fragen als ungefragt messen.
    }
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

    // Absolute Pfade: 404.html wird von GitHub Pages auch unter tiefen
    // Adressen ausgeliefert, relative Verweise zeigten dort ins Leere.
    el.innerHTML = `
      <h2 id="einwilligung-titel">Darf ich mitzählen?</h2>
      <p id="einwilligung-text">Mit Google Analytics würde ich gern sehen, welche Seiten gelesen
        werden — das hilft mir, die Website zu verbessern. Dabei werden Cookies auf deinem Gerät
        gespeichert und Daten an Google übertragen, auch in die USA. Nötig ist das nicht: Die
        Website funktioniert ohne genauso.</p>
      <div class="einwilligung-knoepfe">
        <button type="button" data-einwilligung="nein">Ablehnen</button>
        <button type="button" data-einwilligung="ja">Einverstanden</button>
      </div>
      <p class="einwilligung-fuss">Du kannst das jederzeit ändern.
        <a href="/datenschutz.html">Datenschutz</a> · <a href="/impressum.html">Impressum</a></p>`;

    el.querySelectorAll('[data-einwilligung]').forEach((btn) => {
      btn.addEventListener('click', () => entscheiden(btn.dataset.einwilligung === 'ja'));
    });

    // Ganz vorn im Body, nicht am Ende: So ist der Banner fuer Tastatur und
    // Screenreader das Erste auf der Seite. Sichtbar sitzt er trotzdem unten,
    // das macht position:fixed im CSS.
    document.body.insertBefore(el, document.body.firstChild);
    return el;
  };

  const zeigen = (fokussieren) => {
    banner = banner || bannerBauen();
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

  const entscheiden = (analyse) => {
    merken(analyse);
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

  // <a href="datenschutz.html#einwilligung" data-einwilligung-oeffnen>
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

  /* ── Start ─────────────────────────────────────────────────────────────── */

  const start = () => {
    widerrufVerdrahten();

    const entscheidung = gespeichert();
    if (entscheidung === true) analyticsLaden();
    else if (entscheidung === null) zeigen(false);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
