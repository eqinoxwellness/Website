/**
 * 60 FPS HTML5 Canvas 3D Bio-Laser & Dermal Matrix Engine
 * Pure Vanilla JavaScript 3D Perspective Visualizer
 */

export class Dermal3DEngine {
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

    const container = this.canvas.parentElement;
    if (!container) return;

    container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.angleY += dx * 0.006;
      this.angleX += dy * 0.006;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch Support
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.lastMouseX;
      const dy = e.touches[0].clientY - this.lastMouseY;
      this.angleY += dx * 0.006;
      this.angleX += dy * 0.006;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  setMode(mode, meta = {}) {
    this.currentMode = mode;
    if (this.hudIds.depthVal && meta.depth) document.getElementById(this.hudIds.depthVal).textContent = `${meta.depth} (${meta.layer})`;
    if (this.hudIds.waveVal && meta.wave) document.getElementById(this.hudIds.waveVal).textContent = meta.wave;
    if (this.hudIds.targetVal && meta.target) document.getElementById(this.hudIds.targetVal).textContent = meta.target;
    if (this.hudIds.downVal && meta.down) document.getElementById(this.hudIds.downVal).textContent = meta.down;
  }

  startLoop() {
    const render = () => {
      if (this.width <= 0 || this.height <= 0) this.initDimensions();
      this.ctx.clearRect(0, 0, this.width, this.height);

      if (!this.isDragging) {
        this.angleY += 0.003;
      }

      this.beamProgress += 0.025;
      if (this.beamProgress > 1) this.beamProgress = 0;

      const fov = 340;
      const cx = this.width / 2;
      const cy = this.height / 2;

      const layerColors = [
        '#F2C766', // 0: Epidermis - Gold
        '#E09156', // 1: Papillary Dermis - Amber
        '#C24D98', // 2: Reticular Dermis - Magenta/Plum
        '#8B5CF6', // 3: Deep Follicular - Violet
      ];

      const transformed = this.points.map((p) => {
        let x1 = p.x * Math.cos(this.angleY) - p.z * Math.sin(this.angleY);
        let z1 = p.z * Math.cos(this.angleY) + p.x * Math.sin(this.angleY);

        let y2 = p.y * Math.cos(this.angleX) - z1 * Math.sin(this.angleX);
        let z2 = z1 * Math.cos(this.angleX) + p.y * Math.sin(this.angleX);

        p.pulse += 0.04;

        const scale = fov / (fov + z2 + 280);
        const projX = cx + x1 * scale;
        const projY = cy + y2 * scale;

        return { p, x1, y2, z2, scale, projX, projY };
      });

      transformed.sort((a, b) => b.z2 - a.z2);

      // Draw Grid Layer Planes
      for (let l = 0; l < 4; l++) {
        this.ctx.strokeStyle = `rgba(242, 199, 102, ${0.12 + l * 0.04})`;
        this.ctx.lineWidth = 0.8;
        this.ctx.beginPath();
        const layerPts = transformed.filter((t) => t.p.layer === l);
        for (let i = 0; i < layerPts.length; i++) {
          const next = layerPts[(i + 1) % layerPts.length];
          this.ctx.moveTo(layerPts[i].projX, layerPts[i].projY);
          this.ctx.lineTo(next.projX, next.projY);
        }
        this.ctx.stroke();
      }

      // Draw Energy Pulse Vectors
      if (this.currentMode === 'pico') {
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(242, 199, 102, ${0.95 - this.beamProgress * 0.4})`;
        this.ctx.lineWidth = 4.5;
        this.ctx.shadowColor = '#F2C766';
        this.ctx.shadowBlur = 22;
        this.ctx.beginPath();
        this.ctx.moveTo(cx, 10);
        this.ctx.lineTo(cx, cy + (this.beamProgress - 0.5) * 140);
        this.ctx.stroke();
        this.ctx.restore();
      } else if (this.currentMode === 'mnrf') {
        this.ctx.save();
        this.ctx.strokeStyle = `rgba(224, 145, 86, ${0.75 - this.beamProgress * 0.5})`;
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#E09156';
        this.ctx.shadowBlur = 16;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy + 15, Math.max(10, this.beamProgress * 150), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      } else if (this.currentMode === 'prp') {
        this.ctx.save();
        this.ctx.fillStyle = '#C24D98';
        this.ctx.shadowColor = '#C24D98';
        this.ctx.shadowBlur = 14;
        for (let i = 0; i < 8; i++) {
          const py = cy + Math.sin(this.beamProgress * Math.PI * 2 + i) * 60 + 20;
          const px = cx + Math.cos(this.beamProgress * Math.PI * 2 + i) * 75;
          this.ctx.beginPath();
          this.ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      } else if (this.currentMode === 'hydra') {
        this.ctx.save();
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowColor = '#38bdf8';
        this.ctx.shadowBlur = 12;
        this.ctx.beginPath();
        for (let a = 0; a < Math.PI * 4; a += 0.2) {
          const r = a * 9 * this.beamProgress;
          const x = cx + Math.cos(a + this.beamProgress * 6) * r;
          const y = cy - 40 + Math.sin(a + this.beamProgress * 6) * r * 0.5;
          if (a === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Draw 3D Spheres with Volumetric Light Glow
      transformed.forEach(({ p, projX, projY, scale }) => {
        const alpha = Math.min(1, Math.max(0.35, (scale - 0.25) * 1.6));
        const currentSize = p.size * scale * (1 + Math.sin(p.pulse) * 0.25);

        this.ctx.save();
        this.ctx.fillStyle = layerColors[p.layer];
        this.ctx.shadowColor = layerColors[p.layer];
        this.ctx.shadowBlur = 12 * scale;
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
