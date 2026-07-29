/* ==========================================================================
   Joanna – Mobile Tierphysiotherapie
   --------------------------------------------------------------------------
   Ersetzt die DCLogic-Komponente aus dem Claude-Design-Projekt. Dort lief das
   ueber React; hier reicht der Browser. Alles haengt an data-Attributen, damit
   dieselbe Datei auf allen Seiten funktioniert — fehlt ein Baustein auf einer
   Seite, passiert schlicht nichts.
   ========================================================================== */

(() => {
  'use strict';

  /* ── Mobiles Menue ────────────────────────────────────────────────────── */

  const menu = document.querySelector('[data-menu]');
  const burger = document.querySelector('[data-menu-toggle]');

  if (menu && burger) {
    const setOpen = (open) => {
      menu.toggleAttribute('data-open', open);
      burger.setAttribute('aria-expanded', String(open));
    };

    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', () => setOpen(!menu.hasAttribute('data-open')));

    // Die Links im Menue springen zu Ankern auf derselben Seite. Ohne
    // Schliessen bliebe das Panel ueber dem Ziel stehen.
    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setOpen(false));
    });

    // Tippen ausserhalb schliesst das Menue. Bewusst pointerdown statt click:
    // iOS Safari feuert click nicht zuverlaessig, wenn man auf eine nicht
    // interaktive Flaeche (Body, Section) tippt — dann bliebe das Menue offen.
    // Ausgenommen sind das Panel selbst (sonst ginge es beim Antippen darin
    // sofort zu) und der Burger (der toggelt schon per eigenem click; ohne
    // Ausnahme wuerde pointerdown erst schliessen und der Klick wieder oeffnen).
    document.addEventListener('pointerdown', (e) => {
      if (!menu.hasAttribute('data-open')) return;
      if (menu.contains(e.target) || burger.contains(e.target)) return;
      setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* ── Aufklapper "Weiterlesen" ─────────────────────────────────────────── */

  // <button data-more-toggle="ueber" data-label-open="Weniger anzeigen">
  // <div class="more" data-more="ueber">
  document.querySelectorAll('[data-more-toggle]').forEach((btn) => {
    const panel = document.querySelector(`[data-more="${btn.dataset.moreToggle}"]`);
    if (!panel) return;

    const labelEl = btn.querySelector('[data-more-label]') || btn;
    const closed = btn.dataset.labelClosed || labelEl.textContent.trim();
    const open = btn.dataset.labelOpen || 'Weniger';

    panel.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');

    // Optionaler weiterer Bereich, der mit demselben Knopf auf-/zugeht — mobil
    // wird so ein zusaetzlicher Absatz eingeklappt (siehe .ueber-p2 im CSS).
    const scope = btn.closest('[data-more-scope]');

    btn.addEventListener('click', () => {
      const nowOpen = !panel.hasAttribute('data-open');
      panel.toggleAttribute('data-open', nowOpen);
      panel.setAttribute('aria-hidden', String(!nowOpen));
      btn.setAttribute('aria-expanded', String(nowOpen));
      labelEl.textContent = nowOpen ? open : closed;
      if (scope) scope.toggleAttribute('data-open', nowOpen);
    });
  });

  /* ── Ueber-mich Flip-Karte ────────────────────────────────────────────── */

  // Macht aus den zwei gestapelten Seiten eine 3D-Karte. Ohne JS bleibt der
  // gestapelte Fallback stehen. Die Karten-Hoehe folgt der sichtbaren Seite —
  // auch wenn sich diese durch "mehr lesen" aendert.
  document.querySelectorAll('[data-flip]').forEach((flip) => {
    const inner = flip.querySelector('.flip-inner');
    const front = flip.querySelector('.flip-front');
    const back = flip.querySelector('.flip-back');
    if (!inner || !front || !back) return;
    const frontPad = front.querySelector('.flip-pad');
    const backPad = back.querySelector('.flip-pad');

    flip.setAttribute('data-enhanced', '');

    const resize = () => {
      const pad = flip.hasAttribute('data-flipped') ? backPad : frontPad;
      inner.style.height = pad.offsetHeight + 'px';
    };

    // Die abgewandte Seite ist optisch weg (backface-visibility), fuer
    // Screenreader aber weiterhin da — deshalb ausblenden.
    const setSide = (toBack) => {
      front.setAttribute('aria-hidden', String(toBack));
      back.setAttribute('aria-hidden', String(!toBack));
    };
    setSide(false);

    const show = (side) => {
      const toBack = side === 'back';
      flip.toggleAttribute('data-flipped', toBack);
      setSide(toBack);
      resize();
      const target = toBack ? back : front;
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };

    flip.querySelectorAll('[data-flip-to]').forEach((btn) => {
      btn.addEventListener('click', () => show(btn.dataset.flipTo));
    });

    // Die Kartenhoehe folgt automatisch der aktiven Seite — auch waehrend
    // "mehr lesen" auf-/zuklappt oder ein Bild nachlaedt. Kein Timing-Raten.
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(resize);
      ro.observe(frontPad);
      ro.observe(backPad);
    } else {
      resize();
      window.addEventListener('resize', resize);
    }
  });

  /* ── Einblenden beim Scrollen ─────────────────────────────────────────── */

  // Die Startwerte setzt erst JS (data-reveal-armed). Ohne JS oder ohne
  // IntersectionObserver bleibt der Inhalt einfach sichtbar.
  const reveals = document.querySelectorAll('[data-reveal]');
  const mag = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (reveals.length && !mag.matches && 'IntersectionObserver' in window) {
    reveals.forEach((el) => el.setAttribute('data-reveal-armed', ''));

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute('data-reveal-shown', '');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach((el) => io.observe(el));
  }
})();
