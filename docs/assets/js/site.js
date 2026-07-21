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

    // stopPropagation, damit dieser Klick nicht gleich beim
    // Aussenklick-Handler unten wieder als "ausserhalb" ankommt.
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!menu.hasAttribute('data-open'));
    });

    // Die Links im Menue springen zu Ankern auf derselben Seite. Ohne
    // Schliessen bliebe das Panel ueber dem Ziel stehen.
    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setOpen(false));
    });

    // Tippen ausserhalb schliesst das Menue. Klicks im Panel selbst nicht —
    // sonst ginge es beim Scrollen/Antippen im Menue sofort wieder zu.
    document.addEventListener('click', (e) => {
      if (menu.hasAttribute('data-open') && !menu.contains(e.target)) setOpen(false);
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

    btn.addEventListener('click', () => {
      const nowOpen = !panel.hasAttribute('data-open');
      panel.toggleAttribute('data-open', nowOpen);
      panel.setAttribute('aria-hidden', String(!nowOpen));
      btn.setAttribute('aria-expanded', String(nowOpen));
      labelEl.textContent = nowOpen ? open : closed;
    });
  });

  /* ── Leistungs-Slider ─────────────────────────────────────────────────── */

  const track = document.querySelector('[data-svc-track]');

  if (track) {
    // Um genau eine Karte weiterschieben. Die 24 px sind der gap aus dem CSS;
    // faellt die Kartenmessung aus, bleibt ein Bildschirm-Naeherungswert.
    const step = () => {
      const card = track.querySelector('.svc-card');
      return card ? card.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    };

    document.querySelectorAll('[data-svc-scroll]').forEach((btn) => {
      const dir = btn.dataset.svcScroll === 'prev' ? -1 : 1;
      btn.addEventListener('click', () => track.scrollBy({ left: dir * step(), behavior: 'smooth' }));
    });
  }

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
