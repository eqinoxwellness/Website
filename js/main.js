/**
 * Equinox Aesthetic & Wellness Centre — Clinical Luxury Application Engine
 * Modules:
 * 1. Global Configuration (Analytics, Google Search Console, Clarity, Google Sheets)
 * 2. 60 FPS Interactive Hero 3D Background Canvas
 * 3. Clinical Skin Anatomy & Laser Simulation 3D Engine (with Guided Clinical Demo Stepper & Depth Ruler)
 * 4. Instagram Clinical Video Reels Player & Gallery Controller
 * 5. Interactive Consultation Protocol & Cost Estimator
 * 6. Lead Form with Direct Google Sheets Webhook Integration & WhatsApp Forwarding
 * 7. Real-Time Medical Desk Telemetry & 3D Tilt Perspective
 */

// ==========================================
// 1. GLOBAL CLINIC CONFIGURATION
// ==========================================
const CLINIC_CONFIG = {
  // Google Analytics 4 Measurement ID
  ga4MeasurementId: 'G-27X1PGSVG6',

  // Google Search Console Verification Token
  gscVerificationToken: 'GSC_EQUINOX_VERIFICATION_TOKEN',

  // Microsoft Clarity Project ID
  clarityProjectId: 'yqf2bebv9r',

  // Meta Pixel ID (Facebook & Instagram Ads)
  metaPixelId: '1326462718420658',

  // Google Apps Script Web App URL for Google Sheets lead recording
  googleSheetWebAppUrl: 'https://script.google.com/macros/s/AKfycbw_PLACEHOLDER_EQUINOX_SHEET/exec',

  // Clinic Contact Facts
  phoneRaw: '916372528534',
  phoneDisplay: '+91 63725 28534',
  address: 'Plot No. 69, 1st Floor, Kali Mandir Road, Satya Nagar, Bhubaneswar 751007',
  operatingHours: {
    openHour: 11,
    closeHour: 20,
    closedDays: [5], // 5 = Friday
  }
};

// ==========================================
// 1.1 OMNI-TRACKING TELEMETRY (GOOGLE ADS, META ADS, GA4 & CLARITY)
// ==========================================
const OmniTracker = {
  // Capture URL parameters for Google Ads (gclid) and Meta Ads (fbclid, utm_*)
  initAttribution() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'gad_source', 'gbraid', 'wbraid'];
      const attribution = JSON.parse(sessionStorage.getItem('eqx_ad_attribution') || '{}');
      let changed = false;

      trackingKeys.forEach((key) => {
        const val = urlParams.get(key);
        if (val) {
          attribution[key] = val;
          changed = true;
        }
      });

      if (!attribution.firstLanding) {
        attribution.firstLanding = window.location.pathname;
        attribution.firstReferrer = document.referrer || 'Direct';
        attribution.landingTime = new Date().toISOString();
        changed = true;
      }

      if (changed) {
        sessionStorage.setItem('eqx_ad_attribution', JSON.stringify(attribution));
      }
    } catch (e) {
      // Storage unavailable or disabled
    }
  },

  getAttribution() {
    try {
      return JSON.parse(sessionStorage.getItem('eqx_ad_attribution') || '{}');
    } catch {
      return {};
    }
  },

  // Centralized Event Broadcaster
  sendEvent(eventName, params = {}, metaStandardEvent = null) {
    const attr = this.getAttribution();
    const eventPayload = {
      ...params,
      ...attr,
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      screen_resolution: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString()
    };

    // 1. Google Analytics 4 & Google Ads Conversion Tracking
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventPayload);
    }

    // 2. Meta Ads Pixel (Facebook & Instagram Ads)
    if (typeof window.fbq === 'function') {
      // Compliance with Indian Healthcare Advertising & Meta Healthcare Policy:
      // Send clean action & placement identifiers without clinical condition strings
      const metaPayload = {
        content_name: params.button_text || params.item_name || eventName,
        placement: params.placement || 'general',
        lead_channel: params.method || params.channel || 'web'
      };
      if (metaStandardEvent) {
        window.fbq('track', metaStandardEvent, metaPayload);
      } else {
        window.fbq('trackCustom', eventName, metaPayload);
      }
    }

    // 3. Microsoft Clarity (Session Recordings, Heatmaps & Replays)
    if (typeof window.clarity === 'function') {
      window.clarity('event', eventName);
    }
  },

  // Automate interaction listeners across the page
  initAutoTracking() {
    this.initAttribution();

    // A. WhatsApp Lead Clicks Tracking
    document.addEventListener('click', (e) => {
      const waLink = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"]');
      if (waLink) {
        const placement = waLink.closest('.floating-concierge') ? 'floating_concierge'
          : waLink.closest('.site-header') ? 'header'
          : waLink.closest('.hero-actions') ? 'hero'
          : waLink.closest('.lead-success-card') ? 'lead_success_card'
          : waLink.closest('.treatment-hero') ? 'treatment_hero'
          : waLink.closest('footer') ? 'footer'
          : 'content_cta';

        OmniTracker.sendEvent('generate_lead', {
          method: 'whatsapp',
          placement: placement,
          button_text: (waLink.textContent || '').trim().slice(0, 45)
        }, 'Lead');

        OmniTracker.sendEvent('contact', {
          channel: 'whatsapp',
          placement: placement
        }, 'Contact');
      }

      // B. Direct Phone Call Clicks
      const telLink = e.target.closest('a[href^="tel:"]');
      if (telLink) {
        OmniTracker.sendEvent('contact', {
          method: 'phone_call',
          phone_number: '+916372528534',
          placement: telLink.closest('.site-header') ? 'header' : 'body'
        }, 'Contact');
      }

      // C. Google Maps Directions
      const mapsLink = e.target.closest('a[href*="google.com/maps"], a[href*="maps.app.goo.gl"]');
      if (mapsLink) {
        OmniTracker.sendEvent('find_location', {
          clinic: 'Satya Nagar Clinic'
        }, 'FindLocation');
      }
    });

    // D. Scroll Depth Telemetry (25%, 50%, 75%, 90%)
    const scrollMilestones = [25, 50, 75, 90];
    const reachedDepths = new Set();
    let scrollTimer = null;
    window.addEventListener('scroll', () => {
      if (scrollTimer) return;
      scrollTimer = setTimeout(() => {
        scrollTimer = null;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        const currentPercent = Math.round((scrollTop / docHeight) * 100);

        scrollMilestones.forEach((milestone) => {
          if (currentPercent >= milestone && !reachedDepths.has(milestone)) {
            reachedDepths.add(milestone);
            OmniTracker.sendEvent('scroll_depth', {
              percent: milestone,
              milestone: `${milestone}%`
            });
          }
        });
      }, 100);
    }, { passive: true });

    // E. Engagement & Dwell Time Milestones (30s, 60s, 120s, 300s)
    const dwellMilestones = [30, 60, 120, 300];
    dwellMilestones.forEach((sec) => {
      setTimeout(() => {
        OmniTracker.sendEvent('dwell_time', {
          duration_seconds: sec,
          milestone: `${sec}s`
        });
      }, sec * 1000);
    });
  }
};

// ==========================================
// 2. 60 FPS INTERACTIVE 3D HERO CANVAS
// ==========================================
class Hero3DBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.particles = [];
    this.numParticles = 75;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.time = 0;

    this.resize();
    this.initParticles();
    this.attachEvents();
    this.animate();
  }

  resize() {
    const parent = this.canvas.parentElement || document.body;
    this.width = parent.clientWidth || window.innerWidth;
    this.height = parent.clientHeight || window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * this.width * 1.3,
        y: (Math.random() - 0.5) * this.height * 1.3,
        z: Math.random() * 800 + 100,
        baseSize: Math.random() * 2.8 + 1.2,
        speedZ: Math.random() * 0.4 + 0.2,
        pulseOffset: Math.random() * Math.PI * 2,
        colorType: Math.random() > 0.35 ? 'gold' : 'amber'
      });
    }
  }

  attachEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initParticles();
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.targetMouseX = (e.clientX - rect.left - rect.width / 2) * 0.08;
      this.targetMouseY = (e.clientY - rect.top - rect.height / 2) * 0.08;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.targetMouseX = (touch.clientX - rect.left - rect.width / 2) * 0.05;
        this.targetMouseY = (touch.clientY - rect.top - rect.height / 2) * 0.05;
      }
    }, { passive: true });
  }

  animate() {
    this.time += 0.015;
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    this.ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2 + this.mouseX;
    const cy = this.height / 2 + this.mouseY;
    const fov = 400;

    const projected = [];

    for (let p of this.particles) {
      p.z -= p.speedZ;
      if (p.z <= 20) p.z = 800;

      const waveY = Math.sin(this.time + p.pulseOffset) * 14;
      const waveX = Math.cos(this.time * 0.7 + p.pulseOffset) * 14;

      const scale = fov / (fov + p.z);
      const px = cx + (p.x + waveX) * scale;
      const py = cy + (p.y + waveY) * scale;

      projected.push({
        px,
        py,
        scale,
        z: p.z,
        size: p.baseSize * scale * (1 + Math.sin(this.time * 2 + p.pulseOffset) * 0.25),
        colorType: p.colorType,
        alpha: Math.min(1, Math.max(0.18, (1 - p.z / 800) * 1.2))
      });
    }

    projected.sort((a, b) => b.z - a.z);

    // Luminous connections
    this.ctx.lineWidth = 0.6;
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const dx = projected[i].px - projected[j].px;
        const dy = projected[i].py - projected[j].py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          const lineAlpha = (1 - dist / 110) * 0.25 * Math.min(projected[i].alpha, projected[j].alpha);
          this.ctx.strokeStyle = `rgba(212, 175, 55, ${lineAlpha})`;
          this.ctx.beginPath();
          this.ctx.moveTo(projected[i].px, projected[i].py);
          this.ctx.lineTo(projected[j].px, projected[j].py);
          this.ctx.stroke();
        }
      }
    }

    // Render particles
    for (let p of projected) {
      this.ctx.save();
      const col = p.colorType === 'gold' ? '#F7DC99' : '#D4AF37';
      this.ctx.fillStyle = col;
      this.ctx.shadowColor = col;
      this.ctx.shadowBlur = 10 * p.scale;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.px, p.py, Math.max(1.8, p.size), 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ==========================================
// 3. CLINICAL SKIN ANATOMY & LASER SIMULATION 3D ENGINE
// ==========================================
class AnatomicalDermal3DEngine {
  constructor(canvasId, hudConfig = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.hudConfig = hudConfig;
    this.currentMode = 'pico';
    this.currentStep = 1; // 1: Diagnose, 2: Penetrate, 3: Remodel
    this.isDemoPlaying = false;
    this.demoTimer = null;
    this.pulseProgress = 0;
    this.angleX = 0.35;
    this.angleY = 0.55;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;

    // Define 4 Real Anatomical Skin Layers
    this.skinLayers = [
      { name: 'Epidermis', depth: '0.10 mm', yOffset: -65, color: '#F6D27A', desc: 'Melanin clusters, sunspots, surface texture' },
      { name: 'Papillary Dermis', depth: '1.00 mm', yOffset: -20, color: '#E5A65E', desc: 'Fine collagen mesh & vascular micro-capillaries' },
      { name: 'Reticular Dermis', depth: '2.80 mm', yOffset: 25, color: '#D97398', desc: 'Structural collagen, elastin & deep acne scars' },
      { name: 'Follicular Matrix', depth: '4.20 mm', yOffset: 70, color: '#9D65C9', desc: 'Hair root bulbs, dermal papilla & cellular growth' },
    ];

    this.initDimensions();
    this.initPoints();
    this.attachEvents();
    this.startLoop();
  }

  initDimensions() {
    const parent = this.canvas.parentElement;
    this.width = parent?.clientWidth && parent.clientWidth > 0 ? parent.clientWidth : 800;
    this.height = parent?.clientHeight && parent.clientHeight > 0 ? parent.clientHeight : 350;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  initPoints() {
    this.points = [];
    // Generate cellular tissue points per layer
    this.skinLayers.forEach((layer, layerIdx) => {
      const count = 45;
      for (let i = 0; i < count; i++) {
        this.points.push({
          x: (Math.random() - 0.5) * 440,
          y: layer.yOffset + (Math.random() - 0.5) * 12,
          z: (Math.random() - 0.5) * 440,
          layerIdx: layerIdx,
          size: Math.random() * 3 + 2.5,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    });
  }

  attachEvents() {
    window.addEventListener('resize', () => this.initDimensions());

    const container = this.canvas.parentElement;
    if (!container) return;

    container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.angleY += dx * 0.006;
      this.angleX += dy * 0.006;
      // Clamp vertical tilt
      this.angleX = Math.max(0.1, Math.min(0.75, this.angleX));
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    window.addEventListener('mouseup', () => { this.isDragging = false; });

    // Touch
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastX = e.touches[0].clientX;
        this.lastY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.lastX;
      const dy = e.touches[0].clientY - this.lastY;
      this.angleY += dx * 0.006;
      this.angleX += dy * 0.006;
      this.angleX = Math.max(0.1, Math.min(0.75, this.angleX));
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => { this.isDragging = false; });
  }

  setMode(mode, meta = {}) {
    this.currentMode = mode;
    this.pulseProgress = 0;

    if (this.hudConfig.depthVal && meta.depth) document.getElementById(this.hudConfig.depthVal).textContent = meta.depth;
    if (this.hudConfig.waveVal && meta.wave) document.getElementById(this.hudConfig.waveVal).textContent = meta.wave;
    if (this.hudConfig.targetVal && meta.target) document.getElementById(this.hudConfig.targetVal).textContent = meta.target;
    if (this.hudConfig.downVal && meta.down) document.getElementById(this.hudConfig.downVal).textContent = meta.down;

    // Update Step Explanation
    this.updateStepUI();
  }

  setStep(stepNum) {
    this.currentStep = stepNum;
    this.pulseProgress = 0;
    this.updateStepUI();
  }

  updateStepUI() {
    const stepTextEl = document.getElementById('demoStepText');
    const stepButtons = document.querySelectorAll('.demo-step-btn');
    stepButtons.forEach((btn, idx) => {
      btn.classList.toggle('is-active', idx + 1 === this.currentStep);
    });

    if (!stepTextEl) return;

    const descriptions = {
      pico: [
        'Step 1 (Scan): Cross-polarized diagnosis maps melanin cluster depth and boundaries in the epidermis & reticular dermis.',
        'Step 2 (Pulse): 1064nm picosecond acoustic shockwaves shatter melanin pigment without thermal heat damage.',
        'Step 3 (Clearance): Macrophages clear shattered pigment micro-particles naturally over 3 to 4 weeks.'
      ],
      mnrf: [
        'Step 1 (Scan): Assessment identifies tethered boxcar scar bases and structural pore enlargement.',
        'Step 2 (Penetrate): 2.80mm insulated micro-needles penetrate and discharge calibrated fractional radiofrequency heat.',
        'Step 3 (Remodel): Thermal micro-coagulation zones trigger neo-collagenesis and scar matrix remodeling.'
      ],
      prp: [
        'Step 1 (Scan): Trichoscopic camera identifies miniaturized follicular roots and androgenetic shedding pattern.',
        'Step 2 (Infuse): Autologous growth factors & platelets micro-injected at 4.20mm follicular bulb depth.',
        'Step 3 (Nourish): Vascular endothelial growth factors stimulate micro-circulation to strengthen hair roots.'
      ],
      hydra: [
        'Step 1 (Exfoliate): Vortex suction loosens stratum corneum dead cells and superficial blackheads.',
        'Step 2 (Extract): 40kPa vacuum extracts deeply congested pore sebum and comedones.',
        'Step 3 (Hydrate): Simultaneous vortex infusion of hyaluronic acid, peptides, and botanical antioxidants.'
      ]
    };

    const currentList = descriptions[this.currentMode] || descriptions.pico;
    stepTextEl.textContent = currentList[this.currentStep - 1] || currentList[0];
  }

  playDemo() {
    if (this.isDemoPlaying) {
      clearInterval(this.demoTimer);
      this.isDemoPlaying = false;
      const playBtn = document.getElementById('playDemoBtn');
      if (playBtn) playBtn.textContent = '▶ Play Guided Demo';
      return;
    }

    this.isDemoPlaying = true;
    const playBtn = document.getElementById('playDemoBtn');
    if (playBtn) playBtn.textContent = '⏸ Pause Demo';

    this.currentStep = 1;
    this.updateStepUI();

    this.demoTimer = setInterval(() => {
      this.currentStep++;
      if (this.currentStep > 3) {
        this.currentStep = 1;
      }
      this.updateStepUI();
    }, 4000);
  }

  startLoop() {
    const render = () => {
      if (this.width <= 0 || this.height <= 0) this.initDimensions();
      this.ctx.clearRect(0, 0, this.width, this.height);

      if (!this.isDragging) {
        this.angleY += 0.003;
      }

      this.pulseProgress += 0.025;
      if (this.pulseProgress > 1) this.pulseProgress = 0;

      const fov = 340;
      const cx = this.width / 2;
      const cy = this.height / 2;

      // Project all cell points
      const transformed = this.points.map((p) => {
        let x1 = p.x * Math.cos(this.angleY) - p.z * Math.sin(this.angleY);
        let z1 = p.z * Math.cos(this.angleY) + p.x * Math.sin(this.angleY);

        let y2 = p.y * Math.cos(this.angleX) - z1 * Math.sin(this.angleX);
        let z2 = z1 * Math.cos(this.angleX) + p.y * Math.sin(this.angleX);

        p.pulse += 0.04;

        const scale = fov / (fov + z2 + 280);
        const projX = cx + x1 * scale;
        const projY = cy + y2 * scale;

        return { p, scale, projX, projY, z2 };
      });

      transformed.sort((a, b) => b.z2 - a.z2);

      // 1. Draw 4 Transparent Anatomical Skin Planes
      this.skinLayers.forEach((layer, lIdx) => {
        const layerPts = transformed.filter((t) => t.p.layerIdx === lIdx);
        if (layerPts.length === 0) return;

        // Plane boundary outline
        this.ctx.strokeStyle = layer.color;
        this.ctx.lineWidth = 0.9;
        this.ctx.globalAlpha = 0.25;
        this.ctx.beginPath();
        for (let i = 0; i < layerPts.length; i++) {
          const next = layerPts[(i + 1) % layerPts.length];
          this.ctx.moveTo(layerPts[i].projX, layerPts[i].projY);
          this.ctx.lineTo(next.projX, next.projY);
        }
        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;

        // Layer Name Label on the plane edge
        const leftmostPt = layerPts.reduce((min, cur) => cur.projX < min.projX ? cur : min, layerPts[0]);
        if (leftmostPt) {
          this.ctx.font = '600 11px system-ui, sans-serif';
          this.ctx.fillStyle = layer.color;
          this.ctx.fillText(`${layer.name} (${layer.depth})`, leftmostPt.projX - 10, leftmostPt.projY - 4);
        }
      });

      // 2. Render Active Energy Modality Physics
      if (this.currentStep >= 2) {
        if (this.currentMode === 'pico') {
          // Pico Laser Acoustic Beam
          this.ctx.save();
          this.ctx.strokeStyle = `rgba(246, 210, 122, ${0.95 - this.pulseProgress * 0.4})`;
          this.ctx.lineWidth = 4;
          this.ctx.shadowColor = '#F6D27A';
          this.ctx.shadowBlur = 24;
          this.ctx.beginPath();
          this.ctx.moveTo(cx, 15);
          this.ctx.lineTo(cx, cy + (this.pulseProgress - 0.4) * 110);
          this.ctx.stroke();

          // Shockwave Rings at Target Depth
          this.ctx.strokeStyle = `rgba(246, 210, 122, ${1 - this.pulseProgress})`;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy + 10, this.pulseProgress * 70, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.restore();
        } else if (this.currentMode === 'mnrf') {
          // Micro-needle thermal RF grid
          this.ctx.save();
          this.ctx.strokeStyle = `rgba(229, 166, 94, ${0.85 - this.pulseProgress * 0.5})`;
          this.ctx.lineWidth = 3;
          this.ctx.shadowColor = '#E5A65E';
          this.ctx.shadowBlur = 18;
          for (let k = -2; k <= 2; k++) {
            this.ctx.beginPath();
            this.ctx.moveTo(cx + k * 20, 20);
            this.ctx.lineTo(cx + k * 20, cy + 30);
            this.ctx.stroke();
          }
          this.ctx.beginPath();
          this.ctx.arc(cx, cy + 30, Math.max(10, this.pulseProgress * 90), 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.restore();
        } else if (this.currentMode === 'prp') {
          // Growth Factor Cellular Droplets
          this.ctx.save();
          this.ctx.fillStyle = '#9D65C9';
          this.ctx.shadowColor = '#9D65C9';
          this.ctx.shadowBlur = 15;
          for (let i = 0; i < 8; i++) {
            const py = cy + 50 + Math.sin(this.pulseProgress * Math.PI * 2 + i) * 25;
            const px = cx + Math.cos(this.pulseProgress * Math.PI * 2 + i) * 60;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 4.5, 0, Math.PI * 2);
            this.ctx.fill();
          }
          this.ctx.restore();
        } else if (this.currentMode === 'hydra') {
          // Vortex Spiral Suction
          this.ctx.save();
          this.ctx.strokeStyle = '#38bdf8';
          this.ctx.lineWidth = 2.5;
          this.ctx.shadowColor = '#38bdf8';
          this.ctx.shadowBlur = 12;
          this.ctx.beginPath();
          for (let a = 0; a < Math.PI * 4; a += 0.2) {
            const r = a * 8 * this.pulseProgress;
            const x = cx + Math.cos(a + this.pulseProgress * 6) * r;
            const y = cy - 50 + Math.sin(a + this.pulseProgress * 6) * r * 0.5;
            if (a === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
          }
          this.ctx.stroke();
          this.ctx.restore();
        }
      }

      // 3. Render 3D Spheres with Volumetric Glow
      transformed.forEach(({ p, projX, projY, scale }) => {
        const layerInfo = this.skinLayers[p.layerIdx];
        const alpha = Math.min(1, Math.max(0.35, (scale - 0.25) * 1.6));
        const currentSize = p.size * scale * (1 + Math.sin(p.pulse) * 0.25);

        this.ctx.save();
        this.ctx.fillStyle = layerInfo.color;
        this.ctx.shadowColor = layerInfo.color;
        this.ctx.shadowBlur = 10 * scale;
        this.ctx.globalAlpha = alpha;
        this.ctx.beginPath();
        this.ctx.arc(projX, projY, Math.max(2, currentSize), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });

      requestAnimationFrame(render);
    };

    render();
  }
}

// ==========================================
// 4. INSTAGRAM CLINICAL VIDEO REELS CONTROLLER
// ==========================================
function initInstagramReels() {
  const filterBtns = document.querySelectorAll('.reel-filter-btn');
  const reelCards = document.querySelectorAll('.reel-card');

  // A. Category Filter Handler
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filterVal = btn.getAttribute('data-filter') || 'all';

      reelCards.forEach((card) => {
        const cardCat = card.getAttribute('data-category');
        if (filterVal === 'all' || cardCat === filterVal) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });

      OmniTracker.sendEvent('filter_reels', {
        selected_category: filterVal
      });
    });
  });

  // B. Reel Action Click Telemetry (WhatsApp & Instagram)
  reelCards.forEach((card) => {
    const title = card.querySelector('.reel-title')?.textContent?.trim() || 'Clinical Reel';
    const waBtn = card.querySelector('.btn-royal');
    const igBtn = card.querySelector('.btn-ig-view');

    if (waBtn) {
      waBtn.addEventListener('click', () => {
        OmniTracker.sendEvent('reel_whatsapp_inquiry', {
          reel_title: title,
          placement: 'reels_gallery'
        }, 'Lead');
      });
    }

    if (igBtn) {
      igBtn.addEventListener('click', () => {
        OmniTracker.sendEvent('reel_view_on_instagram', {
          reel_title: title,
          url: igBtn.getAttribute('href')
        }, 'ViewContent');
      });
    }
  });
}

// ==========================================
// 5. ESTIMATOR & CONCERN FINDER DATA
// ==========================================
const CONCERNS_DATA = {
  acne: {
    title: 'Acne & Acne Scar Protocol',
    sessions: { mild: '3 – 4 Sessions', moderate: '4 – 6 Sessions', extensive: '6 – 8 Sessions' },
    modalities: ['Fractional MNRF (2.80mm depth)', 'Salicylic Chemical Peels', 'HydraFacial Vortex'],
    interval: '3 to 4 weeks apart',
    note: 'Active inflammation is calmed first before deep structural scar remodeling begins.'
  },
  pigmentation: {
    title: 'Melasma & Pigmentation Protocol',
    sessions: { mild: '3 – 4 Sessions', moderate: '4 – 6 Sessions', extensive: '6 – 8 Sessions' },
    modalities: ['Pico & Q-Switched 1064nm Laser', 'Targeted Lactic & Ferulic Peels', 'Barrier Support'],
    interval: '3 to 4 weeks apart',
    note: 'Acoustic picosecond pulses break melanin clusters safely without heat rebound.'
  },
  rejuvenation: {
    title: 'Skin Texture & Rejuvenation Protocol',
    sessions: { mild: '2 – 3 Sessions', moderate: '3 – 5 Sessions', extensive: '4 – 6 Sessions' },
    modalities: ['HydraFacial Vortex Infusion', 'Polynucleotide Skin Boosters', 'Gentle Laser Toning'],
    interval: '3 to 4 weeks apart',
    note: 'Restores skin hydration, pore tightness, and smooth light-reflecting elasticity.'
  },
  hair: {
    title: 'Follicular Hair Restoration Protocol',
    sessions: { mild: '4 Sessions', moderate: '4 – 6 Sessions', extensive: '6 – 8 Sessions' },
    modalities: ['Autologous Growth Factor (GFC)', 'Scalp Microneedling (PRP)', 'Nutritional Assessment'],
    interval: 'Monthly sessions (4 weeks)',
    note: 'Direct 4.20mm follicular bulb biostimulation to anchor roots and reduce shedding.'
  },
  wellness: {
    title: 'Hormonal Wellness & Homeopathy Protocol',
    sessions: { mild: 'Monthly Review', moderate: 'Structured 3-Month Plan', extensive: 'Structured 6-Month Plan' },
    modalities: ['Constitutional Homeopathy Consultation', 'PCOS / Thyroid Lifestyle Care', 'Metabolic Weight Review'],
    interval: 'Follow-ups every 3 to 4 weeks',
    note: 'Whole-person clinical assessment addressing hormonal triggers behind skin and hair concerns.'
  }
};

let currentEstimatorConcern = 'acne';
let currentEstimatorSeverity = 'moderate';

function updateEstimatorUI() {
  const data = CONCERNS_DATA[currentEstimatorConcern] || CONCERNS_DATA.acne;
  const titleEl = document.querySelector('.results-header h4');
  const badgeEl = document.querySelector('.results-badge');
  const modalitiesList = document.querySelector('.results-grid ul');
  const cadenceEl = document.querySelector('.cadence-val');
  const noteEl = document.querySelector('.diagnostic-note-val');
  const waBtn = document.querySelector('.results-footer a.btn');

  if (titleEl) titleEl.textContent = data.title;
  if (badgeEl) badgeEl.textContent = data.sessions[currentEstimatorSeverity] || '4 – 6 Sessions';

  if (modalitiesList) {
    modalitiesList.innerHTML = data.modalities.map((m) => `<li>✦ ${m}</li>`).join('');
  }
  if (cadenceEl) cadenceEl.textContent = data.interval;
  if (noteEl) noteEl.textContent = data.note;

  if (waBtn) {
    const text = encodeURIComponent(
      `Hi Equinox, I reviewed the estimate for ${data.title} (${currentEstimatorSeverity} severity) on the website. I would like to book a doctor assessment. #EQ-CALC`
    );
    waBtn.href = `https://wa.me/${CLINIC_CONFIG.phoneRaw}?text=${text}`;
  }
}

// ==========================================
// 6. LEAD FORM & GOOGLE SHEETS WEBHOOK INTEGRATION
// ==========================================
function initLeadForm() {
  const leadForms = document.querySelectorAll('.lead-form');
  leadForms.forEach((form) => {
    let formStarted = false;
    form.addEventListener('focusin', () => {
      if (!formStarted) {
        formStarted = true;
        OmniTracker.sendEvent('form_start', { form_name: 'consultation_callback' }, 'InitiateCheckout');
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = form.querySelector('[name="lf-name"]') || form.querySelector('#lf-name');
      const phoneInput = form.querySelector('[name="lf-phone"]') || form.querySelector('#lf-phone');
      const serviceSelect = form.querySelector('[name="lf-service"]') || form.querySelector('#lf-service');
      const timeRadio = form.querySelector('input[name="lf-time"]:checked');
      const notesInput = form.querySelector('[name="lf-notes"]') || form.querySelector('#lf-notes');
      const submitBtn = form.querySelector('button[type="submit"]');

      const name = nameInput?.value.trim() || 'Visitor';
      const phone = phoneInput?.value.trim() || '';
      const service = serviceSelect?.options[serviceSelect.selectedIndex]?.text || 'General Enquiry';
      const time = timeRadio ? timeRadio.value : 'Anytime';
      const notes = notesInput?.value.trim() || 'None';

      if (!phone || phone.length < 10) {
        alert('Please enter a valid 10-digit mobile number so the doctor desk can reach you.');
        phoneInput?.focus();
        return;
      }

      // Visual feedback: submitting
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Request a call back';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Submitting to Medical Desk...';
      }

      // Payload for Google Sheets Webhook
      const payload = {
        name,
        phone,
        service,
        preferredTime: time,
        notes,
        pageUrl: window.location.href,
        referrer: document.referrer || 'Direct',
        timestamp: new Date().toISOString()
      };

      try {
        // Attempt POST to Google Apps Script Web App
        if (CLINIC_CONFIG.googleSheetWebAppUrl && !CLINIC_CONFIG.googleSheetWebAppUrl.includes('PLACEHOLDER')) {
          await fetch(CLINIC_CONFIG.googleSheetWebAppUrl, {
            method: 'POST',
            mode: 'no-cors', // Google Apps Script requires no-cors on client
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      } catch (err) {
        console.warn('Google Sheet sync notice:', err);
      }

      // Broadcaster: Google Analytics 4, Google Ads, Meta Ads & Microsoft Clarity
      OmniTracker.sendEvent('generate_lead', {
        method: 'callback_form',
        service_category: service,
        preferred_time: time
      }, 'Lead');

      // Success Display Card
      const successHtml = `
        <div class="lead-success-card" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.45); border-radius: 0.85rem; padding: 1.5rem; text-align: center; color: #ffffff;">
          <div style="font-size: 2.2rem; color: #34d399; margin-bottom: 0.5rem;">✓</div>
          <h3 style="color: #ffffff; margin-bottom: 0.4rem; font-size: 1.3rem;">Request Received, ${name}!</h3>
          <p style="color: #e2d2e5; font-size: 0.95rem; margin-bottom: 1.25rem;">
            Your consultation request has been recorded. Our consulting doctor's desk will call you at <strong>${phone}</strong> during clinic hours (${time}).
          </p>
          <a class="btn btn--wa" href="https://wa.me/${CLINIC_CONFIG.phoneRaw}?text=${encodeURIComponent(`Hi Equinox, I just submitted a callback request for ${service}. Name: ${name}, Phone: ${phone}. #EQ-CONFIRM`)}" target="_blank" rel="noopener">
            💬 Open in WhatsApp for Faster Reply
          </a>
        </div>
      `;

      form.innerHTML = successHtml;
    });
  });
}

// ==========================================
// 7. REAL-TIME DESK STATUS & 3D TILT
// ==========================================
function updateClinicTelemetry() {
  const now = new Date();
  // IST Time (UTC + 5:30)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (3600000 * 5.5));
  const day = ist.getDay(); // 0 = Sun, 5 = Fri
  const hours = ist.getHours();

  let isOpen = true;
  let statusText = 'Open 11am–8pm';
  let pulseColor = '#34d399';

  if (day === 5) {
    isOpen = false;
    statusText = 'Closed on Fridays';
    pulseColor = '#f87171';
  } else if (hours < 11) {
    isOpen = false;
    statusText = 'Opens at 11:00 AM';
    pulseColor = '#facc15';
  } else if (hours >= 20) {
    isOpen = false;
    statusText = 'Desk Closed (Opens 11am)';
    pulseColor = '#f87171';
  }

  const statusTextEls = document.querySelectorAll('.status-text, .status-desk-text');
  statusTextEls.forEach((el) => {
    el.textContent = statusText;
  });

  const pulseDots = document.querySelectorAll('.status-pulse');
  pulseDots.forEach((dot) => {
    dot.style.background = pulseColor;
  });
}

function init3DTilt() {
  document.querySelectorAll('.card-3d-wrap').forEach((wrap) => {
    const card = wrap.querySelector('.card-3d-body') || wrap;
    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const tiltX = (y / (rect.height / 2)) * -8;
      const tiltY = (x / (rect.width / 2)) * 8;
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    wrap.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

// ==========================================
// 8. MASTER INITIALIZATION
// ==========================================
function initEquinoxApp() {
  // 0. Auto-Tracking & Attribution Engine (Google Ads, Meta Ads, GA4, Clarity)
  OmniTracker.initAutoTracking();

  // A. Hero 3D Background
  if (document.getElementById('heroCanvas3D')) {
    new Hero3DBackground('heroCanvas3D');
  }

  // B. Anatomical Dermal 3D Simulation
  let dermalEngine = null;
  if (document.getElementById('dermal3DCanvas')) {
    dermalEngine = new AnatomicalDermal3DEngine('dermal3DCanvas', {
      depthVal: 'hudDepthVal',
      waveVal: 'hudWaveVal',
      targetVal: 'hudTargetVal',
      downVal: 'hudDownVal',
    });

    // Modality Cards Click
    const modalityCards = document.querySelectorAll('.modality-card');
    modalityCards.forEach((card) => {
      card.addEventListener('click', () => {
        modalityCards.forEach((c) => c.classList.remove('is-active'));
        card.classList.add('is-active');

        const modeKey = card.getAttribute('data-mode') || 'pico';
        const modeTitle = card.querySelector('.modality-title')?.textContent?.trim() || modeKey;

        OmniTracker.sendEvent('select_content', {
          content_type: 'laser_modality',
          item_name: modeTitle
        }, 'ViewContent');

        dermalEngine.setMode(modeKey, {
          depth: card.getAttribute('data-depth'),
          wave: card.getAttribute('data-wave'),
          target: card.getAttribute('data-target'),
          down: card.getAttribute('data-down'),
        });
      });
    });

    // Play Guided Demo Button
    const playDemoBtn = document.getElementById('playDemoBtn');
    if (playDemoBtn) {
      playDemoBtn.addEventListener('click', () => {
        dermalEngine.playDemo();
        OmniTracker.sendEvent('clinical_demo_interaction', { action: 'toggle_demo' });
      });
    }

    // Step Stepper Buttons
    const stepBtns = document.querySelectorAll('.demo-step-btn');
    stepBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const stepNum = parseInt(btn.getAttribute('data-step') || '1', 10);
        dermalEngine.setStep(stepNum);
        OmniTracker.sendEvent('clinical_demo_step', { step: stepNum });
      });
    });
  }

  // C. Instagram Reels Gallery
  initInstagramReels();

  // D. Dynamic Cost Estimator Tabs
  const concernKeys = ['acne', 'pigmentation', 'rejuvenation', 'hair', 'wellness'];
  const tabButtons = document.querySelectorAll('.estimator-tab');
  tabButtons.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      tabButtons.forEach((t) => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      currentEstimatorConcern = concernKeys[idx] || 'acne';
      updateEstimatorUI();

      OmniTracker.sendEvent('customize_protocol', {
        concern: currentEstimatorConcern
      }, 'CustomizeProduct');
    });
  });

  // Estimator Severity Buttons
  const severityKeys = ['mild', 'moderate', 'extensive'];
  const sevButtons = document.querySelectorAll('.severity-btn');
  sevButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      sevButtons.forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      currentEstimatorSeverity = severityKeys[idx] || 'moderate';
      updateEstimatorUI();

      OmniTracker.sendEvent('customize_severity', {
        severity: currentEstimatorSeverity
      }, 'CustomizeProduct');
    });
  });

  // E. Concern Finder Chips Navigation
  const concernRadios = document.querySelectorAll('.finder input[type="radio"]');
  concernRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      OmniTracker.sendEvent('select_content', {
        content_type: 'concern_navigation',
        item_name: radio.value
      });
      window.location.href = `/${radio.value}/`;
    });
  });

  // F. Lead Form & Telemetry
  initLeadForm();
  updateClinicTelemetry();
  init3DTilt();

  // G. Cookie Consent
  const consentBanner = document.getElementById('consent');
  if (consentBanner) {
    if (localStorage.getItem('eqx_consent')) {
      consentBanner.style.display = 'none';
    }
    const closeConsent = (val) => {
      localStorage.setItem('eqx_consent', val);
      consentBanner.style.display = 'none';
    };
    consentBanner.querySelector('[data-consent-action="all"]')?.addEventListener('click', () => closeConsent('all'));
    consentBanner.querySelector('[data-consent-action="none"]')?.addEventListener('click', () => closeConsent('necessary'));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEquinoxApp);
} else {
  initEquinoxApp();
}
