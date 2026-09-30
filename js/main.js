/**
 * Equinox Aesthetic & Wellness Centre — Ultra-Luxury Vanilla JS Engine
 * Features:
 * 1. 60 FPS Interactive 3D Hero Canvas Background (Golden Constellation & Bio-Wave Field)
 * 2. 60 FPS Interactive 3D Dermal Matrix & Precision Laser Visualizer
 * 3. Interactive Protocol & Consultation Cost Estimator
 * 4. Interactive Concern Finder
 * 5. Real-Time Clinic Desk Operating Telemetry
 * 6. 3D Card Hover Perspective Tilt & Micro-Animations
 */

// ==========================================
// 1. 60 FPS INTERACTIVE 3D HERO CANVAS BACKGROUND
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
        x: (Math.random() - 0.5) * this.width * 1.4,
        y: (Math.random() - 0.5) * this.height * 1.4,
        z: Math.random() * 800 + 100,
        baseSize: Math.random() * 2.8 + 1.2,
        speedZ: Math.random() * 0.4 + 0.2,
        pulseOffset: Math.random() * Math.PI * 2,
        colorType: Math.random() > 0.4 ? 'gold' : 'amethyst'
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
    // Smooth lerp mouse
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    this.ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2 + this.mouseX;
    const cy = this.height / 2 + this.mouseY;
    const fov = 400;

    // Projected particle list
    const projected = [];

    for (let p of this.particles) {
      // Move slightly forward
      p.z -= p.speedZ;
      if (p.z <= 20) p.z = 800;

      // Subtle float wave
      const waveY = Math.sin(this.time + p.pulseOffset) * 15;
      const waveX = Math.cos(this.time * 0.7 + p.pulseOffset) * 15;

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
        alpha: Math.min(1, Math.max(0.15, (1 - p.z / 800) * 1.2))
      });
    }

    // Sort by depth
    projected.sort((a, b) => b.z - a.z);

    // Connect close neighbors with luminous gold threads
    this.ctx.lineWidth = 0.6;
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const dx = projected[i].px - projected[j].px;
        const dy = projected[i].py - projected[j].py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          const lineAlpha = (1 - dist / 110) * 0.25 * Math.min(projected[i].alpha, projected[j].alpha);
          this.ctx.strokeStyle = `rgba(242, 199, 102, ${lineAlpha})`;
          this.ctx.beginPath();
          this.ctx.moveTo(projected[i].px, projected[i].py);
          this.ctx.lineTo(projected[j].px, projected[j].py);
          this.ctx.stroke();
        }
      }
    }

    // Draw glowing spheres
    for (let p of projected) {
      if (p.px < -20 || p.px > this.width + 20 || p.py < -20 || p.py > this.height + 20) continue;

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.px, p.py, Math.max(1, p.size), 0, Math.PI * 2);

      if (p.colorType === 'gold') {
        this.ctx.fillStyle = '#f2c766';
        this.ctx.shadowColor = '#f2c766';
      } else {
        this.ctx.fillStyle = '#d88b48';
        this.ctx.shadowColor = '#d88b48';
      }

      this.ctx.shadowBlur = 10 * p.scale;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fill();
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ==========================================
// 2. 60 FPS INTERACTIVE 3D DERMAL MATRIX & LASER ENGINE
// ==========================================
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
    this.height = parent?.clientHeight && parent.clientHeight > 0 ? parent.clientHeight : 340;
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

    // Deep luxury plum vignette background
    const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#150820');
    bgGrad.addColorStop(1, '#0c0412');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Grid wireframes for 4 distinct dermal layers
    const layerColors = ['#f2c766', '#d88b48', '#b54e7d', '#6e2b8c'];
    this.ctx.lineWidth = 0.9;

    for (let l = 0; l < 4; l++) {
      const yL = (l - 1.5) * 58;
      const corner1 = this.project(-230, yL, -230);
      const corner2 = this.project(230, yL, -230);
      const corner3 = this.project(230, yL, 230);
      const corner4 = this.project(-230, yL, 230);

      this.ctx.strokeStyle = `${layerColors[l]}33`;
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

    // Specialized Modality Firing Simulation
    const cx = this.width / 2;
    const cy = this.height / 2;

    if (this.currentMode === 'pico') {
      // Focused 1064nm Pico Acoustic Shockwave Beam
      const beamYOffset = Math.sin(this.beamProgress) * 40;
      const origin = this.project(0, -140, 0);
      const target = this.project(0, -15 + beamYOffset, 0);

      const beamGrad = this.ctx.createLinearGradient(origin.x, origin.y, target.x, target.y);
      beamGrad.addColorStop(0, '#ffffff');
      beamGrad.addColorStop(0.5, '#f2c766');
      beamGrad.addColorStop(1, '#ff3366');

      this.ctx.beginPath();
      this.ctx.moveTo(origin.x, origin.y);
      this.ctx.lineTo(target.x, target.y);
      this.ctx.strokeStyle = beamGrad;
      this.ctx.lineWidth = 4;
      this.ctx.shadowColor = '#f2c766';
      this.ctx.shadowBlur = 20;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      // Focal spot acoustic bloom
      this.ctx.beginPath();
      this.ctx.arc(target.x, target.y, 7, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = '#f2c766';
      this.ctx.shadowBlur = 25;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    } else if (this.currentMode === 'mnrf') {
      // 1MHz RF Thermal Electro-Matrix
      const origin = this.project(0, 0, 0);
      const rfRadius = (Math.sin(this.beamProgress) * 0.5 + 0.5) * 110 + 20;

      this.ctx.save();
      this.ctx.strokeStyle = '#d88b48';
      this.ctx.lineWidth = 2.5;
      this.ctx.shadowColor = '#d88b48';
      this.ctx.shadowBlur = 16;
      this.ctx.beginPath();
      this.ctx.arc(origin.x, origin.y + 10, rfRadius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    } else if (this.currentMode === 'hydra') {
      // Vortex Hydro-Extraction Spiral
      this.ctx.save();
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 2.5;
      this.ctx.shadowColor = '#38bdf8';
      this.ctx.shadowBlur = 14;
      this.ctx.beginPath();
      for (let a = 0; a < Math.PI * 4; a += 0.2) {
        const r = a * 8 * (Math.sin(this.beamProgress) * 0.5 + 0.5);
        const x = cx + Math.cos(a + this.beamProgress * 4) * r;
        const y = cy - 30 + Math.sin(a + this.beamProgress * 4) * r * 0.5;
        if (a === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
      this.ctx.restore();
    } else if (this.currentMode === 'prp') {
      // Autologous GFC Biostimulation Clusters
      this.ctx.save();
      this.ctx.fillStyle = '#b54e7d';
      this.ctx.shadowColor = '#b54e7d';
      this.ctx.shadowBlur = 15;
      for (let i = 0; i < 8; i++) {
        const py = cy + Math.sin(this.beamProgress * Math.PI * 2 + i) * 55 + 20;
        const px = cx + Math.cos(this.beamProgress * Math.PI * 2 + i) * 75;
        this.ctx.beginPath();
        this.ctx.arc(px, py, 5, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }
}

// ==========================================
// 3. STORE & INTERACTIVE ESTIMATOR CONTROLLER
// ==========================================
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
      return { isOpen: false, statusText: 'Closed Today (Friday) · Resumes Sat 11 AM', pulseColor: '#f85149' };
    }
    if (totalMin >= openMin && totalMin < closeMin) {
      return { isOpen: true, statusText: 'Open Now · Desk Active Till 8:00 PM', pulseColor: '#10b981' };
    }
    if (totalMin < openMin) {
      return { isOpen: false, statusText: 'Opens Today at 11:00 AM · Booking Open', pulseColor: '#f2c766' };
    }
    return { isOpen: false, statusText: 'Closed for Tonight · Re-opens 11 AM', pulseColor: '#f2c766' };
  },

  modalities: [
    {
      mode: 'pico',
      depth: '1.50 mm (Reticular Dermis)',
      wave: '1064nm Pico Pulse',
      target: 'Melanin clusters & pigmentation',
      down: '12–24 hours (Mild flush)'
    },
    {
      mode: 'mnrf',
      depth: '2.80 mm (Deep Collagen Matrix)',
      wave: '1MHz RF Matrix',
      target: 'Fibroblast stimulation & scar remodeling',
      down: '2–3 days (Micro-crusting)'
    },
    {
      mode: 'hydra',
      depth: '0.25 mm (Stratum Corneum)',
      wave: 'Vortex Infusion 40kPa',
      target: 'Sebum extraction & antioxidant infusion',
      down: 'Zero downtime'
    },
    {
      mode: 'prp',
      depth: '4.20 mm (Follicular Matrix)',
      wave: 'Biostimulation Factor',
      target: 'Autologous growth factors & vascular support',
      down: '24 hours (Mild scalp tenderness)'
    }
  ]
};

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
    const msg = encodeURIComponent(
      `Hi, I calculated an estimate for ${data.title} (${currentEstimatorSeverity} level) on the Equinox website. I would like to book a doctor assessment. #EQ-CALC`
    );
    waBtn.href = `https://wa.me/916372528534?text=${msg}`;
  }
}

// ==========================================
// 4. MAIN INITIALIZATION
// ==========================================
function initEquinoxApp() {
  // A. Initialize Hero 3D Background
  if (document.getElementById('heroCanvas3D')) {
    new Hero3DBackground('heroCanvas3D');
  }

  // B. Initialize Dermal 3D Simulation
  if (document.getElementById('dermal3DCanvas')) {
    const engine = new Dermal3DEngine('dermal3DCanvas', {
      depthVal: 'hudDepthVal',
      waveVal: 'hudWaveVal',
      targetVal: 'hudTargetVal',
      downVal: 'hudDownVal',
    });

    const cards = document.querySelectorAll('.modality-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        cards.forEach((c) => c.classList.remove('is-active'));
        card.classList.add('is-active');

        const modeKey = card.getAttribute('data-mode') || 'pico';
        const meta = store.modalities.find((m) => m.mode === modeKey) || {};

        engine.setMode(modeKey, {
          depth: card.getAttribute('data-depth') || meta.depth,
          wave: card.getAttribute('data-wave') || meta.wave,
          target: card.getAttribute('data-target') || meta.target,
          down: card.getAttribute('data-down') || meta.down,
        });
      });
    });
  }

  // C. Update Real-Time Desk Status
  const statusBadge = document.querySelector('.clinic-status-badge');
  const statusText = document.querySelector('.status-text');
  const statusPulse = document.querySelector('.status-pulse');
  if (statusBadge && statusText) {
    const status = store.getClinicStatus();
    statusText.textContent = status.statusText;
    if (statusPulse) statusPulse.style.background = status.pulseColor;
  }

  // D. 3D Tilt Card Effects
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

  // E. Estimator Tabs
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
    });
  });

  // F. Estimator Severity Selectors
  const severityKeys = ['mild', 'moderate', 'extensive'];
  const sevButtons = document.querySelectorAll('.severity-btn');
  sevButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      sevButtons.forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      currentEstimatorSeverity = severityKeys[idx] || 'moderate';
      updateEstimatorUI();
    });
  });

  // G. Concern Finder Chips
  const concernRadios = document.querySelectorAll('.finder input[type="radio"]');
  concernRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      window.location.href = `/${radio.value}/`;
    });
  });

  // H. Lead Form WhatsApp Submission
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

  // I. Cookie Consent
  const consentBanner = document.getElementById('consent');
  if (consentBanner) {
    if (localStorage.getItem('eqx_consent')) {
      consentBanner.style.display = 'none';
    }
    const closeConsent = (val) => {
      localStorage.setItem('eqx_consent', val);
      consentBanner.style.display = 'none';
    };
    const allowBtn = consentBanner.querySelector('[data-consent-action="all"]');
    const noneBtn = consentBanner.querySelector('[data-consent-action="none"]');
    const saveBtn = consentBanner.querySelector('[data-consent-action="save"]');
    if (allowBtn) allowBtn.addEventListener('click', () => closeConsent('all'));
    if (noneBtn) noneBtn.addEventListener('click', () => closeConsent('necessary'));
    if (saveBtn) saveBtn.addEventListener('click', () => closeConsent('custom'));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEquinoxApp);
} else {
  initEquinoxApp();
}
