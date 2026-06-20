import './style.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Project Database
const projects = [
  {
    tag: 'BRAND IDENTITY',
    title: 'Nüwa Skincare',
    desc: 'A complete brand identity for a premium skincare line rooted in purity and self-care.',
    image: '/assets/skincare_dropper_bottle.png',
    link: '#',
    bgColor: '#F5F2EB',
    textColor: '#111111',
    isDark: false
  },
  {
    tag: 'UI/UX DESIGN',
    title: 'Echo App',
    desc: 'A next-generation social audio platform designed for seamless conversations and community building.',
    image: '/assets/echo_app_thumbnail.png',
    link: '#',
    bgColor: '#101012',
    textColor: '#ffffff',
    isDark: true
  },
  {
    tag: 'ILLUSTRATION',
    title: 'Vibrant Minds',
    desc: 'A series of custom editorial illustrations exploring the intersection of technology, psychology, and design.',
    image: '/assets/vibrant_minds_thumbnail.png',
    link: '#',
    bgColor: '#F5F2EB',
    textColor: '#111111',
    isDark: false
  },
  {
    tag: 'MOTION GRAPHICS',
    title: 'Momentum',
    desc: 'Dynamic 3D motion graphics and brand animations capturing the flow of physical and digital products.',
    image: '/assets/momentum_thumbnail.png',
    link: '#',
    bgColor: '#101012',
    textColor: '#ffffff',
    isDark: true
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const lenis = initSmoothScroll();

  initInteractiveCards();
  setupProjectSwitcher();
  initParallaxImages();

  // Run preloader, then play the hero entrance once it's done
  initPreloader(() => {
    initScrollAnimations(lenis);
  });
});

// Setup Lenis Smooth Scroll
function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential easing
    smoothWheel: true,
    wheelMultiplier: 1.0
  });

  // Link Lenis to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

// Setup Interactive Cards: 3D Perspective Tilt & Cursor Tracking glows
function initInteractiveCards() {
  const cards = document.querySelectorAll(
    '.hero-card, .portrait-card, .about-card, .service-card, .tools-card, .showcase-card, .cta-ribbon-card'
  );

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update variables for border glow background gradient
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Calculate coordinates relative to center (for 3D tilt)
      const xc = rect.width / 2;
      const yc = rect.height / 2;

      // Tilt multiplier: make tilt softer on large cards
      const factor = card.classList.contains('hero-card') || card.classList.contains('showcase-card') ? 40 : 15;

      const angleX = (yc - y) / factor;
      const angleY = (x - xc) / factor;

      card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      // Return smoothly to flat default state
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.setProperty('--mouse-x', '0px');
      card.style.setProperty('--mouse-y', '0px');
    });
  });
}

// Scroll-driven parallax on hero/showcase/ribbon images
function initParallaxImages() {
  const configs = [
    { selector: '.portrait-img', container: '.portrait-card', amount: 38 },
    { selector: '.showcase-img', container: '.showcase-image-wrapper', amount: 22 },
    { selector: '.ribbon-card-bg', container: '.cta-ribbon-card', amount: 25 },
  ];

  configs.forEach(({ selector, container, amount }) => {
    document.querySelectorAll(selector).forEach((img) => {
      const trigger = img.closest(container) || img.parentElement;
      gsap.fromTo(
        img,
        { yPercent: -amount / 2 },
        {
          yPercent: amount / 2,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    });
  });
}


function initPreloader(onComplete) {
  const preloader = document.getElementById('preloader');
  const bar = document.getElementById('preloader-bar');
  const percent = document.getElementById('preloader-percent');
  const curtain = preloader.querySelector('.preloader-curtain');
  const letters = preloader.querySelectorAll('.preloader-logo .letter');

  // Letters pop in
  gsap.to(letters, {
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.05,
    ease: 'power3.out',
  });

  const progress = { value: 0 };

  gsap.to(progress, {
    value: 100,
    duration: 2,
    ease: 'power2.inOut',
    delay: 0.3,
    onUpdate: () => {
      const v = Math.floor(progress.value);
      bar.style.width = `${v}%`;
      percent.textContent = `${v}%`;
    },
    onComplete: () => {
      const tl = gsap.timeline({
        onComplete: () => {
          preloader.style.display = 'none';
          document.body.classList.remove('is-loading');
          if (onComplete) onComplete();
        },
      });

      tl.to('.preloader-inner', { opacity: 0, y: -16, duration: 0.4, ease: 'power2.in' });
      tl.to(curtain, { scaleY: 1, duration: 0.5, ease: 'power3.inOut' }, '<');
      tl.to(preloader, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, '+=0.1');
    },
  });
}

// Setup ScrollTrigger & Timelines
function initScrollAnimations(lenis) {
  // 1. Loading Entrance Timeline (Pure opacity fades to protect layout alignment)
  const entranceTl = gsap.timeline();

  entranceTl.from('.hero-title', {
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.2
  });

  entranceTl.from('.header', {
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.8');

  entranceTl.from('.hero-subtitle', {
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.8');

  entranceTl.from('.hero-actions', {
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.8');

  entranceTl.from('.portrait-card', {
    opacity: 0,
    duration: 1.0,
    ease: 'power3.out'
  }, '-=0.8');

  entranceTl.from('.about-card', {
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.6');

  // 2. Services Grid Staggered Reveal
  gsap.from('.services-grid .service-card', {
    scrollTrigger: {
      trigger: '.services-grid',
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    stagger: 0.12,
    duration: 0.85,
    ease: 'power3.out'
  });

  // Staggered reveals for row 3 (Motion graphics, 3D, Video, Tools)
  gsap.from('.more-services-grid > *', {
    scrollTrigger: {
      trigger: '.more-services-grid',
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    stagger: 0.12,
    duration: 0.85,
    ease: 'power3.out'
  });

  // 3. Featured Work Heading Reveal
  gsap.from('.featured-work-heading', {
    scrollTrigger: {
      trigger: '.featured-work-heading',
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    duration: 0.95,
    ease: 'power3.out'
  });

  // Featured Work items reveal
  gsap.from('.featured-work-layout > *', {
    scrollTrigger: {
      trigger: '.featured-work-layout',
      start: 'top 80%'
    },
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out'
  });

  // 4. Footer CTA Heading reveal
  gsap.from('.cta-heading', {
    scrollTrigger: {
      trigger: '.cta-heading',
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out'
  });

  // Animate the brush stroke line under footer heading
  gsap.from('.brush-underline path', {
    scrollTrigger: {
      trigger: '.brush-underline',
      start: 'top 85%'
    },
    strokeDasharray: 800,
    strokeDashoffset: 800,
    duration: 1.5,
    ease: 'power3.out'
  });

  // Staggered contact detail links
  gsap.from('.contact-details .detail-group', {
    scrollTrigger: {
      trigger: '.contact-details',
      start: 'top 85%'
    },
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out'
  });

  // Footer Ribbon Card slide-in
  gsap.from('.cta-ribbon-card', {
    scrollTrigger: {
      trigger: '.cta-ribbon-card',
      start: 'top 80%'
    },
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });
}

// Setup Dynamic Project Tab Switcher
function setupProjectSwitcher() {
  const showcase = document.getElementById('featured-showcase');
  const infoContainer = document.getElementById('showcase-info-container');
  const tagEl = document.getElementById('showcase-tag');
  const titleEl = document.getElementById('showcase-title');
  const descEl = document.getElementById('showcase-desc');
  const imageEl = document.getElementById('showcase-image');
  const linkEl = document.getElementById('showcase-link');

  const selectors = document.querySelectorAll('.selector-item');

  if (!showcase || selectors.length === 0) return;

  selectors.forEach(selector => {
    selector.addEventListener('click', () => {
      const idx = parseInt(selector.getAttribute('data-project-idx'), 10);
      if (isNaN(idx) || idx < 0 || idx >= projects.length) return;

      // Ignore if already active
      if (selector.classList.contains('active')) return;

      // Update active selector class
      selectors.forEach(s => s.classList.remove('active'));
      selector.classList.add('active');

      // Trigger fade out
      showcase.classList.add('fade-out');

      // Wait for fade out transition
      setTimeout(() => {
        const project = projects[idx];

        // Update Content
        tagEl.textContent = project.tag;
        titleEl.textContent = project.title;
        descEl.textContent = project.desc;
        imageEl.src = project.image;
        imageEl.alt = project.title;
        linkEl.href = project.link;

        // Update Styles & Colors
        showcase.style.backgroundColor = project.bgColor;
        infoContainer.style.color = project.textColor;

        // Adjust button classes and description text styles based on theme
        if (project.isDark) {
          descEl.style.color = 'var(--text-secondary)';
          tagEl.style.color = 'var(--text-muted)';
          linkEl.className = 'btn-outline-project theme-dark';
        } else {
          descEl.style.color = '#4a4a4a';
          tagEl.style.color = 'var(--text-muted)';
          linkEl.className = 'btn-outline-project theme-light';
        }

        // Refresh GSAP ScrollTrigger metrics
        ScrollTrigger.refresh();

        // Trigger fade in
        showcase.classList.remove('fade-out');
      }, 250);
    });
  });
}