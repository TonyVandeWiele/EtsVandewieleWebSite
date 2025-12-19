// Exécute le code uniquement lorsque le DOM est entièrement chargé
document.addEventListener('DOMContentLoaded', () => {

  // Force Scroll Top on Reload (Fix User Request)
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Timeout nécessaire pour contrer le comportement natif du navigateur sur les ancres
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 10);


  // =======================================================
  // 1. Navbar Scroll Effect & Barre de progression
  // =======================================================

  const header = document.getElementById('header');
  const scrollProgress = document.getElementById("scrollProgress");
  const backToTopBtn = document.getElementById("backToTopBtn");

  const handleScroll = () => {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }

    if (backToTopBtn) {
      backToTopBtn.classList.toggle('show', window.scrollY > 300);
    }

    if (scrollProgress) {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      scrollProgress.style.width = scrolled + "%";
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });


  // =======================================================
  // 2. Menu Mobile (Hamburger Menu)
  // =======================================================

  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        setTimeout(() => {
          navLinks.classList.remove('active');
        }, 100);
      });
    });
  }

  // =======================================================
  // 3. Animation Reveal (IntersectionObserver - Performance)
  // =======================================================

  const revealElements = document.querySelectorAll('.reveal-up');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('active');
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
        revealObserver.unobserve(el); // On arrête d'observer une fois animé
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.8s cubic-bezier(0.2, 1, 0.3, 1)";

    // Gestion des délais
    const delays = { 'delay-100': '0.1s', 'delay-200': '0.2s', 'delay-300': '0.3s' };
    Object.keys(delays).forEach(d => {
      if (el.classList.contains(d)) el.style.transitionDelay = delays[d];
    });

    revealObserver.observe(el);
  });


  // =======================================================
  // 4. Carrousel Témoignages (Maintenant Géré en CSS Puro 'Marquee')
  // =======================================================
  // L'ancien code JS a été retiré pour laisser place à l'animation CSS fluide.


  // =======================================================
  // 5. Smart Promo Toast
  // =======================================================

  const promoToast = document.getElementById('promoToast');
  const closeToastBtn = document.getElementById('closeToast');
  const promoSection = document.getElementById('actu');

  if (promoToast && promoSection) {
    setTimeout(() => {
      if (!sessionStorage.getItem('toastClosed')) {
        promoToast.classList.add('show');
      }
    }, 4000);

    if (closeToastBtn) {
      closeToastBtn.addEventListener('click', () => {
        promoToast.classList.remove('show');
        sessionStorage.setItem('toastClosed', 'true');
      });
    }

    const toastObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          promoToast.classList.remove('show');
        } else if (!sessionStorage.getItem('toastClosed') && window.scrollY > 100) {
          promoToast.classList.add('show');
        }
      });
    }, { threshold: 0.3 });

    toastObserver.observe(promoSection);
  }


  // =======================================================
  // 6. Accordéon FAQ
  // =======================================================

  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const currentActive = document.querySelector('.faq-question.active');
      if (currentActive && currentActive !== question) {
        currentActive.classList.remove('active');
        currentActive.nextElementSibling.style.maxHeight = null;
      }

      question.classList.toggle('active');
      const answer = question.nextElementSibling;
      answer.style.maxHeight = question.classList.contains('active') ? answer.scrollHeight + "px" : null;
    });
  });


  // =======================================================
  // 7. Logique Horaires (Ouvert / Fermé)
  // =======================================================

  function updateShopStatus() {
    const statusContainer = document.getElementById('shop-status');
    const headerDot = document.getElementById('header-status-dot');
    if (!statusContainer && !headerDot) return;

    const now = new Date();
    const day = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const schedule = {
      1: [], // Lundi
      2: [{ start: 540, end: 720 }, { start: 780, end: 1110 }],
      3: [{ start: 540, end: 720 }, { start: 780, end: 1110 }],
      4: [{ start: 540, end: 720 }, { start: 780, end: 1110 }],
      5: [{ start: 540, end: 720 }, { start: 780, end: 1110 }],
      6: [{ start: 540, end: 720 }, { start: 780, end: 960 }],
      0: [] // Dimanche
    };

    const todaySchedule = schedule[day];
    const isOpen = todaySchedule.length > 0 && todaySchedule.some(slot => currentTime >= slot.start && currentTime < slot.end);

    if (statusContainer) {
      const statusText = statusContainer.querySelector('.status-text');
      statusContainer.classList.toggle('open', isOpen);
      statusContainer.classList.toggle('closed', !isOpen);
      statusText.textContent = isOpen ? "Magasin Ouvert actuellement" : "Magasin Fermé actuellement";
    }

    
    const badge = document.getElementById('shop-status-badge');
    if (badge) {
      badge.textContent = isOpen ? "OUVERT" : "FERMÉ";
      badge.className = isOpen ? "status-badge open" : "status-badge closed";
    }

  }

  updateShopStatus();
  // Mise à jour toutes les minutes
  setInterval(updateShopStatus, 60000);

  // --------------------------------------------------------------------------
  // 8. HERO 3D PARALLAX EFFECT
  // --------------------------------------------------------------------------
  const heroSection = document.querySelector('.hero-3d-section');
  const heroCard = document.getElementById('heroCard3D');

  if (heroSection && heroCard) {
    heroSection.addEventListener('mousemove', (e) => {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 25; // Rotation X
      const yAxis = (window.innerHeight / 2 - e.pageY) / 25; // Rotation Y

      heroCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    // Reset à la sortie de la souris pour fluidité
    heroSection.addEventListener('mouseleave', () => {
      heroCard.style.transform = `rotateY(0deg) rotateX(0deg)`;
      heroCard.style.transition = 'all 0.5s ease';
    });

    // Retirer la transition lors du mouvement pour éviter le lag
    heroSection.addEventListener('mouseenter', () => {
      heroCard.style.transition = 'none';
    });
  }

  // --------------------------------------------------------------------------
  // 9. GESTION DES ONGLETS SAISONS (EXISTANT)
  // --------------------------------------------------------------------------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const seasonContents = document.querySelectorAll('.season-content');

  // SUPPRIME CETTE LIGNE :
  // setTimeout(reveal, 100); 

  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const season = btn.getAttribute('data-season');

        // 1. Mise à jour visuelle des boutons
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 2. Gestion du contenu
        seasonContents.forEach(c => {
          c.classList.remove('active');
        });

        const targetContent = document.getElementById(`season-${season}`);
        if (targetContent) {
          targetContent.classList.add('active');
          // SUPPRIME CETTE LIGNE AUSSI :
          // reveal(); 
        }
      });
    });
  }

});
