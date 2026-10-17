/**
 * ==========================================================================
 * Bespoke Wedding Website Experience — Akanksha & Vikas
 * High-End Animations: GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.18
 * ==========================================================================
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Global State & Accessibility Checks
  // ---------------------------------------------------------------------------
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let lenisInstance = null;
  let storyScrollTrigger = null;
  let storyTween = null;

  // ---------------------------------------------------------------------------
  // 1. Initialization & Setup (Lenis & GSAP)
  // ---------------------------------------------------------------------------
  function initScrollAndPlugins() {
    // Register GSAP ScrollTrigger if available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    } else {
      console.warn('GSAP or ScrollTrigger is not defined.');
    }

    // If user prefers reduced motion, disable smooth scrolling library to avoid motion sickness
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
      return;
    }

    // Initialize Lenis smooth scrolling if library is loaded
    if (typeof Lenis !== 'undefined') {
      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      // Connect Lenis to GSAP ScrollTrigger
      if (typeof ScrollTrigger !== 'undefined') {
        lenisInstance.on('scroll', ScrollTrigger.update);
      }

      // Add Lenis raf to GSAP ticker for synchronous updates
      if (typeof gsap !== 'undefined') {
        gsap.ticker.add((time) => {
          lenisInstance.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          lenisInstance.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Preloader Animation
  // ---------------------------------------------------------------------------
  function initPreloader() {
    const preloader = document.querySelector('.preloader') || document.querySelector('#preloader');
    if (!preloader) {
      initHeroEntrance();
      return;
    }

    if (prefersReducedMotion) {
      preloader.style.display = 'none';
      initHeroEntrance();
      return;
    }

    const monogramPaths = preloader.querySelectorAll('svg path');
    const preloaderText = preloader.querySelector('.preloader-text');
    const preloaderLine = preloader.querySelector('.preloader-line');

    // Prepare SVG path dash lengths for stroke drawing effect
    monogramPaths.forEach((path) => {
      try {
        const length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 1,
        });
      } catch (e) {
        // Fallback for paths where getTotalLength is not supported
        gsap.set(path, { opacity: 0 });
      }
    });

    if (preloaderLine) {
      gsap.set(preloaderLine, { scaleX: 0, transformOrigin: 'center center' });
    }
    if (preloaderText) {
      gsap.set(preloaderText, { opacity: 0, y: 20 });
    }

    const preloaderTl = gsap.timeline({
      onComplete: () => {
        // Dismiss preloader
        gsap.to(preloader, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 1.1,
          ease: 'power4.inOut',
          onComplete: () => {
            preloader.style.pointerEvents = 'none';
            preloader.style.display = 'none';
            initHeroEntrance();
            if (typeof ScrollTrigger !== 'undefined') {
              ScrollTrigger.refresh();
            }
          },
        });
      },
    });

    // 1. Draw SVG monogram paths over 2 seconds
    if (monogramPaths.length > 0) {
      preloaderTl.to(
        monogramPaths,
        {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 2,
          ease: 'power2.inOut',
          stagger: 0.1,
        },
        0
      );
    }

    // 2. Fade in preloader text with slight y movement at 1.0s
    if (preloaderText) {
      preloaderTl.to(
        preloaderText,
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
        },
        1.0
      );
    }

    // 3. Animate preloader line scaleX at 1.5s
    if (preloaderLine) {
      preloaderTl.to(
        preloaderLine,
        {
          scaleX: 1,
          duration: 1.0,
          ease: 'power3.inOut',
        },
        1.5
      );
    }

    // 4. Fade out preloader content before sliding preloader up (around 2.8s)
    const innerContent = preloader.querySelector('.preloader-content') || preloader.children;
    preloaderTl.to(
      innerContent,
      {
        opacity: 0,
        y: -30,
        duration: 0.6,
        ease: 'power2.in',
      },
      2.8
    );
  }

  // Hero entrance trigger after preloader finishes
  function initHeroEntrance() {
    if (typeof gsap === 'undefined' || prefersReducedMotion) return;

    const heroElements = document.querySelectorAll(
      '.hero-title, .hero-names, .hero-subtitle, .hero-date, .hero-venue, .hero-cta, .scroll-indicator'
    );

    if (heroElements.length > 0) {
      gsap.fromTo(
        heroElements,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Navigation
  // ---------------------------------------------------------------------------
  function initNavigation() {
    const nav = document.querySelector('nav') || document.querySelector('.nav') || document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger') || document.querySelector('.nav-toggle') || document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu') || document.querySelector('.nav-mobile');
    const mobileLinks = document.querySelectorAll('.mobile-menu a, .nav-mobile a');
    const desktopLinks = document.querySelectorAll('nav a[href^="#"], .nav a[href^="#"], .navbar a[href^="#"]');

    // Scrolled state
    function updateNavScroll() {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      if (nav) {
        if (scrollY > 100) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    }

    window.addEventListener('scroll', updateNavScroll, { passive: true });
    updateNavScroll();

    // Hamburger toggle
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active', isActive);
        hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        mobileMenu.setAttribute('aria-hidden', isActive ? 'false' : 'true');

        if (isActive) {
          // Animate mobile menu links in
          const links = mobileMenu.querySelectorAll('a, button, .mobile-menu-item');
          if (typeof gsap !== 'undefined' && links.length > 0) {
            gsap.fromTo(
              links,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
            );
          }
        }
      });
    }

    // Close mobile menu helper
    function closeMobileMenu() {
      if (hamburger && mobileMenu) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      }
    }

    // Mobile menu links smooth scroll
    mobileLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          closeMobileMenu();
          const target = document.querySelector(href);
          if (target) {
            if (lenisInstance) {
              lenisInstance.scrollTo(target, { offset: -70 });
            } else {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
    });

    // Desktop nav links smooth scroll
    desktopLinks.forEach((link) => {
      // Ignore mobile menu links that might also match
      if (link.closest('.mobile-menu') || link.closest('.nav-mobile')) return;

      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href !== '#') {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            if (lenisInstance) {
              lenisInstance.scrollTo(target, { offset: -80 });
            } else {
              const rect = target.getBoundingClientRect();
              const offsetTop = rect.top + window.pageYOffset - 80;
              window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
          }
        }
      });
    });

    // Close mobile menu on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Hero Parallax
  // ---------------------------------------------------------------------------
  function initHeroParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) {
      return;
    }

    const heroSection = document.querySelector('#hero') || document.querySelector('.hero');
    if (!heroSection) return;

    const heroContent = heroSection.querySelector('.hero-content') || heroSection.querySelector('.hero-inner');
    const heroBg = heroSection.querySelector('.hero-bg') || heroSection.querySelector('.hero-background') || heroSection.querySelector('.hero-image');
    const scrollIndicator = heroSection.querySelector('.scroll-indicator') || heroSection.querySelector('.hero-scroll');

    // Create hero parallax timeline
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Content moves up faster (-30%) and fades out
    if (heroContent) {
      heroTl.to(
        heroContent,
        {
          yPercent: -30,
          opacity: 0,
          ease: 'none',
        },
        0
      );
    }

    // Background moves at subtle opposite/parallax speed
    if (heroBg) {
      heroTl.to(
        heroBg,
        {
          yPercent: 20,
          scale: 1.05,
          ease: 'none',
        },
        0
      );
    }

    // Scroll indicator fades out rapidly
    if (scrollIndicator) {
      gsap.to(scrollIndicator, {
        opacity: 0,
        y: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: '20% top',
          scrub: true,
        },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Scroll-Triggered Reveal Animations
  // ---------------------------------------------------------------------------
  function initRevealAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    if (prefersReducedMotion) {
      revealElements.forEach((el) => {
        el.classList.add('active');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Group reveals by parent container to stagger sibling cards/grids automatically
    const processedContainers = new Set();

    revealElements.forEach((element) => {
      const parentGrid = element.closest('.stagger-group, .cards-grid, .timeline-grid, .events-grid');

      if (parentGrid && !processedContainers.has(parentGrid)) {
        processedContainers.add(parentGrid);
        const siblings = parentGrid.querySelectorAll('.reveal');

        gsap.fromTo(
          siblings,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: parentGrid,
              start: 'top 85%',
              toggleActions: 'play none none none',
              onEnter: () => siblings.forEach((s) => s.classList.add('active')),
            },
          }
        );
      } else if (!parentGrid) {
        // Standalone reveal item
        gsap.fromTo(
          element,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none none',
              onEnter: () => element.classList.add('active'),
            },
          }
        );
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Horizontal Scroll Section (#story) — KEY FEATURE
  // ---------------------------------------------------------------------------
  function initHorizontalScroll() {
    const storySection = document.querySelector('#story');
    const storyTrack = document.querySelector('.story-track');
    if (!storySection || !storyTrack) return;

    // Clean up previous animations if re-initializing on resize
    if (storyScrollTrigger) {
      storyScrollTrigger.kill();
      storyScrollTrigger = null;
    }
    if (storyTween) {
      storyTween.kill();
      storyTween = null;
    }

    // Kill any existing ScrollTriggers on story cards
    ScrollTrigger.getAll().forEach((st) => {
      if (st.vars.id && st.vars.id.startsWith('story-card-')) {
        st.kill();
      }
    });

    const cards = storyTrack.querySelectorAll('.story-card');

    // DESKTOP: Horizontal Pinned Scroll (> 768px)
    if (window.innerWidth > 768 && !prefersReducedMotion) {
      // Reset mobile transforms or styles
      gsap.set(storyTrack, { clearProps: 'all' });
      gsap.set(cards, { clearProps: 'all' });

      const totalWidth = storyTrack.scrollWidth;
      const viewportWidth = window.innerWidth;
      const scrollDistance = Math.max(0, totalWidth - viewportWidth + 120);

      storyTween = gsap.to(storyTrack, {
        x: -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          id: 'storyScrollMain',
          trigger: storySection,
          start: 'top top',
          end: () => `+=${scrollDistance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      storyScrollTrigger = storyTween.scrollTrigger;

      // Animate individual cards as they scroll horizontally into view
      cards.forEach((card, i) => {
        const tilt = i % 2 === 0 ? -4 : 4;
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 35,
            rotation: tilt,
          },
          {
            opacity: 1,
            y: 0,
            rotation: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              id: `story-card-${i}`,
              trigger: card,
              containerAnimation: storyTween,
              start: 'left 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    } else {
      // MOBILE (<= 768px) or Reduced Motion: Vertical scroll reveals
      gsap.set(storyTrack, { clearProps: 'all' });

      cards.forEach((card, i) => {
        if (prefersReducedMotion) {
          card.style.opacity = '1';
          card.style.transform = 'none';
        } else {
          gsap.fromTo(
            card,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: 'power3.out',
              scrollTrigger: {
                id: `story-card-${i}`,
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7. Gallery Animations & Hover
  // ---------------------------------------------------------------------------
  function initGalleryAnimations() {
    const galleryItems = document.querySelectorAll(
      '.gallery-item, .gallery-card, .photo-card, .gallery-grid figure'
    );
    if (!galleryItems.length) return;

    // Staggered entrance
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
      const galleryContainer = document.querySelector('.gallery-grid, #gallery, .gallery-container') || galleryItems[0].parentElement;

      gsap.fromTo(
        galleryItems,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: galleryContainer,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Hover effect (desktop only)
    if (!isTouchDevice && typeof gsap !== 'undefined') {
      galleryItems.forEach((item) => {
        const image = item.querySelector('img') || item;

        item.addEventListener('mouseenter', () => {
          gsap.to(image, {
            scale: 1.05,
            rotation: 0,
            duration: 0.45,
            ease: 'power2.out',
          });
        });

        item.addEventListener('mouseleave', () => {
          gsap.to(image, {
            scale: 1,
            rotation: 0,
            duration: 0.5,
            ease: 'power2.out',
          });
        });
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 8. RSVP Interactions
  // ---------------------------------------------------------------------------
  function initRSVP() {
    const rsvpBtn = document.querySelector('#rsvp-btn, .rsvp-trigger, .rsvp-btn, [data-action="rsvp"]');
    const rsvpFormContainer = document.querySelector('.rsvp-form, #rsvp-form-container, .rsvp-form-wrapper');
    const form = document.querySelector('#rsvp-form, .rsvp-form form') || (rsvpFormContainer && rsvpFormContainer.tagName === 'FORM' ? rsvpFormContainer : null);

    // Initial button click to show form
    if (rsvpBtn && rsvpFormContainer) {
      rsvpBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
          gsap.to(rsvpBtn, {
            opacity: 0,
            scale: 0.9,
            duration: 0.35,
            ease: 'power2.in',
            onComplete: () => {
              rsvpBtn.style.display = 'none';
              rsvpFormContainer.setAttribute('data-state', 'visible');
              rsvpFormContainer.style.display = 'block';

              const formInputs = rsvpFormContainer.querySelectorAll('input, select, textarea, button, label, .form-group');
              gsap.fromTo(
                formInputs,
                { opacity: 0, y: 20 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.5,
                  stagger: 0.08,
                  ease: 'power2.out',
                }
              );

              // Focus first field
              const firstInput = rsvpFormContainer.querySelector('input, select');
              if (firstInput) firstInput.focus();
            },
          });
        } else {
          rsvpBtn.style.display = 'none';
          rsvpFormContainer.setAttribute('data-state', 'visible');
          rsvpFormContainer.style.display = 'block';
        }
      });
    }

    // Form submission handling
    const activeForm = form || document.querySelector('form.rsvp');
    if (activeForm) {
      activeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Collect form data
        const formData = new FormData(activeForm);
        const data = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });

        console.log('🎉 RSVP Submission Received:', data);

        // Prepare Thank You state
        const guestName = data.name || data.fullname || data.guestName || 'Dear Guest';
        const thankYouMessage = document.createElement('div');
        thankYouMessage.className = 'rsvp-thankyou text-center';
        thankYouMessage.innerHTML = `
          <div class="thankyou-card" style="padding: 2.5rem 1.5rem; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">💐</div>
            <h3 style="font-size: 1.8rem; margin-bottom: 0.75rem; font-family: inherit;">Thank You, ${guestName}!</h3>
            <p style="font-size: 1.1rem; opacity: 0.9; max-width: 450px; margin: 0 auto 1.5rem;">
              Your presence will make our celebration truly unforgettable. We can't wait to welcome you in Roha, Raigad!
            </p>
            <span style="display: inline-block; font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.7;">
              November 26, 2026 • Vani, Roha, Raigad
            </span>
          </div>
        `;

        if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
          gsap.to(activeForm, {
            opacity: 0,
            y: -15,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
              activeForm.replaceWith(thankYouMessage);
              gsap.fromTo(
                thankYouMessage,
                { opacity: 0, y: 20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
              );
            },
          });
        } else {
          activeForm.replaceWith(thankYouMessage);
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 9. Magnetic Button Effect
  // ---------------------------------------------------------------------------
  function initMagneticButtons() {
    // Only enable magnetic effect for precision pointer devices (mouse)
    if (isTouchDevice || prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const magneticBtns = document.querySelectorAll('.magnetic-btn');

    magneticBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: 'power2.out',
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.3)',
        });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 10. Add to Calendar (.ics Generator)
  // ---------------------------------------------------------------------------
  function initCalendar() {
    const calendarButtons = document.querySelectorAll(
      '#add-to-calendar, .calendar-btn, .add-to-calendar, [data-action="calendar"]'
    );
    if (!calendarButtons.length) return;

    calendarButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        // Event: "Wedding of Akanksha & Vikas (Kadam & Shinde)"
        // Date: November 26, 2026, 1:05 PM IST (UTC+05:30 -> 07:35 UTC)
        // Duration: 5 hours (Ends 6:05 PM IST -> 12:35 UTC)
        // Location: Vivah Sthal, Vani, Post Pingode, Taluka Roha, District Raigad, Maharashtra 402109
        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Wedding of Akanksha & Vikas (Kadam & Shinde)//EN',
          'CALSCALE:GREGORIAN',
          'METHOD:PUBLISH',
          'BEGIN:VEVENT',
          'UID:wedding-akanksha-vikas-20261126T130500@wedding.local',
          'DTSTAMP:20261017T070000Z',
          'DTSTART:20261126T073500Z',
          'DTEND:20261126T123500Z',
          'SUMMARY:Wedding of Akanksha & Vikas (Kadam & Shinde)',
          'DESCRIPTION:Shubh Vivah (Wedding Ceremony) of Akanksha Arvind Kadam and Vikas Shahaji Shinde. Auspicious Muhurat at 1:05 PM.',
          'LOCATION:Vivah Sthal\\, Vani\\, Post Pingode\\, Taluka Roha\\, District Raigad\\, Maharashtra 402109',
          'STATUS:CONFIRMED',
          'SEQUENCE:0',
          'END:VEVENT',
          'END:VCALENDAR',
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'wedding-akanksha-and-vikas.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 11. Parallax Elements ([data-speed])
  // ---------------------------------------------------------------------------
  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) {
      return;
    }

    const parallaxElements = document.querySelectorAll('[data-speed]');
    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 1;
      gsap.to(el, {
        y: () => (1 - speed) * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 12. Image Lazy Loading (IntersectionObserver)
  // ---------------------------------------------------------------------------
  function initLazyLoading() {
    const lazyImages = document.querySelectorAll('[data-src]');
    if (!lazyImages.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target;
              if (el.dataset.src) {
                if (el.tagName === 'IMG') {
                  el.src = el.dataset.src;
                } else {
                  el.style.backgroundImage = `url(${el.dataset.src})`;
                }
              }
              if (el.dataset.srcset && el.tagName === 'IMG') {
                el.srcset = el.dataset.srcset;
              }
              el.classList.add('is-loaded');
              observer.unobserve(el);
            }
          });
        },
        { rootMargin: '200px' }
      );

      lazyImages.forEach((el) => observer.observe(el));
    } else {
      // Fallback: load all immediately
      lazyImages.forEach((el) => {
        if (el.dataset.src) {
          if (el.tagName === 'IMG') {
            el.src = el.dataset.src;
          } else {
            el.style.backgroundImage = `url(${el.dataset.src})`;
          }
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 13. Custom Luxury Cursor
  // ---------------------------------------------------------------------------
  function initCustomCursor() {
    // Only on non-touch devices with fine pointers
    if (isTouchDevice || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }

    let cursorDot = document.querySelector('.cursor-dot');
    let cursorRing = document.querySelector('.cursor-ring');

    if (!cursorDot) {
      cursorDot = document.createElement('div');
      cursorDot.className = 'cursor-dot';
      cursorDot.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 8px;
        height: 8px;
        background: rgba(23, 20, 15, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%);
        transition: transform 0.1s ease, width 0.25s ease, height 0.25s ease, background 0.25s ease;
      `;
      document.body.appendChild(cursorDot);
    }

    if (!cursorRing) {
      cursorRing = document.createElement('div');
      cursorRing.className = 'cursor-ring';
      cursorRing.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 32px;
        height: 32px;
        border: 1px solid rgba(23, 20, 15, 0.25);
        border-radius: 50%;
        pointer-events: none;
        z-index: 99998;
        transform: translate(-50%, -50%);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, width 0.25s ease, height 0.25s ease;
      `;
      document.body.appendChild(cursorRing);
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth trailing ring
    function renderCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover scale effects on interactive elements
    const interactiveSelectors = 'a, button, input, select, textarea, .magnetic-btn, [role="button"], .clickable, .story-card';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(2)';
        cursorRing.style.transform = 'translate(-50%, -50%) scale(1.6)';
        cursorRing.style.borderColor = 'rgba(23, 20, 15, 0.5)';
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorRing.style.borderColor = 'rgba(23, 20, 15, 0.25)';
      });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    });
  }

  // ---------------------------------------------------------------------------
  // 14. Resize Handling & Debouncing
  // ---------------------------------------------------------------------------
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  let lastWidth = window.innerWidth;
  function handleResize() {
    const currentWidth = window.innerWidth;
    // Only recompute if width actually changed (avoids mobile vertical scrollbar jitter)
    if (Math.abs(currentWidth - lastWidth) > 20) {
      lastWidth = currentWidth;

      // Recalculate horizontal scroll
      initHorizontalScroll();

      // Refresh ScrollTrigger instances
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 15. Main Initialization
  // ---------------------------------------------------------------------------
  function init() {
    initScrollAndPlugins();
    initPreloader();
    initNavigation();
    initHeroParallax();
    initRevealAnimations();
    initHorizontalScroll();
    initGalleryAnimations();
    initRSVP();
    initMagneticButtons();
    initCalendar();
    initParallax();
    initLazyLoading();
    initCustomCursor();

    window.addEventListener('resize', debounce(handleResize, 250));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
