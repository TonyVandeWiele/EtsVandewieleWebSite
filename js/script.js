// Exécute le code uniquement lorsque le DOM (la structure HTML) est entièrement chargé
document.addEventListener('DOMContentLoaded', () => {

  // =======================================================
  // 1. Navbar Scroll Effect & Barre de progression de lecture
  // =======================================================

  const header = document.getElementById('header');
  const scrollProgress = document.getElementById("scrollProgress");

  // Fonction unique gérant tous les événements de défilement pour l'efficacité
  const handleScroll = () => {
    // Effet de la barre de navigation
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }

    // Barre de progression de lecture
    if (scrollProgress) {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      scrollProgress.style.width = scrolled + "%";
    }

    // Déclenche l'animation d'apparition des éléments (reveal)
    reveal();
  };

  // Écouteur d'événement de défilement
  window.addEventListener('scroll', handleScroll);


  // =======================================================
  // 2. Menu Mobile (Hamburger Menu)
  // =======================================================

  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    // Bascule la classe 'active' pour afficher/masquer le menu mobile
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Ferme le menu mobile lorsqu'un lien de navigation est cliqué
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        // Délai court pour laisser le temps à l'ancre de se déclencher
        setTimeout(() => {
          navLinks.classList.remove('active');
        }, 100);
      });
    });
  }

  // =======================================================
  // 3. Animation Reveal (Apparition au scroll)
  // =======================================================

  const revealElements = document.querySelectorAll('.reveal-up');

  // Fonction gérant l'apparition des éléments au scroll
  function reveal() {
    const windowHeight = window.innerHeight;
    const elementVisible = 100; // Déclenche l'animation 100px avant que l'élément n'arrive en bas de l'écran

    revealElements.forEach(el => {
      const elementTop = el.getBoundingClientRect().top;

      if (elementTop < windowHeight - elementVisible && !el.classList.contains('active')) {
        // Ajout de 'active' uniquement si elle n'est pas déjà présente
        el.classList.add('active');
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }
    });
  }

  // 3.1. Initialisation des styles et délais
  revealElements.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(50px)";
    // Ajout de la transition directement ici pour éviter d'alourdir le CSS global
    el.style.transition = "all 0.8s ease";

    // Gestion des délais d'animation
    if (el.classList.contains('delay-100')) {
      el.style.transitionDelay = "0.1s";
    } else if (el.classList.contains('delay-200')) {
      el.style.transitionDelay = "0.2s";
    } else if (el.classList.contains('delay-300')) {
      el.style.transitionDelay = "0.3s";
    }
  });

  // 3.2. Déclenchement initial
  // Exécute la fonction une première fois pour les éléments déjà visibles au chargement
  reveal();


// =======================================================
// 4. Carrousel Témoignages (RÉPARATION DÉCALAGE FINAL)
// =======================================================

  const carousel = document.getElementById('testimonialsCarousel');
  const slides = carousel ? carousel.querySelectorAll('.carousel-slide') : [];
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const indicatorsContainer = document.getElementById('carouselIndicators');

  let currentIndex = 0;
  const totalSlides = slides.length;

  if (carousel && totalSlides > 0) {
    // 1. DÉFINIR LA LARGEUR TOTALE DU CONTENEUR FLEXBOX (Ex: 300% pour 3 slides)
    // Ceci est la ligne de code critique pour le dimensionnement du carrousel.
    carousel.style.width = `${totalSlides * 100}%`;

    // 2. LOGIQUE DU CARROUSEL

    // Crée les points indicateurs
    slides.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.classList.add('indicator-dot');
      if (index === 0) {
        dot.classList.add('active');
      }
      dot.addEventListener('click', () => {
        goToSlide(index);
      });
      indicatorsContainer.appendChild(dot);
    });

    const dots = indicatorsContainer.querySelectorAll('.indicator-dot');

    function updateCarousel() {
      // Le décalage est par tranches de 100% / N (Ex: 100 / 3 = 33.333%)
      const slideWidthPercentage = 100 / totalSlides;
      const offset = -currentIndex * slideWidthPercentage;

      // Applique la translation
      carousel.style.transform = `translateX(${offset}%)`;

      // Met à jour les indicateurs
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    }

    function goToSlide(index) {
      currentIndex = index;
      updateCarousel();
    }

    // Navigation: Suivant
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateCarousel();
    });

    // Navigation: Précédent
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateCarousel();
    });

    // Bonus : Carrousel automatique (Logique conservée)
    let autoSlide = setInterval(() => {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateCarousel();
    }, 8000);

    const pauseInterval = () => clearInterval(autoSlide);
    const resumeInterval = () => {
      pauseInterval();
      autoSlide = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
      }, 8000);
    };

    carousel.addEventListener('mouseenter', pauseInterval);
    carousel.addEventListener('mouseleave', resumeInterval);
  }
});
