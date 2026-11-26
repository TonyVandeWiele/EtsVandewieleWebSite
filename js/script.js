// Ets Van de Wiele — interactions du site
document.addEventListener('DOMContentLoaded', () => {

  // Toujours repartir du haut au rechargement (comportement souhaité)
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  if (!location.hash) {
    setTimeout(() => window.scrollTo(0, 0), 10);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =======================================================
  // 1. En-tête au scroll + bouton retour en haut
  // =======================================================
  const header = document.getElementById('header');
  const backToTopBtn = document.getElementById('backToTopBtn');

  const handleScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 40);
    if (backToTopBtn) backToTopBtn.classList.toggle('show', y > 600);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  // Au chargement la page est en haut (voir plus haut) : on ne lit la position que
  // si on arrive sur une ancre, et après le premier rendu, pour éviter un recalcul forcé
  if (location.hash) requestAnimationFrame(() => setTimeout(handleScroll, 0));

  // =======================================================
  // 2. Menu actif selon la section visible
  // =======================================================
  const navLinksList = document.querySelectorAll('.nav-links a[href^="#"]');
  const setActiveLink = (id) => {
    navLinksList.forEach(link => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      if (Array.from(navLinksList).some(l => l.getAttribute('href') === `#${id}`)) {
        setActiveLink(id);
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  document.querySelectorAll('main section[id]').forEach(s => spyObserver.observe(s));

  // =======================================================
  // 3. Menu mobile
  // =======================================================
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    const icon = hamburger.querySelector('use');

    const setMenu = (open) => {
      navLinks.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      if (icon) icon.setAttribute('href', open ? '#s-xmark' : '#s-bars');
      if (header) header.classList.toggle('menu-open', open);
    };

    hamburger.addEventListener('click', () => {
      setMenu(hamburger.getAttribute('aria-expanded') !== 'true');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        setMenu(false);
        hamburger.focus();
      }
    });

    window.matchMedia('(min-width: 1081px)').addEventListener('change', (e) => {
      if (e.matches) setMenu(false);
    });
  }

  // =======================================================
  // 4. Apparition discrète des titres de section
  // =======================================================
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  // =======================================================
  // 5. Avis : copie de la liste pour une boucle continue
  // =======================================================
  const reviewLists = document.querySelectorAll('.marquee .review-list');
  if (reviewLists.length === 2 && !reduceMotion) {
    // Copie faite seulement à l'approche de la section : moins de travail au chargement
    const cloneReviews = () => {
      reviewLists[1].innerHTML = reviewLists[0].innerHTML;
      reviewLists[1].querySelectorAll('img').forEach(img => img.setAttribute('alt', ''));
    };
    const marqueeObserver = new IntersectionObserver((entries, obs) => {
      if (entries.some(e => e.isIntersecting)) {
        cloneReviews();
        obs.disconnect();
      }
    }, { rootMargin: '600px 0px' });
    marqueeObserver.observe(reviewLists[0]);
  }

  // =======================================================
  // 6. Notification promo
  // =======================================================
  const promoToast = document.getElementById('promoToast');
  const promoSection = document.getElementById('actu');

  const storage = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { sessionStorage.setItem(key, val); } catch { /* stockage indisponible */ } }
  };

  if (promoToast && promoSection) {
    const dismiss = () => {
      storage.set('promoSeen', 'true');
      promoToast.classList.remove('show');
    };

    if (storage.get('promoSeen')) {
      promoToast.hidden = true;
    } else {
      // La notification n'apparaît qu'après le hero (pour ne pas masquer les boutons)
      // et disparaît quand la section promo est à l'écran.
      let promoInView = false;
      const updateToast = () => {
        if (storage.get('promoSeen')) return;
        const pastHero = window.scrollY > window.innerHeight * 0.7;
        promoToast.classList.toggle('show', pastHero && !promoInView);
      };

      promoToast.querySelector('.toast-action')?.addEventListener('click', dismiss);
      promoToast.querySelector('.toast-close')?.addEventListener('click', dismiss);

      new IntersectionObserver((entries) => {
        entries.forEach(entry => { promoInView = entry.isIntersecting; });
        updateToast();
      }, { threshold: 0.2 }).observe(promoSection);

      window.addEventListener('scroll', updateToast, { passive: true });
    }
  }

  // =======================================================
  // 7. FAQ : afficher plus de questions
  // =======================================================
  const faqList = document.getElementById('faq-list');
  const faqBtn = document.getElementById('faq-show-more');

  if (faqList && faqBtn) {
    const total = faqList.querySelectorAll('.faq-item').length;
    if (total <= 5) {
      faqBtn.hidden = true;
      faqList.classList.remove('is-collapsed');
    }

    faqBtn.addEventListener('click', () => {
      const expanded = faqList.classList.toggle('is-collapsed') === false;
      faqBtn.setAttribute('aria-expanded', String(expanded));
      faqBtn.querySelector('span').textContent = expanded ? 'Voir moins de questions' : 'Voir plus de questions';
      if (!expanded) {
        faqList.querySelectorAll('.faq-item:nth-child(n + 6)').forEach(d => d.removeAttribute('open'));
      }
    });
  }

  // =======================================================
  // 8. Statut du magasin en direct (ouvert / fermé)
  // =======================================================
  // Minutes depuis minuit. 0 = dimanche … 6 = samedi.
  const SCHEDULE = {
    0: [],
    1: [],
    2: [[540, 720], [780, 1110]],
    3: [[540, 720], [780, 1110]],
    4: [[540, 720], [780, 1110]],
    5: [[540, 720], [780, 1110]],
    6: [[540, 720], [780, 960]]
  };
  const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  const fmt = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;

  // Heure belge, quel que soit le fuseau du visiteur
  const belgianNow = () => {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Brussels', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date());
      const get = (t) => parts.find(p => p.type === t).value;
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
      return { day, minutes: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch {
      const d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  };

  const computeStatus = () => {
    const { day, minutes } = belgianNow();
    const today = SCHEDULE[day];
    const slot = today.find(([s, e]) => minutes >= s && minutes < e);
    const base = { day, minutes, today };

    if (slot) {
      return { ...base, open: true, short: `jusqu'à ${fmt(slot[1])}` };
    }

    const laterToday = today.find(([s]) => s > minutes);
    if (laterToday) {
      return { ...base, open: false, short: `rouvre à ${fmt(laterToday[0])}` };
    }

    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if (SCHEDULE[d].length) {
        const when = i === 1 ? 'demain' : DAY_NAMES[d];
        return { ...base, open: false, short: `rouvre ${when} à ${fmt(SCHEDULE[d][0][0])}` };
      }
    }
    return { ...base, open: false, short: '' };
  };

  // Remplit un indicateur « mot + détail » (barre du haut, carte contact)
  const fillBadge = (el, status) => {
    if (!el) return;
    el.classList.toggle('is-open', status.open);
    el.classList.toggle('is-closed', !status.open);
    el.querySelector('.status-word').textContent = status.open ? 'Ouvert' : 'Fermé';
    el.querySelector('.status-detail').textContent = status.short;
  };

  // Frise de la journée : plages d'ouverture + repère « maintenant » (de 8:00 à 19:30)
  const DAY_START = 480;
  const DAY_END = 1170;
  const pct = (min) => `${((min - DAY_START) / (DAY_END - DAY_START)) * 100}%`;

  const renderDayBar = (bar, status) => {
    if (!bar) return;
    bar.hidden = false;
    bar.replaceChildren();

    if (!status.today.length) {
      const off = document.createElement('p');
      off.className = 'day-bar-off';
      off.textContent = 'Fermé toute la journée';
      bar.appendChild(off);
      return;
    }

    const track = document.createElement('div');
    track.className = 'day-bar-track';
    status.today.forEach(([s, e]) => {
      const seg = document.createElement('span');
      seg.className = 'day-bar-slot';
      if (status.minutes >= e) seg.classList.add('is-past');
      seg.style.left = pct(s);
      seg.style.width = `calc(${pct(e)} - ${pct(s)})`;
      track.appendChild(seg);
    });
    if (status.minutes > DAY_START && status.minutes < DAY_END) {
      const now = document.createElement('span');
      now.className = 'day-bar-now';
      now.style.left = pct(status.minutes);
      track.appendChild(now);
    }
    bar.appendChild(track);

    const labels = document.createElement('p');
    labels.className = 'day-bar-labels';
    labels.textContent = status.today.map(([s, e]) => `${fmt(s)}–${fmt(e)}`).join('  ·  ');
    bar.appendChild(labels);
  };

  const updateShopStatus = () => {
    const status = computeStatus();
    const dayName = DAY_NAMES[status.day];

    // Pancarte du hero
    const sign = document.querySelector('.shop-sign');
    if (sign) {
      sign.classList.toggle('is-open', status.open);
      sign.classList.toggle('is-closed', !status.open);
      document.getElementById('hero-day').textContent = `Aujourd'hui, ${dayName}`;
      document.getElementById('hero-state').textContent = status.open ? 'Ouvert' : 'Fermé';
      const detail = document.getElementById('hero-status-detail');
      if (detail) detail.textContent = status.short ? `${status.short.charAt(0).toUpperCase()}${status.short.slice(1)}` : '';
      renderDayBar(document.getElementById('hero-daybar'), status);
    }

    fillBadge(document.getElementById('shop-status-badge'), status);
    fillBadge(document.getElementById('shop-status'), status);

    // Ligne du jour dans les horaires
    document.querySelectorAll('.schedule-row').forEach(row => {
      const days = (row.dataset.days || '').split(',').map(Number);
      row.classList.toggle('is-today', days.includes(status.day));
    });
  };
  updateShopStatus();
  setInterval(updateShopStatus, 60000);

  // =======================================================
  // 9. Onglets des saisons (souris + clavier)
  // =======================================================
  const tabs = Array.from(document.querySelectorAll('.season-tabs .tab-btn'));

  const activateTab = (tab, focus = false) => {
    tabs.forEach(t => {
      const selected = t === tab;
      t.classList.toggle('active', selected);
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.classList.toggle('active', selected);
    });

    // Ambiance de la section : couleurs et grand nom de la saison
    const section = document.getElementById('actu');
    if (section && tab.dataset.season) section.dataset.season = tab.dataset.season;
    const ghost = document.getElementById('season-ghost');
    if (ghost && tab.dataset.label) ghost.textContent = tab.dataset.label;

    if (focus) tab.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        activateTab(next, true);
      }
    });
  });
});
