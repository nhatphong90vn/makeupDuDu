/* ═══════════════════════════════════════
   MAKEUP DU DU – script.js
   Cherry Blossom Falling Petals + UI
═══════════════════════════════════════ */

'use strict';

/* ───────────────────────────────────────
   1. FALLING CHERRY BLOSSOM PETALS
─────────────────────────────────────── */
(function initPetals() {
  const canvas  = document.getElementById('petals-canvas');
  const ctx     = canvas.getContext('2d');
  let W, H, petals = [];

  const COLORS  = ['#ffb7c5','#ffd6e0','#ffc0d0','#ffe4ec','#f9a8bf','#fcc8d8'];
  const PETAL_COUNT = 38;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* Draw a single 5-petal cherry blossom */
  function drawBlossom(ctx, x, y, r, rotation, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);

    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i * 2 * Math.PI) / 5);
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.55, r * 0.35, r * 0.55, 0, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[Math.floor(Math.random() * COLORS.length)];
      ctx.fill();
      ctx.restore();
    }

    /* tiny pink center */
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#f06292';
    ctx.fill();
    ctx.restore();
  }

  /* Draw a simple ellipse petal */
  function drawPetal(ctx, x, y, w, h, rotation, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function createPetal() {
    const isBlossom = Math.random() < 0.25;
    return {
      x:       Math.random() * W,
      y:       -20,
      vx:      (Math.random() - 0.5) * 1.4,
      vy:      0.6 + Math.random() * 1.2,
      rot:     Math.random() * Math.PI * 2,
      rotV:    (Math.random() - 0.5) * 0.04,
      size:    isBlossom ? (8 + Math.random() * 10) : (5 + Math.random() * 9),
      alpha:   0.3 + Math.random() * 0.55,
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      isBlossom,
      sway:    0,
      swayAmp: 0.4 + Math.random() * 0.8,
      swaySpeed: 0.008 + Math.random() * 0.012,
    };
  }

  /* Initialise pool */
  for (let i = 0; i < PETAL_COUNT; i++) {
    const p = createPetal();
    p.y = Math.random() * H;   /* spread vertically on load */
    petals.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    petals.forEach(p => {
      p.sway += p.swaySpeed;
      p.x   += p.vx + Math.sin(p.sway) * p.swayAmp;
      p.y   += p.vy;
      p.rot += p.rotV;

      if (p.isBlossom) {
        drawBlossom(ctx, p.x, p.y, p.size, p.rot, p.alpha);
      } else {
        drawPetal(ctx, p.x, p.y, p.size * 0.55, p.size, p.rot, p.color, p.alpha);
      }

      /* Recycle when off-screen */
      if (p.y > H + 30 || p.x < -40 || p.x > W + 40) {
        Object.assign(p, createPetal());
      }
    });

    requestAnimationFrame(animate);
  }

  animate();
})();


/* ───────────────────────────────────────
   2. NAVBAR – scroll & hamburger
─────────────────────────────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  /* Close menu on link click */
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();


/* ───────────────────────────────────────
   3. SCROLL-REVEAL (IntersectionObserver)
─────────────────────────────────────── */
(function initReveal() {
  const cards = [
    ...document.querySelectorAll('.service-card'),
    ...document.querySelectorAll('.why-card'),
    ...document.querySelectorAll('.contact-card'),
  ];

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = parseFloat(getComputedStyle(el).getPropertyValue('--delay') || 0) * 1000;
        setTimeout(() => el.classList.add('visible'), delay);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  cards.forEach(el => io.observe(el));

  /* Generic .reveal elements */
  document.querySelectorAll('.reveal').forEach(el => {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revealIO.observe(el);
  });
})();


/* ───────────────────────────────────────
   4. TESTIMONIALS SLIDER
─────────────────────────────────────── */
(function initSlider() {
  const track    = document.getElementById('testimonials-track');
  const prevBtn  = document.getElementById('prev-btn');
  const nextBtn  = document.getElementById('next-btn');
  const dotsWrap = document.getElementById('slider-dots');

  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;
  let current = 0;
  let autoTimer;

  /* Build dots */
  const dots = [];
  cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className   = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
    dots.push(d);
  });

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  /* Swipe support */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { goTo(current + (dx < 0 ? 1 : -1)); startAuto(); }
  });

  startAuto();
})();


/* ───────────────────────────────────────
   6. SMOOTH SCROLL FOR ALL HASH LINKS
─────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 72; /* navbar height */
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ───────────────────────────────────────
   7. ACTIVE NAV LINK on scroll
─────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => {
          l.classList.toggle(
            'active-link',
            l.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
})();
