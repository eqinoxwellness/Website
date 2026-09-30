/**
 * Equinox Aesthetic & Wellness Centre — Ultra-Luxury Vanilla JS Engine
 * 100% Pure Client-Side JavaScript (Zero Dependencies, Zero Frameworks)
 */

// 1. 60 FPS HTML5 Canvas 3D Bio-Laser & Dermal Matrix Engine
class Dermal3DEngine {
  constructor(canvasId, hudIds = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.hudIds = hudIds;
    this.currentMode = 'pico';
    this.beamProgress = 0;
    this.angleX = 0.25;
    this.angleY = 0.45;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.initDimensions();
    this.initPoints();
    this.attachEvents();
    this.startLoop();
  }

  initDimensions() {
    const parent = this.canvas.parentElement;
    this.width = parent?.clientWidth && parent.clientWidth > 0 ? parent.clientWidth : 800;
    this.height = parent?.clientHeight && parent.clientHeight > 0 ? parent.clientHeight : 320;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  initPoints() {
    this.points = [];
    const layers = 4;
    const pointsPerLayer = 55;

    for (let l = 0; l < layers; l++) {
      for (let i = 0; i < pointsPerLayer; i++) {
        this.points.push({
          x: (Math.random() - 0.5) * 460,
          y: (l - 1.5) * 58 + (Math.random() - 0.5) * 16,
          z: (Math.random() - 0.5) * 460,
          layer: l,
          size: Math.random() * 3.5 + 2.5,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  attachEvents() {
    window.addEventListener('resize', () => this.initDimensions());

    if (typeof ResizeObserver !== 'undefined' && this.canvas.parentElement) {
      new ResizeObserver(() => this.initDimensions()).observe(this.canvas.parentElement);
    }

    const startDrag = (x, y) => {
      this.isDragging = true;
      this.lastMouseX = x;
      this.lastMouseY = y;
    };

    const doDrag = (x, y) => {
      if (!this.isDragging) return;
      const dx = x - this.lastMouseX;
      const dy = y - this.lastMouseY;
      this.angleY += dx * 0.006;
      this.angleX += dy * 0.006;
      this.angleX = Math.max(-0.6, Math.min(0.6, this.angleX));
      this.lastMouseX = x;
      this.lastMouseY = y;
    };

    const endDrag = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => doDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', endDrag);

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) doDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchend', endDrag);
  }

  setMode(mode, meta = {}) {
    this.currentMode = mode;
    this.beamProgress = 0;

    if (this.hudIds.depthVal) {
      const el = document.getElementById(this.hudIds.depthVal);
      if (el && meta.depth) el.textContent = meta.depth;
    }
    if (this.hudIds.waveVal) {
      const el = document.getElementById(this.hudIds.waveVal);
      if (el && meta.wave) el.textContent = meta.wave;
    }
    if (this.hudIds.targetVal) {
      const el = document.getElementById(this.hudIds.targetVal);
      if (el && meta.target) el.textContent = meta.target;
    }
    if (this.hudIds.downVal) {
      const el = document.getElementById(this.hudIds.downVal);
      if (el && meta.down) el.textContent = meta.down;
    }
  }

  startLoop() {
    const render = () => {
      this.update();
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  update() {
    if (!this.isDragging) {
      this.angleY += 0.0025;
    }
    this.beamProgress = (this.beamProgress + 0.02) % (Math.PI * 2);
    for (let p of this.points) {
      p.pulse += 0.035;
    }
  }

  project(x, y, z) {
    const cosY = Math.cos(this.angleY);
    const sinY = Math.sin(this.angleY);
    const x1 = x * cosY - z * sinY;
    const z1 = z * cosY + x * sinY;

    const cosX = Math.cos(this.angleX);
    const sinX = Math.sin(this.angleX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = z1 * cosX + y * sinX;

    const fov = 420;
    const distance = 520;
    const scale = fov / (distance + z2);

    return {
      x: this.width / 2 + x1 * scale,
      y: this.height / 2 + y2 * scale,
      scale: scale,
      depth: z2,
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Subtle dark gradient background
    const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#150820');
    bgGrad.addColorStop(1, '#0c0412');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Layer grid lines
    const layerColors = ['#f2c766', '#d88b48', '#b54e7d', '#6e2b8c'];
    this.ctx.lineWidth = 1;

    for (let l = 0; l < 4; l++) {
      const yL = (l - 1.5) * 58;
      const corner1 = this.project(-230, yL, -230);
      const corner2 = this.project(230, yL, -230);
      const corner3 = this.project(230, yL, 230);
      const corner4 = this.project(-230, yL, 230);

      this.ctx.strokeStyle = `${layerColors[l]}26`;
      this.ctx.beginPath();
      this.ctx.moveTo(corner1.x, corner1.y);
      this.ctx.lineTo(corner2.x, corner2.y);
      this.ctx.lineTo(corner3.x, corner3.y);
      this.ctx.lineTo(corner4.x, corner4.y);
      this.ctx.closePath();
      this.ctx.stroke();
    }

    // Points Projection & Sorting
    const projected = this.points.map((p) => {
      const proj = this.project(p.x, p.y, p.z);
      return { ...p, px: proj.x, py: proj.y, scale: proj.scale, depth: proj.depth };
    });
    projected.sort((a, b) => b.depth - a.depth);

    for (let p of projected) {
      if (p.scale <= 0) continue;
      const col = layerColors[p.layer];
      const alpha = Math.sin(p.pulse) * 0.25 + 0.75;
      const r = Math.max(1, p.size * p.scale);

      this.ctx.beginPath();
      this.ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
      this.ctx.fillStyle = col;
      this.ctx.globalAlpha = alpha;
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    // Active Laser / RF Beam Visualization
    const beamYOffset = Math.sin(this.beamProgress) * 45;
    const origin = this.project(0, -140, 0);
    const target = this.project(0, -20 + beamYOffset, 0);

    const beamGrad = this.ctx.createLinearGradient(origin.x, origin.y, target.x, target.y);
    beamGrad.addColorStop(0, '#ffffff');
    beamGrad.addColorStop(0.5, '#f2c766');
    beamGrad.addColorStop(1, '#ff3366');

    this.ctx.beginPath();
    this.ctx.moveTo(origin.x, origin.y);
    this.ctx.lineTo(target.x, target.y);
    this.ctx.strokeStyle = beamGrad;
    this.ctx.lineWidth = 3.5;
    this.ctx.shadowColor = '#f2c766';
    this.ctx.shadowBlur = 18;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Focal spot glow
    this.ctx.beginPath();
    this.ctx.arc(target.x, target.y, 6.5, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = '#f2c766';
    this.ctx.shadowBlur = 24;
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }
}

// 2. Modality & Clinic Status Store
const store = {
  getClinicStatus() {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMin = hours * 60 + minutes;

    const openMin = 11 * 60;
    const closeMin = 20 * 60;

    if (day === 5) {
      return { isOpen: false, statusText: 'Closed Today (Friday)', pulseColor: '#f85149' };
    }
    if (totalMin >= openMin && totalMin < closeMin) {
      return { isOpen: true, statusText: 'Open Now · Till 8:00 PM', pulseColor: '#10b981' };
    }
    if (totalMin < openMin) {
      return { isOpen: false, statusText: 'Opens Today at 11:00 AM', pulseColor: '#f2c766' };
    }
    return { isOpen: false, statusText: 'Closed for Today · Opens 11 AM', pulseColor: '#f2c766' };
  },

  modalities: [
    {
      mode: 'pico',
      depth: '1.50 mm',
      wave: '1064nm Pico Pulse',
      target: 'Melanin clusters & pigmentation',
      down: '12–24 hours (Mild flush)'
    },
    {
      mode: 'mnrf',
      depth: '2.80 mm',
      wave: '1MHz RF Matrix',
      target: 'Fibroblast stimulation & scar remodeling',
      down: '2–3 days (Micro-crusting)'
    },
    {
      mode: 'hydra',
      depth: '0.40 mm',
      wave: 'Vortex Nutrient Infusion',
      target: 'Pore clearance & barrier hydration',
      down: 'Zero (Immediate Radiance)'
    },
    {
      mode: 'gfc',
      depth: '3.20 mm',
      wave: 'Autologous Growth Factor',
      target: 'Follicular bulb biostimulation',
      down: '24 hours'
    }
  ]
};

// 3. Interactive Protocol & Cost Estimator Data
const CONCERNS_DATA = {
  acne: {
    title: 'Acne & Acne Scar Protocol',
    modalities: ['Fractional MNRF', 'Salicylic Chemical Peels', 'HydraFacial Vortex'],
    sessions: { mild: '2 – 3 Sessions', moderate: '4 – 6 Sessions', extensive: '6 – 8 Sessions' },
    interval: '3 to 4 weeks apart',
    note: 'Active inflammation is addressed first before deep scar tissue remodeling begins.'
  },
  pigmentation: {
    title: 'Pigmentation & Melasma Care',
    modalities: ['Q-Switched Pico Laser', 'Tranexamic Micro-Infusion', 'Targeted Peels'],
    sessions: { mild: '3 – 4 Sessions', moderate: '5 – 8 Sessions', extensive: '8 – 10 Sessions' },
    interval: '2 to 4 weeks apart',
    note: 'Phototype and sun exposure history guide pulse energy parameters.'
  },
  rejuvenation: {
    title: 'Skin Hydration & Texture Rejuvenation',
    modalities: ['Advanced HydraFacial', 'Skin Boosters (Hyaluronic Acid)', 'PDRN Polynucleotides'],
    sessions: { mild: '2 – 3 Sessions', moderate: '3 – 4 Sessions', extensive: '4 – 6 Sessions' },
    interval: '3 to 4 weeks apart',
    note: 'Supports natural skin barrier repair and internal hydration.'
  },
  hair: {
    title: 'Hair Growth & Scalp Trichology',
    modalities: ['Growth Factor Concentrate (GFC)', 'PRP Biostimulation', 'Scalp Microneedling'],
    sessions: { mild: '4 – 5 Sessions', moderate: '6 – 8 Sessions', extensive: '8 – 12 Sessions' },
    interval: 'Monthly protocol',
    note: 'In-person scalp dermoscopy evaluates follicular bulb viability.'
  },
  wellness: {
    title: 'Hormonal & Holistic Wellness',
    modalities: ['Individualized Homeopathy', 'Nutritional Assessment', 'Hormonal Screening'],
    sessions: { mild: 'Monthly Review', moderate: 'Ongoing Follow-ups', extensive: 'Quarterly Wellness Cycle' },
    interval: 'Monthly review',
    note: 'Addresses root systemic factors alongside topical aesthetic care.'
  }
};

let currentEstimatorConcern = 'acne';
let currentEstimatorSeverity = 'moderate';

function updateEstimatorUI() {
  const data = CONCERNS_DATA[currentEstimatorConcern];
  if (!data) return;

  const titleEl = document.querySelector('.results-header h4');
  const badgeEl = document.querySelector('.results-badge');
  const modalitiesList = document.querySelector('.results-grid ul');
  const cadenceEl = document.querySelector('.results-grid .small');
  const noteEl = document.querySelectorAll('.results-grid .small')[1];
  const waBtn = document.querySelector('.results-footer a.btn');

  if (titleEl) titleEl.textContent = data.title;
  if (badgeEl) badgeEl.textContent = data.sessions[currentEstimatorSeverity] || '4 – 6 Sessions';

  if (modalitiesList) {
    modalitiesList.innerHTML = data.modalities.map(m => `<li>✦ ${m}</li>`).join('');
  }
  if (cadenceEl) cadenceEl.textContent = data.interval;
  if (noteEl) noteEl.textContent = data.note;

  if (waBtn) {
    const msg = encodeURIComponent(
      `Hi, I calculated an estimate for ${data.title} (${currentEstimatorSeverity} level) on the Equinox website. I would like to book a doctor assessment. #EQ-CALC`
    );
    waBtn.href = `https://wa.me/916372528534?text=${msg}`;
  }
}

// 4. Initialize Everything on DOM Load
function initEquinox() {
  // A. Initialize 3D Engine
  const engine = new Dermal3DEngine('dermal3DCanvas', {
    depthVal: 'hudDepthVal',
    waveVal: 'hudWaveVal',
    targetVal: 'hudTargetVal',
    downVal: 'hudDownVal',
  });

  // B. Modality Card Selectors
  const cards = document.querySelectorAll('.modality-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      cards.forEach((c) => c.classList.remove('is-active'));
      card.classList.add('is-active');

      const modeKey = card.getAttribute('data-mode') || 'pico';
      const meta = store.modalities.find((m) => m.mode === modeKey) || {};

      if (engine) {
        engine.setMode(modeKey, {
          depth: card.getAttribute('data-depth') || meta.depth,
          wave: card.getAttribute('data-wave') || meta.wave,
          target: card.getAttribute('data-target') || meta.target,
          down: card.getAttribute('data-down') || meta.down,
        });
      }
    });
  });

  // C. Dynamic Desk Status
  const statusBadge = document.querySelector('.clinic-status-badge');
  const statusText = document.querySelector('.status-text');
  const statusPulse = document.querySelector('.status-pulse');
  if (statusBadge && statusText) {
    const status = store.getClinicStatus();
    statusText.textContent = status.statusText;
    if (statusPulse) statusPulse.style.background = status.pulseColor;
  }

  // D. 3D Tilt Cards
  document.querySelectorAll('.card-3d-wrap').forEach((wrap) => {
    const card = wrap.querySelector('.card-3d-body') || wrap;
    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const tiltX = (y / (rect.height / 2)) * -7;
      const tiltY = (x / (rect.width / 2)) * 7;
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    wrap.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // E. Estimator Tabs
  const concernKeys = ['acne', 'pigmentation', 'rejuvenation', 'hair', 'wellness'];
  const tabButtons = document.querySelectorAll('.estimator-tab');
  tabButtons.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      tabButtons.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      currentEstimatorConcern = concernKeys[idx] || 'acne';
      updateEstimatorUI();
    });
  });

  // F. Estimator Severity Buttons
  const severityKeys = ['mild', 'moderate', 'extensive'];
  const sevButtons = document.querySelectorAll('.severity-btn');
  sevButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      sevButtons.forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      currentEstimatorSeverity = severityKeys[idx] || 'moderate';
      updateEstimatorUI();
    });
  });

  // G. Concern Finder Chip Handling
  const concernRadios = document.querySelectorAll('.finder input[type="radio"]');
  concernRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const val = radio.value;
      const targetUrl = `/${val}/`;
      // Smooth redirect or quick highlight
      window.location.href = targetUrl;
    });
  });

  // H. Lead Form Forwarding to WhatsApp
  const leadForm = document.querySelector('.lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('lf-name')?.value.trim() || 'Visitor';
      const phone = document.getElementById('lf-phone')?.value.trim() || '';
      const serviceSelect = document.getElementById('lf-service');
      const service = serviceSelect?.options[serviceSelect.selectedIndex]?.text || 'General Enquiry';
      const timeRadios = document.querySelectorAll('input[name="lf-time"]:checked');
      const time = timeRadios.length ? timeRadios[0].value : 'Anytime';

      const msg = encodeURIComponent(
        `Hi Equinox, I would like to request a callback.\nName: ${name}\nPhone: ${phone}\nTopic: ${service}\nPreferred Time: ${time}\n#EQ-LEAD`
      );
      window.open(`https://wa.me/916372528534?text=${msg}`, '_blank');
    });
  }

  // I. Cookie Consent Handling
  const consentBanner = document.getElementById('consent');
  if (consentBanner) {
    if (localStorage.getItem('eqx_consent')) {
      consentBanner.style.display = 'none';
    }
    const allowBtn = consentBanner.querySelector('[data-consent-action="all"]');
    const noneBtn = consentBanner.querySelector('[data-consent-action="none"]');
    const saveBtn = consentBanner.querySelector('[data-consent-action="save"]');

    const closeConsent = (val) => {
      localStorage.setItem('eqx_consent', val);
      consentBanner.style.display = 'none';
    };

    if (allowBtn) allowBtn.addEventListener('click', () => closeConsent('all'));
    if (noneBtn) noneBtn.addEventListener('click', () => closeConsent('necessary'));
    if (saveBtn) saveBtn.addEventListener('click', () => closeConsent('custom'));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEquinox);
} else {
  initEquinox();
}
