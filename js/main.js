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
    this.width  = parent.clientWidth  || window.innerWidth;
    this.height = Math.max(parent.clientHeight, window.innerHeight * 0.72);
    this.canvas.width  = this.width;
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
// 3. CLINICAL SKIN CROSS-SECTION VISUALIZER
// ==========================================
class AnatomicalDermal3DEngine {
  constructor(canvasId, hudConfig = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.hudConfig = hudConfig;
    this.currentMode = 'pico';
    this.currentStep = 1;
    this.isDemoPlaying = false;
    this.demoTimer = null;
    this.time = 0;
    this.beamProgress = 0;
    this.beamActive = false;
    this.beamDir = 1;
    this.hoveredLayer = -1;

    // Skin layer cross-sections (ordered top→bottom)
    this.skinLayers = [
      {
        name: 'Epidermis',
        depth: '0–0.1 mm',
        color: '#F7E7C6',
        borderColor: '#E8C97A',
        textColor: '#6B4A16',
        heightRatio: 0.09,
        desc: 'Melanin clusters · Surface texture · Sunspots',
        icon: '☀'
      },
      {
        name: 'Papillary Dermis',
        depth: '0.1–1.0 mm',
        color: '#F0C8A0',
        borderColor: '#D4A054',
        textColor: '#5C330A',
        heightRatio: 0.18,
        desc: 'Fine collagen mesh · Vascular capillaries · Superficial nerves',
        icon: '🩸'
      },
      {
        name: 'Reticular Dermis',
        depth: '1.0–3.0 mm',
        color: '#DDA0A0',
        borderColor: '#C06080',
        textColor: '#4A1020',
        heightRatio: 0.30,
        desc: 'Structural collagen · Elastin fibres · Deep acne scars',
        icon: '🔬'
      },
      {
        name: 'Follicular Matrix',
        depth: '3.0–4.5 mm',
        color: '#C8A0D4',
        borderColor: '#8040A0',
        textColor: '#300050',
        heightRatio: 0.25,
        desc: 'Hair follicle bulbs · Dermal papilla · Stem cell niche',
        icon: '💜'
      },
      {
        name: 'Subcutaneous Tissue',
        depth: '4.5+ mm',
        color: '#F7E0B0',
        borderColor: '#C8A850',
        textColor: '#5A3800',
        heightRatio: 0.18,
        desc: 'Adipose layer · Deep vascular supply · Nerve plexus',
        icon: '⬇'
      }
    ];

    // Mode configuration
    this.modes = {
      pico:      { label: 'Pico Laser', color: '#F6D27A', glow: '#FFE898', targetLayer: 1, targetDepth: 0.27 },
      mnrf:      { label: 'MNRF RF',    color: '#E5A65E', glow: '#FFB870', targetLayer: 2, targetDepth: 0.62 },
      'laser-hair': { label: 'Laser Hair Regrowth', color: '#9D65C9', glow: '#C89CF0', targetLayer: 3, targetDepth: 0.90 },
      gfc:       { label: 'PRP / GFC',  color: '#70C5B0', glow: '#90E5D0', targetLayer: 3, targetDepth: 0.88 },
      alsavique: { label: 'Alsavique',  color: '#A0D870', glow: '#C0F890', targetLayer: 3, targetDepth: 0.82 },
      pdrn:      { label: 'PDRN / Booster', color: '#60B8F0', glow: '#90D8FF', targetLayer: 2, targetDepth: 0.55 },
      diode:     { label: 'Diode Laser', color: '#FF8888', glow: '#FFA8A8', targetLayer: 3, targetDepth: 0.85 },
      hydra:     { label: 'HydraFacial', color: '#38C4E8', glow: '#78E4FF', targetLayer: 0, targetDepth: 0.08 },
    };

    this.initDimensions();
    this.attachEvents();
    this.startBeam();
    this.startLoop();
  }

  initDimensions() {
    const parent = this.canvas.parentElement;
    this.width  = parent?.clientWidth  > 0 ? parent.clientWidth  : 800;
    this.height = parent?.clientHeight > 0 ? parent.clientHeight : 420;
    this.canvas.width  = this.width;
    this.canvas.height = this.height;

    // Layout zones
    this.leftPad   = 170;
    this.rightPad  = 120;
    this.topPad    = 28;
    this.botPad    = 30;
    this.skinLeft  = this.leftPad;
    this.skinRight = this.width - this.rightPad;
    this.skinTop   = this.topPad;
    this.skinBot   = this.height - this.botPad;
    this.skinW     = this.skinRight - this.skinLeft;
    this.skinH     = this.skinBot   - this.skinTop;

    // Pre-compute layer Y positions
    let y = this.skinTop;
    this.skinLayers.forEach((layer) => {
      layer._y = y;
      layer._h = Math.round(layer.heightRatio * this.skinH);
      y += layer._h;
    });
  }

  attachEvents() {
    window.addEventListener('resize', () => {
      this.initDimensions();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const my = e.clientY - rect.top;
      const mx = e.clientX - rect.left;
      this.hoveredLayer = -1;
      if (mx >= this.skinLeft && mx <= this.skinRight) {
        this.skinLayers.forEach((l, i) => {
          if (my >= l._y && my < l._y + l._h) this.hoveredLayer = i;
        });
      }
    });
    this.canvas.addEventListener('mouseleave', () => { this.hoveredLayer = -1; });
  }

  setMode(mode, meta = {}) {
    this.currentMode = mode in this.modes ? mode : 'pico';
    this.beamProgress = 0;
    this.beamActive = false;

    if (this.hudConfig.depthVal && meta.depth)  document.getElementById(this.hudConfig.depthVal)?.textContent !== undefined && (document.getElementById(this.hudConfig.depthVal).textContent = meta.depth);
    if (this.hudConfig.waveVal && meta.wave)    document.getElementById(this.hudConfig.waveVal)?.textContent !== undefined && (document.getElementById(this.hudConfig.waveVal).textContent = meta.wave);
    if (this.hudConfig.targetVal && meta.target) document.getElementById(this.hudConfig.targetVal)?.textContent !== undefined && (document.getElementById(this.hudConfig.targetVal).textContent = meta.target);
    if (this.hudConfig.downVal && meta.down)    document.getElementById(this.hudConfig.downVal)?.textContent !== undefined && (document.getElementById(this.hudConfig.downVal).textContent = meta.down);

    this.updateStepUI();
    setTimeout(() => { this.beamActive = true; }, 300);
  }

  setStep(stepNum) {
    this.currentStep = stepNum;
    this.updateStepUI();
  }

  updateStepUI() {
    const stepTextEl = document.getElementById('demoStepText');
    const stepButtons = document.querySelectorAll('.demo-step-btn');
    stepButtons.forEach((btn, idx) => {
      btn.classList.toggle('is-active', idx + 1 === this.currentStep);
    });

    const descriptions = {
      pico:  ['Step 1 – Diagnostic mapping: cross-polarised light identifies melanin cluster depth across epidermis and dermis.', 'Step 2 – Acoustic pulse: 1064nm picosecond shockwave shatters melanin granules without thermal epidermal damage.', 'Step 3 – Clearance: macrophages phagocytose shattered pigment micro-particles over 3 to 4 weeks.'],
      mnrf:  ['Step 1 – Scar assessment: tethered boxcar and rolling scar bases are mapped on digital imaging.', 'Step 2 – Deep penetration: 2.80mm gold-insulated micro-needles discharge fractional RF heat into reticular dermis.', 'Step 3 – Neo-collagenesis: thermal micro-coagulation zones trigger remodeling and collagen synthesis over 6 weeks.'],
      'laser-hair': ['Step 1 – Trichoscopy: miniaturised follicles and shedding pattern are mapped by dermoscopy camera.', 'Step 2 – Photobiomodulation: 650nm low-level laser energises mitochondrial ATP synthesis in follicle cells.', 'Step 3 – Micro-circulation boost: laser drives capillary vasodilation and nutrient delivery around the follicular bulb.'],
      gfc:   ['Step 1 – Blood draw: 20ml autologous blood is centrifuged to concentrate platelets and growth factors.', 'Step 2 – Scalp infusion: GFC is micro-injected at 4.2mm depth directly at the follicular dermal papilla.', 'Step 3 – Anagen activation: VEGF and PDGF extend the active growth phase and reduce miniaturisation.'],
      pdrn:  ['Step 1 – Hydration mapping: moisture levels and barrier integrity assessed with corneometry.', 'Step 2 – PDRN micro-infusion: salmon DNA polynucleotides deposited at 1.2mm papillary dermis depth.', 'Step 3 – Fibroblast activation: PDRN stimulates collagen I & III synthesis and epidermal barrier regeneration.'],
      diode: ['Step 1 – Cooling prep: sapphire contact tip chills skin surface to 4°C to protect the epidermis.', 'Step 2 – Follicular targeting: 808nm diode pulses absorbed by anagen melanin in the hair follicle matrix.', 'Step 3 – Thermal disruption: selective photothermolysis disables the follicle bulge without epidermal injury.'],
      alsavique: ['Step 1 – Scalp analysis: sebum levels, follicular plugging, and root density assessed.', 'Step 2 – Peptide infusion: Italian Alsavique complex micro-injected at the perifollicular vascular zone (3.5mm).', 'Step 3 – Root nourishment: oligo-elements and vascular signalling molecules revitalise depleted hair roots.'],
      hydra: ['Step 1 – Exfoliation: vortex tip loosens stratum corneum dead cells and superficial comedones.', 'Step 2 – Extraction: 40 kPa vacuum draws out pore sebum without manual pressure.', 'Step 3 – Infusion: hyaluronic acid, antioxidants, and peptide serums delivered under pressure into open pores.'],
    };

    if (stepTextEl) {
      const list = descriptions[this.currentMode] || descriptions.pico;
      stepTextEl.textContent = list[this.currentStep - 1] || list[0];
    }
  }

  playDemo() {
    if (this.isDemoPlaying) {
      clearInterval(this.demoTimer);
      this.isDemoPlaying = false;
      const btn = document.getElementById('playDemoBtn');
      if (btn) btn.textContent = '▶ Play Guided Simulation';
      return;
    }
    this.isDemoPlaying = true;
    const btn = document.getElementById('playDemoBtn');
    if (btn) btn.textContent = '⏸ Pause Demo';
    this.currentStep = 1;
    this.beamActive = true;
    this.updateStepUI();
    this.demoTimer = setInterval(() => {
      this.currentStep++;
      if (this.currentStep > 3) this.currentStep = 1;
      this.updateStepUI();
    }, 3500);
  }

  startBeam() {
    this.beamActive = true;
  }

  startLoop() {
    const render = () => {
      this.time += 0.025;
      if (this.beamActive) {
        this.beamProgress += 0.018 * this.beamDir;
        if (this.beamProgress >= 1) { this.beamProgress = 1; this.beamDir = -1; }
        if (this.beamProgress <= 0) { this.beamProgress = 0; this.beamDir =  1; }
      }

      const ctx = this.ctx;
      const W = this.width, H = this.height;
      ctx.clearRect(0, 0, W, H);

      // ─── BACKGROUND ───────────────────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#1A1410');
      bg.addColorStop(1, '#0D0A08');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const sL = this.skinLeft, sT = this.skinTop, sW = this.skinW, sH = this.skinH;

      // ─── DEPTH RULER (left of skin) ────────────────────────────────
      const rulerX = sL - 22;
      ctx.strokeStyle = 'rgba(197,154,63,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(rulerX, sT); ctx.lineTo(rulerX, sT + sH); ctx.stroke();
      // Ruler ticks at 1mm intervals
      const totalMm = 5.0;
      for (let mm = 0; mm <= totalMm; mm += 0.5) {
        const ty = sT + (mm / totalMm) * sH;
        const tickLen = mm === Math.round(mm) ? 8 : 4;
        ctx.strokeStyle = mm === Math.round(mm) ? 'rgba(197,154,63,0.6)' : 'rgba(197,154,63,0.3)';
        ctx.beginPath(); ctx.moveTo(rulerX - tickLen, ty); ctx.lineTo(rulerX, ty); ctx.stroke();
        if (mm === Math.round(mm) && mm <= totalMm) {
          ctx.fillStyle = 'rgba(197,154,63,0.7)';
          ctx.font = '500 10px system-ui, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(`${mm.toFixed(0)} mm`, rulerX - 10, ty + 3.5);
        }
      }
      ctx.fillStyle = 'rgba(197,154,63,0.55)';
      ctx.font = '600 10px system-ui, sans-serif';
      ctx.save(); ctx.translate(rulerX - 36, sT + sH / 2);
      ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center';
      ctx.fillText('DEPTH', 0, 0); ctx.restore();

      // ─── SKIN LAYERS ───────────────────────────────────────────────
      this.skinLayers.forEach((layer, i) => {
        const ly = layer._y, lh = layer._h;
        const isHovered = this.hoveredLayer === i;

        // Gradient fill
        const grad = ctx.createLinearGradient(sL, 0, sL + sW, 0);
        grad.addColorStop(0, layer.color + 'CC');
        grad.addColorStop(0.5, layer.color + 'E8');
        grad.addColorStop(1, layer.color + '88');
        ctx.fillStyle = grad;
        ctx.globalAlpha = isHovered ? 1 : 0.82;
        ctx.fillRect(sL, ly, sW, lh - 1);
        ctx.globalAlpha = 1;

        // Tissue texture dots
        ctx.globalAlpha = 0.25;
        for (let d = 0; d < Math.floor(sW / 14); d++) {
          const tx = sL + 10 + d * 14 + ((i * 7) % 8);
          const ty = ly + lh / 2 + Math.sin(d + i * 2.1 + this.time * 0.5) * (lh * 0.2);
          ctx.fillStyle = layer.borderColor;
          ctx.beginPath();
          ctx.arc(tx, ty, isHovered ? 2.5 : 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Border
        ctx.strokeStyle = layer.borderColor;
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.globalAlpha = isHovered ? 0.9 : 0.45;
        ctx.strokeRect(sL, ly, sW, lh - 1);
        ctx.globalAlpha = 1;

        // Left label panel
        const panelW = sL - 8;
        ctx.fillStyle = layer.textColor;
        ctx.globalAlpha = isHovered ? 1 : 0.85;
        ctx.font = `700 ${isHovered ? 12 : 11}px system-ui, sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(layer.name, sL - 26, ly + (lh < 36 ? lh / 2 + 4 : 20));
        ctx.font = '500 9.5px system-ui, sans-serif';
        ctx.fillStyle = layer.borderColor;
        ctx.fillText(layer.depth, sL - 26, ly + (lh < 36 ? lh / 2 + 16 : 34));

        if (lh >= 42 && isHovered) {
          ctx.font = '400 9px system-ui, sans-serif';
          ctx.fillStyle = layer.textColor;
          ctx.fillText(layer.desc, sL - 26, ly + 48);
        }
        ctx.globalAlpha = 1;

        // Right-side depth guide line
        ctx.strokeStyle = layer.borderColor;
        ctx.lineWidth = 0.6;
        ctx.globalAlpha = 0.3;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(sL + sW + 2, ly);
        ctx.lineTo(sL + sW + 12, ly);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      });

      // ─── ENERGY BEAM ANIMATION ─────────────────────────────────────
      const mode = this.modes[this.currentMode] || this.modes.pico;
      const targetY = sT + mode.targetDepth * sH;
      const beamX = sL + sW * 0.5 + Math.sin(this.time * 0.4) * (sW * 0.08);

      if (this.beamActive && this.currentStep >= 2) {
        const beamEndY = sT + this.beamProgress * mode.targetDepth * sH;

        // Beam glow shaft
        const bGrad = ctx.createLinearGradient(beamX, sT - 40, beamX, beamEndY);
        bGrad.addColorStop(0, mode.glow + 'FF');
        bGrad.addColorStop(0.6, mode.color + 'CC');
        bGrad.addColorStop(1, mode.color + '44');
        ctx.save();
        ctx.shadowColor = mode.glow;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = bGrad;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(beamX, sT - 40);
        ctx.lineTo(beamX, beamEndY);
        ctx.stroke();

        // Beam entry hairline
        ctx.strokeStyle = mode.glow;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(beamX - 12, sT - 40);
        ctx.lineTo(beamX + 12, sT - 40);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Impact rings at target depth
        if (this.beamProgress > 0.7) {
          const ringAlpha = (this.beamProgress - 0.7) / 0.3;
          for (let r = 1; r <= 3; r++) {
            ctx.strokeStyle = mode.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = ringAlpha * (1 - r * 0.28);
            ctx.shadowColor = mode.glow;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(beamX, beamEndY, r * 16 * ringAlpha, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
        ctx.restore();
      }

      // ─── TARGET DEPTH INDICATOR (right side) ───────────────────────
      ctx.fillStyle = mode.color;
      ctx.globalAlpha = 0.85 + Math.sin(this.time * 2) * 0.1;
      ctx.font = '700 10px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`▶ ${mode.label}`, sL + sW + 16, targetY + 4);
      // Dashed line to target
      ctx.strokeStyle = mode.color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sL + sW, targetY);
      ctx.lineTo(sL + sW + 14, targetY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // ─── TOP LABEL: Probe/Handpiece ────────────────────────────────
      if (this.currentStep >= 2) {
        const probeX = beamX;
        ctx.save();
        ctx.fillStyle = mode.glow;
        ctx.shadowColor = mode.glow;
        ctx.shadowBlur = 12;
        ctx.fillRect(probeX - 14, sT - 52, 28, 12);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1A1410';
        ctx.font = '600 8px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HANDPIECE', probeX, sT - 43);
        ctx.restore();
      }

      // ─── SURFACE LABEL ─────────────────────────────────────────────
      ctx.fillStyle = 'rgba(230,200,130,0.6)';
      ctx.font = '600 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SKIN SURFACE', sL + sW / 2, sT - 4);

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

  // E.1 Interactive Clinical Concern & Modality Matcher
  const concernPillBtns = document.querySelectorAll('.concern-pill-btn');
  concernPillBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetConcern = btn.getAttribute('data-target-concern');
      if (!targetConcern) return;

      concernPillBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      document.querySelectorAll('.concern-panel').forEach((p) => p.classList.remove('is-active'));
      const activePanel = document.getElementById(`panel-${targetConcern}`);
      if (activePanel) {
        activePanel.classList.add('is-active');
      }

      OmniTracker.sendEvent('select_content', {
        content_type: 'concern_matcher',
        item_name: targetConcern
      }, 'ViewContent');
    });
  });

  // E.2 Mobile Navigation Drawer Toggle
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // F. Lead Form & Telemetry
  initLeadForm();
  updateClinicTelemetry();
  init3DTilt();

  // F.1 SKIN DEPTH DIAGRAM — CSS diagram modality selector
  (function initSkinDiagram() {
    const modalityCards = document.querySelectorAll('[data-target-layer]');
    if (!modalityCards.length) return;

    const layers = {
      epidermis:    document.getElementById('layer-epidermis'),
      papillary:    document.getElementById('layer-papillary'),
      reticular:    document.getElementById('layer-reticular'),
      follicular:   document.getElementById('layer-follicular'),
      subcutaneous: document.getElementById('layer-subcutaneous'),
    };

    const nameEl      = document.getElementById('activeModalityName');
    const depthEl     = document.getElementById('activeDepthDisplay');
    const hudDepth    = document.getElementById('hudDepthVal');
    const hudWave     = document.getElementById('hudWaveVal');
    const hudTarget   = document.getElementById('hudTargetVal');
    const hudDown     = document.getElementById('hudDownVal');
    const stepText    = document.getElementById('demoStepText');
    const laserBeam   = document.getElementById('laserBeam');
    const handpiece   = document.getElementById('handpiece');
    const impactRing  = document.getElementById('impactRing');

    const layerOrder = ['epidermis','papillary','reticular','follicular','subcutaneous'];

    function clearHighlights() {
      layerOrder.forEach((k) => {
        if (layers[k]) layers[k].classList.remove('is-highlighted');
      });
    }

    function fireLaserBeam(targetLayer, beamColor, beamHeight) {
      if (!handpiece || !laserBeam) return;

      // Set beam colour via CSS custom property
      handpiece.style.setProperty('--beam-color', beamColor);
      handpiece.style.display = 'block';

      // Reset beam
      laserBeam.style.height = '0';
      if (impactRing) {
        impactRing.style.width = '0';
        impactRing.style.height = '0';
        impactRing.style.opacity = '0';
        impactRing.style.setProperty('--beam-color', beamColor);
      }

      // Animate beam growing downward
      requestAnimationFrame(() => {
        setTimeout(() => {
          laserBeam.style.height = beamHeight;

          // After beam lands, show impact ring
          setTimeout(() => {
            if (impactRing) {
              impactRing.style.width = '24px';
              impactRing.style.height = '24px';
              impactRing.style.opacity = '1';
            }
          }, 1200);
        }, 50);
      });
    }

    function selectModality(card) {
      // Remove active from all
      modalityCards.forEach((c) => c.classList.remove('is-active'));
      card.classList.add('is-active');

      const targetLayer  = card.dataset.targetLayer;
      const beamColor    = card.dataset.beamColor || '#F6D27A';
      const beamHeight   = card.dataset.beamHeight || '50%';
      const modalityName = card.querySelector('[style*="font-weight: 700; color: var(--text-heading)"]')?.textContent
                          || card.dataset.mode;
      const depth  = card.dataset.depth || '';
      const wave   = card.dataset.wave  || '';
      const target = card.dataset.target || '';
      const down   = card.dataset.down  || '';

      // Update diagram top bar
      if (nameEl) nameEl.textContent = modalityName;
      if (depthEl) depthEl.textContent = 'Target: ' + (depth.split(' ')[0] || '');

      // Update HUD boxes
      if (hudDepth)  hudDepth.textContent  = depth;
      if (hudWave)   hudWave.textContent   = wave;
      if (hudTarget) hudTarget.textContent = target;
      if (hudDown)   hudDown.textContent   = down;

      // Update step text
      if (stepText) {
        stepText.innerHTML = `<strong style="color:var(--gold-deep)">Step 1 — Diagnose:</strong> Physician maps your concern area and selects appropriate parameters.<br><br>
          <strong style="color:var(--gold-deep)">Step 2 — Treat:</strong> ${wave} is applied, reaching <strong>${depth}</strong> in the skin.<br><br>
          <strong style="color:var(--gold-deep)">Step 3 — Recover:</strong> ${down}.`;
      }

      // Highlight layers up to and including the target layer
      clearHighlights();
      let found = false;
      layerOrder.forEach((k) => {
        if (!found && layers[k]) {
          layers[k].classList.add('is-highlighted');
          if (k === targetLayer) found = true;
        }
      });

      // Fire the animated beam
      fireLaserBeam(targetLayer, beamColor, beamHeight);

      // Scroll diagram into view smoothly on mobile
      const diagram = document.getElementById('skinDiagram');
      if (diagram && window.innerWidth < 960) {
        diagram.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // Attach listeners
    modalityCards.forEach((card) => {
      card.addEventListener('click', () => selectModality(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectModality(card);
        }
      });
    });

    // Auto-select first card on load
    if (modalityCards.length) {
      setTimeout(() => selectModality(modalityCards[0]), 400);
    }

    // Demo step buttons
    const stepBtns = document.querySelectorAll('.demo-step-btn');
    stepBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const activeCard = document.querySelector('.modality-card.is-active');
        if (!activeCard) return;
        const step = parseInt(btn.dataset.step);
        const depth  = activeCard.dataset.depth  || '';
        const wave   = activeCard.dataset.wave   || '';
        const down   = activeCard.dataset.down   || '';
        const steps = [
          `<strong style="color:var(--gold-deep)">Step 1 — Diagnosis &amp; Mapping:</strong> The physician examines your skin phototype, photos the concern area, and calibrates the ${wave} parameters to your individual skin characteristics.`,
          `<strong style="color:var(--gold-deep)">Step 2 — Treatment at ${depth}:</strong> The handpiece is placed on the skin. Energy penetrates precisely to the target layer. You may feel mild warmth or pressure depending on the modality.`,
          `<strong style="color:var(--gold-deep)">Step 3 — Recovery &amp; Aftercare:</strong> ${down}. Clinic staff guide you through post-treatment care instructions before you leave.`
        ];
        if (stepText && steps[step - 1]) stepText.innerHTML = steps[step - 1];
        stepBtns.forEach((b) => b.style.fontWeight = '600');
        btn.style.fontWeight = '800';
      });
    });
  })();


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

  // H. SCROLL-REVEAL (IntersectionObserver — no library)
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: reveal immediately for old browsers
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.classList.add('is-revealed');
    });
  }

  // I. HEADER SCROLL STATE (add .is-scrolled after hero)
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    const onScroll = () => {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // J. ACTIVE NAV LINK HIGHLIGHTING
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.header-nav a').forEach((link) => {
    const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, '') || '/';
    if (linkPath === currentPath) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // K. SERVICE CARD TILT — subtle 3D perspective on hover for featured cards
  document.querySelectorAll('.featured-service-card, .service-luxury-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) scale(1.015)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEquinoxApp);
} else {
  initEquinoxApp();
}
