/* ═══════════════════════════════════════════════════════════════════
   KYÔ DIGITAL — script.js  (Refonte Stratégique v2.0)
   ───────────────────────────────────────────────────────────────────
   Fonctionnalités :
     · Préchargeur animé (conservé)
     · Curseur dynamique (conservé)
     · Système de slides plein écran (conservé)
     · Navigation clavier + swipe tactile (conservé)
     · Canvas particules Hero (conservé)
     · Pré-remplissage formulaire via boutons "Sélectionner" (nouveau)
     · Soumission formulaire → WhatsApp Direct (nouveau)
     · Message WhatsApp formaté (nouveau)
   ───────────────────────────────────────────────────────────────────
   WhatsApp : https://wa.me/22791040181
═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════════════════════════════════════
   RÉFÉRENCES DOM
════════════════════════════════════════════════════════════════════ */
const preloader       = document.getElementById('preloader');
const preloaderFill   = document.getElementById('preloaderFill');
const preloaderPct    = document.getElementById('preloaderPct');
const cursor          = document.getElementById('cursor');
const cursorDot       = document.getElementById('cursor-dot');
const scrollFill      = document.getElementById('scroll-fill');
const slidesWrapper   = document.getElementById('slides-wrapper');
const slides          = document.querySelectorAll('.slide');
const navDots         = document.querySelectorAll('.nav-dot');
const hamburger       = document.getElementById('hamburger');
const mobileMenu      = document.getElementById('mobile-menu');
const contactForm     = document.getElementById('contactForm');
const formSuccess     = document.getElementById('formSuccess');
const submitBtn       = document.getElementById('submitBtn');
const currentSlideNum = document.getElementById('currentSlideNum');
const navbar          = document.getElementById('navbar');

/* ── Constantes ── */
const TOTAL_SLIDES   = slides.length;
const WHATSAPP_NUMBER = '22791040181';   // Numéro WhatsApp KYÔ DIGITAL

/* ── État de l'application ── */
let currentSlide = 0;
let isScrolling  = false;

/* ════════════════════════════════════════════════════════════════════
   PRÉCHARGEUR — Conservé intégralement
   Simule un chargement progressif avec barre et pourcentage
════════════════════════════════════════════════════════════════════ */
(function runPreloader() {
  let pct = 0;

  const interval = setInterval(() => {
    // Progression aléatoire naturelle
    pct += Math.random() * 12 + 3;

    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);

      // Attendre 400ms puis masquer le préchargeur
      setTimeout(() => {
        preloader.classList.add('hidden');
        initApp();
      }, 400);
    }

    // Mise à jour barre + pourcentage
    preloaderFill.style.width = pct + '%';
    preloaderPct.textContent  = Math.round(pct) + '%';
  }, 60);
})();

/* ════════════════════════════════════════════════════════════════════
   INITIALISATION — Lance tous les modules après le préchargeur
════════════════════════════════════════════════════════════════════ */
function initApp() {
  initCursor();
  initParticles();
  initFormHandlers();
  goToSlide(0);
  navbar.classList.add('scrolled');   // Navbar toujours visible (single-page)
}

/* ════════════════════════════════════════════════════════════════════
   SYSTÈME DE SLIDES — Plein écran, transitions verticales
   Conservé intégralement + mise à jour pour 4 slides
════════════════════════════════════════════════════════════════════ */

/**
 * Navigue vers un slide par son index (0-based).
 * @param {number} index - Index du slide cible
 */
function goToSlide(index) {
  if (index < 0 || index >= TOTAL_SLIDES) return;

  const prev    = currentSlide;
  currentSlide  = index;

  // ── Repositionnement des slides via transform translateY ──
  slides.forEach((slide, i) => {
    slide.style.transform = `translateY(${(i - currentSlide) * 100}%)`;
    slide.classList.remove('is-active');

    if (i === currentSlide) {
      // Petit délai pour que la transition CSS joue avant les reveals
      setTimeout(() => slide.classList.add('is-active'), 100);
    }
  });

  // ── Mise à jour des dots de navigation ──
  navDots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));

  // ── Compteur de slide ──
  currentSlideNum.textContent = String(currentSlide + 1).padStart(2, '0');

  // ── Barre de progression ──
  scrollFill.style.width = ((currentSlide / (TOTAL_SLIDES - 1)) * 100) + '%';
}

/* ── Throttle du scroll — empêche les transitions trop rapides ── */
function onWheel(e) {
  if (isScrolling) return;

  // Autoriser le scroll interne sur les slides avec overflow
  const activeSlide = slides[currentSlide];
  if (activeSlide.scrollHeight > activeSlide.clientHeight) {
    const atTop    = activeSlide.scrollTop === 0;
    const atBottom = activeSlide.scrollTop + activeSlide.clientHeight >= activeSlide.scrollHeight - 1;
    if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) return;
  }

  isScrolling = true;

  if (e.deltaY > 0) goToSlide(currentSlide + 1);
  else               goToSlide(currentSlide - 1);

  // Délai de sécurité — empêche les slides multiples
  setTimeout(() => { isScrolling = false; }, 1100);
}

/* ── Navigation tactile — swipe vertical (iPhone / Android) ── */
let touchStartY = 0;
let touchStartX = 0;

function onTouchStart(e) {
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
}

function onTouchEnd(e) {
  const dy = touchStartY - e.changedTouches[0].clientY;
  const dx = touchStartX - e.changedTouches[0].clientX;

  // Swipe vertical dominant (> 50px) → changer de slide
  if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 50) {
    if (dy > 0) goToSlide(currentSlide + 1);
    else         goToSlide(currentSlide - 1);
  }
}

/* ── Navigation clavier ── */
function onKeyDown(e) {
  // Ignorer si le menu mobile est ouvert
  if (mobileMenu && !mobileMenu.hidden) return;

  switch (e.key) {
    case 'ArrowDown':
    case 'PageDown':
      e.preventDefault();
      goToSlide(currentSlide + 1);
      break;
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault();
      goToSlide(currentSlide - 1);
      break;
    case 'Home':
      e.preventDefault();
      goToSlide(0);
      break;
    case 'End':
      e.preventDefault();
      goToSlide(TOTAL_SLIDES - 1);
      break;
    case 'Escape':
      if (hamburger.classList.contains('open')) toggleMobileMenu();
      break;
  }
}

/* ── Listeners ── */
window.addEventListener('wheel',      onWheel,      { passive: true });
window.addEventListener('touchstart', onTouchStart, { passive: true });
window.addEventListener('touchend',   onTouchEnd,   { passive: true });
window.addEventListener('keydown',    onKeyDown);

/* ── Reflow sur resize / orientation change ── */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    slides.forEach((slide, i) => {
      slide.style.transform = `translateY(${(i - currentSlide) * 100}%)`;
    });
  }, 150);
}, { passive: true });

/* ════════════════════════════════════════════════════════════════════
   MENU MOBILE — Hamburger toggle
════════════════════════════════════════════════════════════════════ */
function toggleMobileMenu() {
  const open = hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);

  if (open) {
    mobileMenu.removeAttribute('hidden');
    requestAnimationFrame(() => mobileMenu.classList.add('visible'));
  } else {
    mobileMenu.setAttribute('hidden', '');
  }
}

/**
 * Navigation depuis le menu mobile — ferme le menu et va au slide.
 * @param {number} idx - Index du slide
 */
function mobileNav(idx) {
  goToSlide(idx);
  if (hamburger.classList.contains('open')) toggleMobileMenu();
}

hamburger.addEventListener('click', toggleMobileMenu);

/* ════════════════════════════════════════════════════════════════════
   CURSEUR DYNAMIQUE — Desktop uniquement (pointer: fine)
   Conservé intégralement
════════════════════════════════════════════════════════════════════ */
function initCursor() {
  // Uniquement sur les appareils avec pointeur précis (souris)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  let cx = -100, cy = -100;  // Position cible (souris)
  let dx = -100, dy = -100;  // Position actuelle (anneau — lag)

  // Suivi position souris — point instantané
  document.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;
    cursorDot.style.left = cx + 'px';
    cursorDot.style.top  = cy + 'px';
  });

  // Anneau avec lerp — effet de traînée organique
  (function loop() {
    dx += (cx - dx) * 0.12;
    dy += (cy - dy) * 0.12;
    cursor.style.left = dx + 'px';
    cursor.style.top  = dy + 'px';
    requestAnimationFrame(loop);
  })();

  // États hover sur les éléments interactifs
  const hoverEls = document.querySelectorAll('a, button, [onclick], [tabindex="0"]');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });

  // État clic
  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('clicking'));
}

/* ════════════════════════════════════════════════════════════════════
   CANVAS PARTICULES — Slide Hero
   Conservé intégralement — particules bleu/violet connectées
════════════════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  // Redimensionnement du canvas
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Nombre de particules adaptatif
  const COUNT = Math.min(70, Math.floor(W / 20));

  function rand(min, max) { return Math.random() * (max - min) + min; }

  // Classe Particule
  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x     = rand(0, W);
      this.y     = rand(0, H);
      this.r     = rand(0.5, 2.5);
      this.vx    = rand(-0.3, 0.3);
      this.vy    = rand(-0.5, -0.1);
      this.alpha = rand(0.1, 0.5);
      // Couleur Electric Blue ou Astral Purple
      this.color = Math.random() > 0.5 ? '0, 85, 255' : '112, 0, 255';
    }

    update() {
      this.x     += this.vx;
      this.y     += this.vy;
      this.alpha -= 0.001;
      if (this.y < -5 || this.alpha <= 0) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fill();
    }
  }

  // Initialiser les particules
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  // Connexion des particules proches
  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a    = particles[i];
        const b    = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0, 85, 255, ${(1 - dist / 120) * 0.08})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // Boucle d'animation
  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    requestAnimationFrame(animate);
  }

  animate();
}

/* ════════════════════════════════════════════════════════════════════
   PRÉ-REMPLISSAGE DU FORMULAIRE — Boutons "Sélectionner"
   ────────────────────────────────────────────────────────────────────
   Quand un utilisateur clique "Sélectionner" sur une carte de pack,
   on navigue vers le slide Contact et on pré-remplit le select du pack.
════════════════════════════════════════════════════════════════════ */

/**
 * Sélectionne un pack, navigue vers le formulaire et pré-remplit le champ.
 * @param {string} packValue - Valeur de l'option à sélectionner (ex: "PACK LANCEMENT – 150k FCFA")
 */
function selectPack(packValue) {
  // Naviguer vers le slide Contact (index 3)
  goToSlide(3);

  // Pré-remplir le select "Choix du Pack" après un court délai (transition slide)
  setTimeout(() => {
    const packSelect = document.getElementById('packChoisi');
    if (packSelect) {
      packSelect.value = packValue;

      // Effet visuel : mettre en surbrillance le champ pendant 1s
      packSelect.style.borderBottomColor = 'var(--purple)';
      setTimeout(() => {
        packSelect.style.borderBottomColor = '';
      }, 1000);
    }
  }, 600);
}

/* ════════════════════════════════════════════════════════════════════
   FORMULAIRE & SOUMISSION WHATSAPP
   ────────────────────────────────────────────────────────────────────
   À la soumission, génère un message formaté et ouvre WhatsApp direct.
   Format : https://wa.me/22791040181?text=[Message_Formaté]
════════════════════════════════════════════════════════════════════ */
function initFormHandlers() {
  if (!contactForm) return;

  /* ── Soumission du formulaire ── */
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validation avant envoi
    if (!validateForm()) return;

    // État loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simuler 800ms d'envoi puis ouvrir WhatsApp
    setTimeout(() => {
      const message = buildWhatsAppMessage();
      const url     = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

      // Afficher le message de succès
      submitBtn.classList.remove('loading');
      submitBtn.style.display = 'none';
      formSuccess.removeAttribute('hidden');

      // Ouvrir WhatsApp dans un nouvel onglet
      window.open(url, '_blank', 'noopener,noreferrer');

      // Réinitialiser le formulaire après 4 secondes
      setTimeout(() => {
        contactForm.reset();
        formSuccess.setAttribute('hidden', '');
        submitBtn.style.display = '';
        submitBtn.disabled = false;
      }, 4000);

    }, 800);
  });

  /* ── Validation en temps réel (au blur) ── */
  ['fullName', 'whatsapp', 'localisation'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateField(el));
  });
}

/**
 * Construit le message WhatsApp formaté à partir des données du formulaire.
 * @returns {string} Message encodé pour l'URL WhatsApp
 */
function buildWhatsAppMessage() {
  const nom         = getValue('fullName');
  const whatsapp    = getValue('whatsapp');
  const localisation= getValue('localisation');
  const pack        = getValue('packChoisi')   || 'Non spécifié';
  const budget      = getValue('budget')       || 'Non spécifié';

  const message = [
    '🌐 *KYÔ DIGITAL — Nouvelle Demande*',
    '─────────────────────────',
    `👤 *Nom :* ${nom}`,
    `📱 *WhatsApp :* ${whatsapp}`,
    `📍 *Localisation :* ${localisation}`,
    `📦 *Pack choisi :* ${pack}`,
    `💰 *Budget :* ${budget}`,
    '─────────────────────────',
    '_Message généré depuis kyo.digital_',
    '_"L\'AVENIR SE DÉCIDE AUJOURD\'HUI."_',
  ].join('\n');

  return encodeURIComponent(message);
}

/**
 * Récupère la valeur d'un champ de formulaire par son ID.
 * @param {string} id - ID du champ
 * @returns {string} Valeur du champ (trimmée)
 */
function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/* ════════════════════════════════════════════════════════════════════
   VALIDATION DU FORMULAIRE
════════════════════════════════════════════════════════════════════ */

/**
 * Valide tous les champs requis du formulaire.
 * @returns {boolean} true si tous les champs sont valides
 */
function validateForm() {
  const fields = [
    document.getElementById('fullName'),
    document.getElementById('whatsapp'),
    document.getElementById('localisation'),
  ];
  return fields.map(validateField).every(Boolean);
}

/**
 * Valide un champ individuel et affiche/masque les erreurs.
 * @param {HTMLElement} el - Élément de formulaire à valider
 * @returns {boolean} true si le champ est valide
 */
function validateField(el) {
  if (!el) return true;

  const err = el.parentElement.querySelector('.form-err');
  let msg   = '';

  if (!el.value.trim()) {
    msg = 'Ce champ est requis.';
  } else if (el.id === 'whatsapp' && el.value.trim().length < 8) {
    msg = 'Numéro WhatsApp invalide.';
  }

  if (err) err.textContent = msg;
  el.classList.toggle('error', !!msg);
  return !msg;
}

/* ════════════════════════════════════════════════════════════════════
   UTILITAIRES
════════════════════════════════════════════════════════════════════ */

/**
 * Retourne une promesse résolue après `ms` millisecondes.
 * @param {number} ms - Durée en ms
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

/* ════════════════════════════════════════════════════════════════════
   EXPOSITION GLOBALE — Fonctions appelées depuis le HTML inline
════════════════════════════════════════════════════════════════════ */
// Ces fonctions sont exposées globalement pour les onclick HTML
window.goToSlide    = goToSlide;
window.mobileNav    = mobileNav;
window.selectPack   = selectPack;
window.switchProject = function() {};  // Compatibilité (slide projets supprimé)
