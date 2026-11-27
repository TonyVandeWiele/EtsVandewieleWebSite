// Ets Van de Wiele — animations au scroll (GSAP + ScrollTrigger, hébergés dans js/vendor)
// Tout est facultatif : sans ce fichier, ou si le visiteur préfère moins d'animations,
// le site s'affiche normalement.
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('has-motion');

  const mm = gsap.matchMedia();
  const EASE = 'power3.out';

  // =======================================================
  // 1. Hero : la photo glisse plus lentement que le texte (profondeur)
  // =======================================================
  const hero = document.querySelector('.hero');
  if (hero) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    tl.to('.hero > picture', { yPercent: 18, ease: 'none' }, 0)
      .to('.hero-inner', { y: -60, autoAlpha: 0.15, ease: 'none' }, 0);
  }

  // =======================================================
  // 2. Bandeau photo : parallaxe + texte qui arrive
  // =======================================================
  const band = document.querySelector('.action-band');
  if (band) {
    gsap.fromTo('.action-band-img', { yPercent: -8 }, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: true }
    });

    gsap.from('.action-band-inner > *', {
      y: 40,
      autoAlpha: 0,
      duration: 0.9,
      ease: EASE,
      stagger: 0.12,
      scrollTrigger: { trigger: band, start: 'top 70%', once: true }
    });
  }

  // =======================================================
  // 3. Cartes : arrivée en léger relief, par groupes
  // =======================================================
  const cardSelector = '.service-card, .category-card';
  gsap.set(cardSelector, { autoAlpha: 0, y: 48, rotationX: 10, transformPerspective: 900, transformOrigin: '50% 100%' });

  ScrollTrigger.batch(cardSelector, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      autoAlpha: 1,
      y: 0,
      rotationX: 0,
      duration: 0.9,
      ease: EASE,
      stagger: 0.1,
      overwrite: true,
      onComplete() { this.targets().forEach(el => el.classList.add('is-in')); }
    })
  });

  // Inclinaison 3D qui suit la souris (ordinateur uniquement)
  mm.add('(hover: hover) and (pointer: fine)', () => {
    const cards = document.querySelectorAll(cardSelector);
    const cleanups = [];

    cards.forEach(card => {
      const max = card.classList.contains('service-card') ? 5 : 4;
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power2.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power2.out' });

      const move = (e) => {
        if (!card.classList.contains('is-in')) return;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * max * 2);
        rx((0.5 - py) * max * 2);
        card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      };
      const leave = () => { rx(0); ry(0); };

      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', leave);
      cleanups.push(() => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', leave);
        gsap.set(card, { rotationX: 0, rotationY: 0 });
      });
    });

    return () => cleanups.forEach(fn => fn());
  });

  // =======================================================
  // 4. Histoire : chiffre qui défile + frise qui se dessine
  // =======================================================
  const stat = document.querySelector('.history-stat strong');
  if (stat) {
    const match = stat.textContent.match(/^(\d+)(.*)$/);
    if (match) {
      const target = Number(match[1]);
      const suffix = match[2];
      const counter = { n: 0 };
      // Les lecteurs d'écran lisent directement la valeur finale
      const srText = document.createElement('span');
      srText.className = 'sr-only';
      srText.textContent = stat.textContent;
      stat.before(srText);
      stat.setAttribute('aria-hidden', 'true');
      stat.textContent = `0${suffix}`;
      gsap.to(counter, {
        n: target,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: stat, start: 'top 85%', once: true },
        onUpdate() { stat.textContent = `${Math.round(counter.n)}${suffix}`; }
      });
    }
  }

  document.querySelectorAll('.timeline-row').forEach(row => {
    gsap.from(row.children, {
      y: 24,
      autoAlpha: 0,
      duration: 0.8,
      ease: EASE,
      stagger: 0.08,
      scrollTrigger: {
        trigger: row,
        start: 'top 82%',
        once: true,
        onEnter: () => row.classList.add('is-in')
      }
    });
  });

  // Les images chargées en différé changent la hauteur de la page : on recalcule
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
