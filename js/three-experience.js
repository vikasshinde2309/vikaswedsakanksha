/**
 * ============================================================================
 * AKANKSHA & VIKAS — LUXURY ROYAL WEDDING 3D WEBGL EXPERIENCE
 * Powered by Three.js (r128)
 * 
 * Features:
 * 1. Global 3D Ambient WebGL Universe (Floating 3D Gold Petals & Stardust)
 * 2. 3D Camera Parallax (Responsive to Mouse & Mobile Gyroscope)
 * 3. 3D Scroll Journey (Camera glides through depth along Z-axis)
 * 4. Interactive 360° 3D Interlocking Wedding Rings with Diamond Solitaire
 * 5. Physics 3D Tilt on Editorial Portrait & Ceremony Cards with Specular Sheen
 * 6. 3D Sparkle Particle Bursts on User Clicks
 * ============================================================================
 */

(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded. 3D experience will operate in fallback mode.');
    return;
  }

  // ---------------------------------------------------------------------------
  // 1. GLOBAL 3D AMBIENT WEBGL UNIVERSE
  // ---------------------------------------------------------------------------
  class Ambient3DUniverse {
    constructor() {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'webglAmbientCanvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '0'; // Behind interactive content, floating in backdrop
      this.canvas.style.opacity = '0.9';
      document.body.prepend(this.canvas);

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
      this.camera.position.z = 600;

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Lighting
      this.ambientLight = new THREE.AmbientLight(0xFFF2D6, 0.9);
      this.scene.add(this.ambientLight);

      this.cursorLight = new THREE.PointLight(0xD4AF37, 1.8, 800);
      this.cursorLight.position.set(0, 0, 300);
      this.scene.add(this.cursorLight);

      // Mouse & Scroll Tracking
      this.mouseX = 0;
      this.mouseY = 0;
      this.targetCameraX = 0;
      this.targetCameraY = 0;
      this.scrollY = window.scrollY;

      this.initPetals();
      this.initGoldDust();
      this.initEvents();
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    // Procedural 3D Petals (Gold & Bougainvillea Rose Tinted)
    initPetals() {
      const count = 125;
      this.petals = [];
      const group = new THREE.Group();

      // Curved petal geometry
      const petalGeo = new THREE.PlaneGeometry(12, 18, 3, 3);
      const pos = petalGeo.attributes.position;
      // Curve vertices inward like a rose/marigold/bougainvillea petal
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        pos.setZ(i, Math.sin((y / 18) * Math.PI) * 4 - (x * x) * 0.04);
      }
      petalGeo.computeVertexNormals();

      // Palette: 24k Gold, Saffron, and Bougainvillea Magenta/Pink
      const petalColors = [0xD4AF37, 0xF3C950, 0xE5A65D, 0xE91E63, 0xD81B60, 0xC2185B, 0xFF4081, 0xE8B960];

      for (let i = 0; i < count; i++) {
        const color = petalColors[Math.floor(Math.random() * petalColors.length)];
        const mat = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.35,
          metalness: 0.65,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75 + Math.random() * 0.2
        });

        const mesh = new THREE.Mesh(petalGeo, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 1200,
          (Math.random() - 0.5) * 1200,
          (Math.random() - 0.5) * 800
        );
        mesh.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );
        const scale = 0.7 + Math.random() * 1.2;
        mesh.scale.set(scale, scale, scale);

        const speed = {
          x: (Math.random() - 0.5) * 0.4,
          y: -0.6 - Math.random() * 0.8,
          z: (Math.random() - 0.5) * 0.3,
          rotX: (Math.random() - 0.5) * 0.02,
          rotY: (Math.random() - 0.5) * 0.025,
          rotZ: (Math.random() - 0.5) * 0.015,
          oscSpeed: 0.02 + Math.random() * 0.02,
          oscOffset: Math.random() * Math.PI * 2
        };

        this.petals.push({ mesh, speed });
        group.add(mesh);
      }

      this.petalGroup = group;
      this.scene.add(group);
    }

    // 3D Stardust & Fireflies
    initGoldDust() {
      const count = 350;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const scales = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 1600;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1600;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
        scales[i] = Math.random() * 3 + 1;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Circular glowing particle texture
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 240, 180, 1)');
      grad.addColorStop(0.3, 'rgba(212, 175, 55, 0.8)');
      grad.addColorStop(0.7, 'rgba(212, 175, 55, 0.2)');
      grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);

      const material = new THREE.PointsMaterial({
        color: 0xFFDE70,
        size: 9,
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.dustPoints = new THREE.Points(geometry, material);
      this.scene.add(this.dustPoints);
    }

    initEvents() {
      window.addEventListener('resize', () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      });

      window.addEventListener('mousemove', (e) => {
        this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

        // Position 3D point light to follow cursor
        this.cursorLight.position.x = this.mouseX * 300;
        this.cursorLight.position.y = this.mouseY * 200;
      });

      // Gyroscope on mobile
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
          if (e.gamma !== null && e.beta !== null) {
            this.mouseX = (e.gamma / 45); // left-right
            this.mouseY = (e.beta / 45) - 0.5; // front-back
          }
        });
      }

      window.addEventListener('scroll', () => {
        this.scrollY = window.scrollY;
      }, { passive: true });
    }

    animate(now) {
      requestAnimationFrame(this.animate);

      // Smooth camera parallax
      this.targetCameraX = this.mouseX * 80;
      this.targetCameraY = this.mouseY * 60;
      this.camera.position.x += (this.targetCameraX - this.camera.position.x) * 0.05;
      this.camera.position.y += (this.targetCameraY - this.camera.position.y) * 0.05;

      // Scroll creates depth travel
      const scrollOffset = (this.scrollY * 0.25) % 800;
      this.petalGroup.position.y = scrollOffset;

      // Petals organic falling & fluttering
      const time = now * 0.001;
      this.petals.forEach((p, idx) => {
        p.mesh.position.y += p.speed.y;
        p.mesh.position.x += Math.sin(time * 2 + p.speed.oscOffset) * 0.6 + p.speed.x;
        p.mesh.position.z += Math.cos(time * 1.5 + p.speed.oscOffset) * 0.4;

        p.mesh.rotation.x += p.speed.rotX;
        p.mesh.rotation.y += p.speed.rotY;
        p.mesh.rotation.z += p.speed.rotZ;

        // Recycle if below view
        if (p.mesh.position.y < -700) {
          p.mesh.position.y = 700;
          p.mesh.position.x = (Math.random() - 0.5) * 1200;
        }
      });

      // Slowly rotate dust constellation
      if (this.dustPoints) {
        this.dustPoints.rotation.y = time * 0.04;
        this.dustPoints.rotation.x = time * 0.02;
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. INTERACTIVE 360° 3D WEDDING RINGS & MANDALA
  // ---------------------------------------------------------------------------
  class Interactive3DRings {
    constructor(containerEl) {
      this.container = containerEl;
      if (!this.container) return;

      this.width = this.container.clientWidth || 320;
      this.height = this.container.clientHeight || 320;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 100);
      this.camera.position.set(0, 0, 14);

      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.container.appendChild(this.renderer.domElement);
      this.renderer.domElement.style.display = 'block';
      this.renderer.domElement.style.margin = '0 auto';
      this.renderer.domElement.style.cursor = 'grab';

      // Lights
      const ambient = new THREE.AmbientLight(0xFFF0D0, 1.2);
      this.scene.add(ambient);

      this.spot1 = new THREE.PointLight(0xFFEAA0, 2.5, 40);
      this.spot1.position.set(5, 8, 8);
      this.scene.add(this.spot1);

      this.spot2 = new THREE.PointLight(0xE5A65D, 1.8, 40);
      this.spot2.position.set(-6, -5, 6);
      this.scene.add(this.spot2);

      const rimLight = new THREE.PointLight(0xFFFFFF, 2.0, 30);
      rimLight.position.set(0, 0, -8);
      this.scene.add(rimLight);

      this.createRingsAndMandala();
      this.initInteractions();

      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    createRingsAndMandala() {
      this.ringsGroup = new THREE.Group();

      // Materials
      // 1. Vikas Band: Classic 24k Yellow Gold
      const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xD4AF37,
        metalness: 0.95,
        roughness: 0.18,
        emissive: 0x332205,
        emissiveIntensity: 0.1
      });

      // 2. Akanksha Band: Rose Gold
      const roseGoldMaterial = new THREE.MeshStandardMaterial({
        color: 0xE8A49C,
        metalness: 0.95,
        roughness: 0.16,
        emissive: 0x3A181A,
        emissiveIntensity: 0.12
      });

      // Ring Geometries
      const ringGeo = new THREE.TorusGeometry(2.3, 0.32, 24, 72);

      // Groom's Ring (Vikas)
      this.groomRing = new THREE.Mesh(ringGeo, goldMaterial);
      this.groomRing.position.set(-1.1, 0, 0);
      this.groomRing.rotation.set(Math.PI * 0.35, Math.PI * 0.2, 0);
      this.ringsGroup.add(this.groomRing);

      // Bride's Ring (Akanksha) — Interlocked through groom's ring
      this.brideRing = new THREE.Mesh(ringGeo, roseGoldMaterial);
      this.brideRing.position.set(1.1, 0, 0);
      this.brideRing.rotation.set(Math.PI * -0.3, Math.PI * 0.25, Math.PI * 0.1);

      // Diamond Solitaire Setting on Bride's Ring
      const solitaireGroup = new THREE.Group();
      
      // Diamond Crown Setting
      const crownGeo = new THREE.CylinderGeometry(0.42, 0.25, 0.45, 8);
      const crownMesh = new THREE.Mesh(crownGeo, roseGoldMaterial);
      crownMesh.position.set(0, 2.45, 0);
      solitaireGroup.add(crownMesh);

      // Brilliant Diamond Gem (Octahedron crystal)
      const diamondGeo = new THREE.OctahedronGeometry(0.55, 2);
      const diamondMat = new THREE.MeshPhysicalMaterial({
        color: 0xFFFFFF,
        metalness: 0.05,
        roughness: 0.05,
        transmission: 0.95,
        ior: 2.42, // Refractive index of real diamond
        thickness: 1.2,
        specularIntensity: 1.0,
        specularColor: 0xFFFFFF,
        emissive: 0xE8F4F8,
        emissiveIntensity: 0.25
      });
      const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
      diamondMesh.position.set(0, 2.75, 0);
      solitaireGroup.add(diamondMesh);

      this.brideRing.add(solitaireGroup);
      this.ringsGroup.add(this.brideRing);

      // Sacred Vivah Aura Halo (Thin Golden Mandala Ring in background)
      const auraGeo = new THREE.RingGeometry(3.6, 3.75, 64);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xD4AF37,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45
      });
      this.auraMesh = new THREE.Mesh(auraGeo, auraMat);
      this.auraMesh.position.set(0, 0, -1.5);
      this.ringsGroup.add(this.auraMesh);

      // Outer sparkling particles around rings
      const sparkleCount = 45;
      const sparkleGeo = new THREE.BufferGeometry();
      const sparklePos = new Float32Array(sparkleCount * 3);
      for (let i = 0; i < sparkleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const rad = 2.8 + Math.random() * 1.5;
        sparklePos[i * 3] = Math.cos(theta) * rad;
        sparklePos[i * 3 + 1] = Math.sin(theta) * rad;
        sparklePos[i * 3 + 2] = (Math.random() - 0.5) * 2;
      }
      sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
      const sparkleMat = new THREE.PointsMaterial({
        color: 0xFFE082,
        size: 0.16,
        transparent: true,
        opacity: 0.85
      });
      this.ringSparkles = new THREE.Points(sparkleGeo, sparkleMat);
      this.ringsGroup.add(this.ringSparkles);

      this.scene.add(this.ringsGroup);
    }

    initInteractions() {
      let isDragging = false;
      let prevMouseX = 0;
      let prevMouseY = 0;
      this.rotSpeedX = 0;
      this.rotSpeedY = 0.006; // continuous gentle spin

      const canvas = this.renderer.domElement;

      const onStart = (x, y) => {
        isDragging = true;
        prevMouseX = x;
        prevMouseY = y;
        canvas.style.cursor = 'grabbing';
      };

      const onMove = (x, y) => {
        if (!isDragging) return;
        const dx = x - prevMouseX;
        const dy = y - prevMouseY;

        this.ringsGroup.rotation.y += dx * 0.012;
        this.ringsGroup.rotation.x += dy * 0.012;

        this.rotSpeedX = dy * 0.005;
        this.rotSpeedY = dx * 0.005;

        prevMouseX = x;
        prevMouseY = y;
      };

      const onEnd = () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
      };

      // Mouse events
      canvas.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
      window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
      window.addEventListener('mouseup', onEnd);

      // Touch events
      canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          onStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
          onMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      window.addEventListener('touchend', onEnd);

      // Click to shimmer burst
      canvas.addEventListener('click', () => {
        this.triggerShimmerBurst();
      });

      // Responsive resize
      window.addEventListener('resize', () => {
        if (!this.container) return;
        this.width = this.container.clientWidth || 320;
        this.height = this.container.clientHeight || 320;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
      });
    }

    triggerShimmerBurst() {
      // Pulse light and spin burst
      this.spot1.intensity = 5.0;
      this.rotSpeedY = 0.045;
      setTimeout(() => {
        this.spot1.intensity = 2.5;
      }, 400);
    }

    animate(now) {
      requestAnimationFrame(this.animate);
      const time = now * 0.001;

      // Inertia and idle floating
      this.ringsGroup.rotation.y += this.rotSpeedY;
      this.ringsGroup.rotation.x += this.rotSpeedX;

      this.rotSpeedX *= 0.95;
      this.rotSpeedY = this.rotSpeedY * 0.96 + 0.007 * 0.04; // gently ease back to subtle spin

      // Floating bobbing motion
      this.ringsGroup.position.y = Math.sin(time * 1.5) * 0.22;
      this.ringsGroup.rotation.z = Math.cos(time * 0.8) * 0.05;

      // Aura slow counter-rotation
      if (this.auraMesh) {
        this.auraMesh.rotation.z = -time * 0.2;
      }

      // Sparkles shimmer
      if (this.ringSparkles) {
        this.ringSparkles.rotation.z = time * 0.15;
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. PHYSICS-BASED 3D CARD TILT & SPECULAR GOLD SHEEN
  // ---------------------------------------------------------------------------
  function init3DCardTilt() {
    const cardSelectors = [
      '.couple-profile-card',
      '.ceremony-card',
      '.scratch-card-box',
      '.venue-showcase-card',
      '.lookbook-slide'
    ];

    const cards = document.querySelectorAll(cardSelectors.join(','));

    cards.forEach(card => {
      // Ensure perspective parent
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform 0.15s ease-out, box-shadow 0.25s ease';

      // Create specular sheen element if missing
      let sheen = card.querySelector('.card-3d-sheen');
      if (!sheen) {
        sheen = document.createElement('div');
        sheen.className = 'card-3d-sheen';
        sheen.style.position = 'absolute';
        sheen.style.top = '0';
        sheen.style.left = '0';
        sheen.style.width = '100%';
        sheen.style.height = '100%';
        sheen.style.pointerEvents = 'none';
        sheen.style.borderRadius = 'inherit';
        sheen.style.zIndex = '5';
        sheen.style.opacity = '0';
        sheen.style.transition = 'opacity 0.25s ease';
        sheen.style.background = 'radial-gradient(circle at 50% 50%, rgba(255, 245, 210, 0.45) 0%, rgba(212, 175, 55, 0.15) 40%, transparent 70%)';
        card.appendChild(sheen);
      }

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -11; // max 11 deg
        const rotateY = ((x - centerX) / centerX) * 11;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(16px) scale3d(1.015, 1.015, 1.015)`;
        card.style.boxShadow = `0 ${20 + Math.abs(rotateX)}px ${45 + Math.abs(rotateY)}px rgba(60, 22, 32, 0.15)`;

        sheen.style.opacity = '1';
        sheen.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 248, 220, 0.55) 0%, rgba(212, 175, 55, 0.2) 35%, transparent 65%)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)';
        card.style.boxShadow = '';
        sheen.style.opacity = '0';
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.12s ease-out, box-shadow 0.2s ease';
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 4. FLOATING 3D EXPERIENCE CONTROLLER PILL
  // ---------------------------------------------------------------------------
  function init3DControllerHUD() {
    const hud = document.createElement('div');
    hud.className = 'hud-3d-controller';
    hud.innerHTML = `
      <div class="hud-3d-badge" id="hud3DToggle">
        <span class="hud-3d-gem">💎</span>
        <span class="hud-3d-text">3D WebGL Cinema</span>
        <span class="hud-3d-status">Active</span>
      </div>
    `;
    document.body.appendChild(hud);

    const toggle = document.getElementById('hud3DToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        // Scroll smoothly to the 3D Rings Showcase in Couple section
        const ringsEl = document.getElementById('threejsRingsBox');
        if (ringsEl) {
          ringsEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 5. INITIALIZE ON DOM READY
  // ---------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Ambient WebGL universe
    new Ambient3DUniverse();

    // 2. Interactive 3D Wedding Rings in center of couple section
    const ringsContainer = document.getElementById('threejsRingsContainer');
    if (ringsContainer) {
      new Interactive3DRings(ringsContainer);
    }

    // 3. Card tilt
    init3DCardTilt();

    // 4. Floating HUD
    init3DControllerHUD();
  });

})();
