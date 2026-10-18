/**
 * ==========================================================================
 * ROYAL MARATHA WEDDING INVITATION — INTERACTIVE ENGINE
 * Features:
 * 1. 3D Wax Seal Envelope Unfolding with Audio Chime
 * 2. Web Audio API Procedural Wedding Shehnai & Flute Synth
 * 3. HTML5 Canvas Scratch-to-Reveal with Marigold Confetti Explosion
 * 4. Real-time Countdown to Shubh Muhurat (26 Nov 2026 13:05 IST)
 * 5. Direct WhatsApp Marathi Wishes & 1-Click Google Calendar
 * ==========================================================================
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Romantic Violin BGM Engine ("Ek Aisa Woh Jahan Tha" Heart-Touching Theme)
  // ---------------------------------------------------------------------------
  class WeddingAudioEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.masterGain = null;
      this.externalAudio = null;
      this.fadeInterval = null;
      this.targetVolume = 0.42; // Gentle, soothing ambient level
      this.playbackRate = 0.92; // Serene, slow romantic violin cadence
      this.hasBoundUserGesture = false;
    }

    init() {
      if (!this.externalAudio) {
        this.externalAudio = document.getElementById('weddingBgm');
      }

      if (this.externalAudio) {
        try {
          this.externalAudio.playbackRate = this.playbackRate;
          this.externalAudio.preservesPitch = true;
          this.externalAudio.loop = true;
        } catch (e) {}
      }

      if (!this.ctx) {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.ctx = new AudioContext();
          }
        } catch (e) {}
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    playWaxSealCrackSound() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.85);
      } catch (e) {}
    }

    toggle() {
      if (this.isPlaying) {
        this.stop();
      } else {
        this.play();
      }
    }

    fadeIn() {
      if (!this.externalAudio) return;
      clearInterval(this.fadeInterval);
      const step = 0.025;
      this.fadeInterval = setInterval(() => {
        if (!this.externalAudio || !this.isPlaying) {
          clearInterval(this.fadeInterval);
          return;
        }
        if (this.externalAudio.volume < this.targetVolume - step) {
          this.externalAudio.volume = Math.min(this.targetVolume, this.externalAudio.volume + step);
        } else {
          this.externalAudio.volume = this.targetVolume;
          clearInterval(this.fadeInterval);
        }
      }, 70);
    }

    fadeOut(onComplete) {
      if (!this.externalAudio) {
        if (onComplete) onComplete();
        return;
      }
      clearInterval(this.fadeInterval);
      const step = 0.04;
      this.fadeInterval = setInterval(() => {
        if (!this.externalAudio) {
          clearInterval(this.fadeInterval);
          if (onComplete) onComplete();
          return;
        }
        if (this.externalAudio.volume > step) {
          this.externalAudio.volume = Math.max(0, this.externalAudio.volume - step);
        } else {
          this.externalAudio.volume = 0;
          this.externalAudio.pause();
          clearInterval(this.fadeInterval);
          if (onComplete) onComplete();
        }
      }, 50);
    }

    play() {
      this.init();
      this.isPlaying = true;
      this.updateUI(true);

      if (this.externalAudio) {
        this.externalAudio.playbackRate = this.playbackRate;
        try {
          this.externalAudio.preservesPitch = true;
        } catch (e) {}

        this.externalAudio.volume = 0.01;
        const playPromise = this.externalAudio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.fadeIn();
            })
            .catch(() => {
              // Browser autoplay policy restricted audio; arm one-time touch/click handler
              if (!this.hasBoundUserGesture) {
                this.hasBoundUserGesture = true;
                const resumeMusic = () => {
                  if (this.isPlaying && this.externalAudio && this.externalAudio.paused) {
                    this.externalAudio.play().then(() => this.fadeIn()).catch(() => {});
                  }
                  window.removeEventListener('click', resumeMusic);
                  window.removeEventListener('touchstart', resumeMusic);
                  window.removeEventListener('scroll', resumeMusic);
                };
                window.addEventListener('click', resumeMusic, { once: true, passive: true });
                window.addEventListener('touchstart', resumeMusic, { once: true, passive: true });
                window.addEventListener('scroll', resumeMusic, { once: true, passive: true });
              }
            });
        }
      }
    }

    stop() {
      this.isPlaying = false;
      this.updateUI(false);
      this.fadeOut();
    }

    updateUI(active) {
      const btn = document.getElementById('audioToggleBtn');
      if (btn) {
        const label = btn.querySelector('.audio-btn-label');
        if (active) {
          btn.classList.add('playing');
          btn.classList.remove('paused');
          btn.setAttribute('aria-label', 'संगीत बंद करा (Mute Music)');
          if (label) label.textContent = 'संगीत चालू (Music)';
        } else {
          btn.classList.remove('playing');
          btn.classList.add('paused');
          btn.setAttribute('aria-label', 'संगीत चालू करा (Play Music)');
          if (label) label.textContent = 'संगीत बंद (Muted)';
        }
      }
    }
  }

  const weddingAudio = new WeddingAudioEngine();

  // ---------------------------------------------------------------------------
  // 2. 3D Wax Seal Envelope Opening Animation
  // ---------------------------------------------------------------------------
  function initEnvelopeOpening() {
    const envelopeScreen = document.getElementById('royalEnvelopeScreen');
    const waxSeal = document.getElementById('waxSealBtn');
    const envelopeCard = document.getElementById('envelopeCardClickable');
    const openBtn = document.getElementById('openInvitationBtn');
    const skipBtn = document.getElementById('skipEnvelopeBtn');
    const replayBtn = document.getElementById('replayEnvelopeBtn');
    const navReplayBtn = document.getElementById('replayEnvelopeNavBtn');
    const mobileReplayBtn = document.getElementById('replayEnvelopeMobileBtn');

    if (!envelopeScreen) return;

    // Direct section link or skip query bypass
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('skipEnvelope') === 'true' || window.location.hash.length > 1) {
      envelopeScreen.classList.add('opened', 'dismissed');
      envelopeScreen.style.display = 'none';
    }

    let isAnimating = false;
    let isFullyOpened = false;

    function openEnvelope(instant = false) {
      if (isAnimating) return;
      if (envelopeScreen.classList.contains('fading-out') || envelopeScreen.classList.contains('dismissed')) return;

      if (instant) {
        // Quick bypass if user taps "Skip"
        envelopeScreen.classList.add('opened', 'fading-out');
        setTimeout(() => {
          envelopeScreen.classList.add('dismissed');
          const hero = document.getElementById('hero') || document.getElementById('scratch');
          if (hero) hero.scrollIntoView({ behavior: 'smooth' });
        }, 350);
        return;
      }

      // If already opened, tapping again enters the full wedding website
      if (isFullyOpened) {
        enterWebsite();
        return;
      }

      isAnimating = true;

      // 1. Play seal break sound
      weddingAudio.playWaxSealCrackSound();

      // State 2: Seal interaction (tactile press)
      envelopeScreen.classList.add('seal-pressed');

      // State 3: Flap opening and card rise
      setTimeout(() => {
        envelopeScreen.classList.remove('seal-pressed');
        envelopeScreen.classList.add('opened');

        // Confetti burst on flap reveal
        launchConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.42);

        // Soft music player start
        setTimeout(() => {
          weddingAudio.play();
        }, 600);

        // State 4 & 5: Card & typography reveal complete at ~1.8s
        setTimeout(() => {
          isFullyOpened = true;
          isAnimating = false;
          envelopeScreen.classList.add('invitation-revealed');

          if (openBtn) {
            const btnText = openBtn.querySelector('.btn-text') || openBtn.querySelector('span');
            if (btnText) {
              btnText.textContent = '📜 लग्नसोहळ्यात प्रवेश करा (Enter Website) ↓';
            }
            openBtn.classList.add('pulse-enter');
          }
          if (replayBtn) {
            replayBtn.style.display = 'inline-flex';
          }
        }, 1800);
      }, 220);
    }

    function enterWebsite() {
      envelopeScreen.classList.add('fading-out');
      setTimeout(() => {
        envelopeScreen.classList.add('dismissed');
        const hero = document.getElementById('hero') || document.getElementById('scratch');
        if (hero) {
          hero.scrollIntoView({ behavior: 'smooth' });
        }
      }, 700);
    }

    function resetEnvelope() {
      isAnimating = false;
      isFullyOpened = false;
      envelopeScreen.style.display = 'flex';
      void envelopeScreen.offsetWidth; // force reflow
      envelopeScreen.classList.remove('opened', 'seal-pressed', 'invitation-revealed', 'fading-out', 'dismissed');

      if (openBtn) {
        const btnText = openBtn.querySelector('.btn-text') || openBtn.querySelector('span');
        if (btnText) {
          btnText.textContent = '✨ निमंत्रण उघडा (Open Invitation)';
        }
        openBtn.classList.remove('pulse-enter');
      }
      if (replayBtn) {
        replayBtn.style.display = 'none';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Click & Keyboard triggers
    if (waxSeal) {
      waxSeal.addEventListener('click', (e) => {
        e.stopPropagation();
        openEnvelope(false);
      });
      waxSeal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openEnvelope(false);
        }
      });
    }

    if (envelopeCard) {
      envelopeCard.addEventListener('click', () => {
        if (!isFullyOpened) {
          openEnvelope(false);
        } else {
          enterWebsite();
        }
      });
      envelopeCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isFullyOpened) openEnvelope(false);
          else enterWebsite();
        }
      });
    }

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        if (!isFullyOpened) {
          openEnvelope(false);
        } else {
          enterWebsite();
        }
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => openEnvelope(true));
    }

    if (replayBtn) {
      replayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetEnvelope();
      });
    }

    if (navReplayBtn) {
      navReplayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resetEnvelope();
      });
    }

    if (mobileReplayBtn) {
      mobileReplayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const mobileMenu = document.getElementById('mobileMenu');
        const hamburger = document.getElementById('hamburgerBtn');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
          mobileMenu.classList.remove('active');
        }
        if (hamburger) {
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
        }
        resetEnvelope();
      });
    }

    // Scroll & touch gestures
    window.addEventListener('wheel', (e) => {
      if (e.deltaY > 20 && !envelopeScreen.classList.contains('dismissed')) {
        if (!envelopeScreen.classList.contains('opened')) {
          openEnvelope(false);
        } else if (isFullyOpened) {
          enterWebsite();
        }
      }
    }, { passive: true });

    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!envelopeScreen.classList.contains('dismissed')) {
        const delta = touchStartY - e.touches[0].clientY;
        if (delta > 35) {
          if (!envelopeScreen.classList.contains('opened')) {
            openEnvelope(false);
          } else if (isFullyOpened) {
            enterWebsite();
          }
        }
      }
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if ((e.key === 'ArrowDown' || e.key === 'PageDown') && !envelopeScreen.classList.contains('dismissed')) {
        if (!envelopeScreen.classList.contains('opened')) {
          openEnvelope(false);
        } else if (isFullyOpened) {
          enterWebsite();
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Interactive HTML5 Canvas "Scratch to Reveal" Heart Card
  // ---------------------------------------------------------------------------
  function initScratchCard() {
    const canvas = document.getElementById('scratchCanvas');
    const cardBox = document.getElementById('scratchCardBox');
    if (!canvas || !cardBox) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let isDrawing = false;
    let isRevealed = false;
    let width = 0;
    let height = 0;

    function resizeCanvas() {
      width = cardBox.offsetWidth;
      height = cardBox.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      paintGlitterCover();
    }

    function paintGlitterCover() {
      // 1. Rich metallic gold foil gradient
      const grad = ctx.createRadialGradient(width / 2, height / 2, 30, width / 2, height / 2, width * 0.7);
      grad.addColorStop(0, '#F5DE88');
      grad.addColorStop(0.3, '#D4AF37');
      grad.addColorStop(0.7, '#AA7C11');
      grad.addColorStop(1, '#654605');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Golden sparkle specks
      for (let i = 0; i < 350; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 2 + 0.5;
        ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 225, 120, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Ornate ornamental border inside canvas
      ctx.strokeStyle = 'rgba(255, 240, 180, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, width - 24, height - 24);

      // 4. Center Gold Stamp / Badge
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;

      // Heart / Lotus Icon in center
      ctx.font = '36px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('✨ 卐 ✨', width / 2, height / 2 - 40);

      ctx.font = 'bold 22px "Rozha One", serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('शुभ मुहूर्त जाणून घ्या', width / 2, height / 2 + 5);

      ctx.font = 'bold 12px "Cinzel", serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.letterSpacing = '2px';
      ctx.fillText('SCRATCH TO REVEAL', width / 2, height / 2 + 35);

      ctx.font = '13px "Noto Serif Devanagari", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('येथे बोटाने स्क्रॅच करा', width / 2, height / 2 + 65);

      ctx.restore();
    }

    function scratch(e) {
      if (!isDrawing || isRevealed) return;

      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY;
      const scaleX = canvas.width / (rect.width || 1);
      const scaleY = canvas.height / (rect.height || 1);
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      // Erase destination pixels
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 36, 0, Math.PI * 2);
      ctx.fill();

      // Check scratched percentage throttled
      if (Math.random() > 0.7) {
        checkScratchedPercentage();
      }
    }

    function checkScratchedPercentage() {
      if (isRevealed) return;

      try {
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        let transparentPixels = 0;
        const totalSampled = pixels.length / 16; // Sample every 4th pixel for high performance

        for (let i = 3; i < pixels.length; i += 16) {
          if (pixels[i] === 0) {
            transparentPixels++;
          }
        }

        const percentage = (transparentPixels / totalSampled) * 100;

        // Auto-reveal if 38% or more is scratched
        if (percentage > 38) {
          revealEntireCard();
        }
      } catch (err) {
        console.warn('Canvas scratch read error', err);
      }
    }

    function revealEntireCard() {
      if (isRevealed) return;
      isRevealed = true;

      // Play soft celebratory chime
      weddingAudio.playWaxSealCrackSound();

      // Smooth fade-out of canvas
      canvas.classList.add('fade-out');

      // Grand celebration marigold confetti explosion!
      const rect = cardBox.getBoundingClientRect();
      launchConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height * 0.4);

      setTimeout(() => {
        canvas.style.display = 'none';
      }, 700);
    }

    // Event Listeners for Touch and Mouse
    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      scratch(e);
    });

    window.addEventListener('mouseup', () => {
      if (isDrawing) {
        isDrawing = false;
        checkScratchedPercentage();
      }
    });

    canvas.addEventListener('mousemove', scratch);

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isDrawing = true;
      scratch(e);
    }, { passive: false });

    window.addEventListener('touchend', () => {
      if (isDrawing) {
        isDrawing = false;
        checkScratchedPercentage();
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      scratch(e);
    }, { passive: false });

    // Initial paint
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  // ---------------------------------------------------------------------------
  // 4. Pure Self-Contained Celebration Confetti Engine (Zero CDN Dependency)
  // ---------------------------------------------------------------------------
  function launchConfettiBurst(originX, originY) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Palette: Gold, Marigold Yellow, Haldi Ochre, Burgundy, Ivory
    const colors = ['#D4AF37', '#FFD700', '#F5A623', '#3C1620', '#FAF7F2', '#E5C158', '#FF4D6D'];
    const particles = [];

    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      particles.push({
        x: originX || canvas.width / 2,
        y: originY || canvas.height * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }

    let startTime = null;

    function render(now) {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.vx *= 0.98; // air drag
        p.rotation += p.vRot;
        p.opacity = Math.max(0, 1 - elapsed / 2200);

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      if (alive && elapsed < 2500) {
        requestAnimationFrame(render);
      } else {
        canvas.remove();
      }
    }

    requestAnimationFrame(render);
  }

  // ---------------------------------------------------------------------------
  // 5. Real-Time Countdown to Shubh Muhurat (26 Nov 2026 13:05 IST)
  // ---------------------------------------------------------------------------
  function initCountdown() {
    const daysEl = document.getElementById('countDays');
    const hoursEl = document.getElementById('countHours');
    const minsEl = document.getElementById('countMins');
    const secsEl = document.getElementById('countSecs');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    // Target: Thursday, 26 November 2026 13:05:00 IST (UTC+05:30)
    const weddingTime = new Date('2026-11-26T13:05:00+05:30').getTime();

    function update() {
      const now = new Date().getTime();
      const distance = weddingTime - now;

      if (distance < 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minsEl.textContent = '00';
        secsEl.textContent = '00';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((distance % (1000 * 60)) / 1000);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minsEl.textContent = String(mins).padStart(2, '0');
      secsEl.textContent = String(secs).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  // ---------------------------------------------------------------------------
  // 6. Direct WhatsApp Marathi Wishes & Calendar Generator
  // ---------------------------------------------------------------------------
  function initWhatsAppAndCalendar() {
    // WhatsApp Wishes button
    const whatsappBtn = document.getElementById('btnSendWhatsappWish');
    const rsvpNameInput = document.getElementById('rsvpName');
    const rsvpMessageInput = document.getElementById('rsvpDietary'); // Message field

    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const guestName = rsvpNameInput && rsvpNameInput.value.trim() ? rsvpNameInput.value.trim() : 'स्नेहीजन';
        const guestWish = rsvpMessageInput && rsvpMessageInput.value.trim() ? rsvpMessageInput.value.trim() : 'आपणा दोघांना भावी वैवाहिक जीवनासाठी मनःपूर्वक शुभेच्छा व शुभाशीर्वाद!';

        const text = `॥ श्री गणेशाय नमः ॥\n\nआकांक्षा आणि विकास यांच्या शुभविवाहासाठी हार्दिक शुभेच्छा!\n\n${guestWish}\n\nशुभेच्छुक:\n${guestName}\n\n📍 विवाह स्थळ थेट लोकेशन (Google Maps):\nhttps://maps.app.goo.gl/3ZooWCqM5zvsbTBv8\n\n#AkankshaWedsVikas #26Nov2026`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      });
    }

    // Google Calendar 1-Click Link
    const calendarBtns = document.querySelectorAll('.add-to-calendar, .btn-calendar-link');
    calendarBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const calUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
          '&text=' + encodeURIComponent('Akanksha Arvind Kadam & Vikas Shahaji Shinde — Shubh Vivah') +
          '&dates=20261126T073500Z/20261126T120000Z' +
          '&details=' + encodeURIComponent('॥ शुभविवाह सोहळा ॥\nचि.सौ.कां. आकांक्षा आणि चि. विकास यांचा शुभविवाह मुहूर्त दुपारी १:०५ वाजता.\nस्थळ: विवाह स्थळ, मु. वाणी, पो. पिंगोडे, ता. रोहा, जि. रायगड.\n\n📍 थेट Google Maps लोकेशन:\nhttps://maps.app.goo.gl/3ZooWCqM5zvsbTBv8') +
          '&location=' + encodeURIComponent('Vivah Sthal, Vani, Pingode, Roha, Raigad (https://maps.app.goo.gl/3ZooWCqM5zvsbTBv8)');
        window.open(calUrl, '_blank');
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Lookbook Touch Carousel Swipe
  // ---------------------------------------------------------------------------
  function initLookbookSlider() {
    const track = document.getElementById('lookbookTrack');
    const prevBtn = document.getElementById('lookbookPrev');
    const nextBtn = document.getElementById('lookbookNext');

    if (!track) return;

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -300, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: 300, behavior: 'smooth' });
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7b. Cinematic Multi-Slide Ken Burns Hero Slideshow
  // ---------------------------------------------------------------------------
  function initHeroSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    if (!slides.length) return;

    let currentIndex = 0;
    let timer = null;

    function goToSlide(index) {
      slides.forEach((s, idx) => {
        s.classList.toggle('active', idx === index);
      });
      dots.forEach((d, idx) => {
        d.classList.toggle('active', idx === index);
      });
      currentIndex = index;
    }

    function startTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        const nextIndex = (currentIndex + 1) % slides.length;
        goToSlide(nextIndex);
      }, 5500);
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-slide'), 10);
        if (!isNaN(idx)) {
          goToSlide(idx);
          startTimer();
        }
      });
    });

    startTimer();
  }

  // ---------------------------------------------------------------------------
  // 8. Bootstrap on DOMContentLoaded
  // ---------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initEnvelopeOpening();
    initScratchCard();
    initCountdown();
    initWhatsAppAndCalendar();
    initLookbookSlider();
    initHeroSlideshow();

    // Floating Audio Button Click Event
    const audioBtn = document.getElementById('audioToggleBtn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        weddingAudio.toggle();
      });
    }
  });

})();
