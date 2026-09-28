/**
 * Equinox Ultra-Luxury 80% JS Core Application Engine
 */

import { Dermal3DEngine } from './lib/3d-engine.js';
import { store } from './lib/store.js';

export function initEquinoxApp() {
  if (typeof document === 'undefined') return;

  // 1. Initialize 60 FPS HTML5 Canvas 3D Engine
  const engine = new Dermal3DEngine('dermal3DCanvas', {
    depthVal: 'hudDepthVal',
    waveVal: 'hudWaveVal',
    targetVal: 'hudTargetVal',
    downVal: 'hudDownVal',
  });

  // 2. Attach Modality Card Listeners
  const cards = document.querySelectorAll('.modality-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      cards.forEach((c) => c.classList.remove('is-active'));
      card.classList.add('is-active');

      const modeKey = card.getAttribute('data-mode') || 'pico';
      const metaData = store.modalities.find((m) => m.mode === modeKey) || {};

      if (engine) {
        engine.setMode(modeKey, {
          depth: card.getAttribute('data-depth') || metaData.depth,
          layer: card.getAttribute('data-layer') || metaData.layer,
          wave: card.getAttribute('data-wave') || metaData.wave,
          target: card.getAttribute('data-target') || metaData.target,
          down: card.getAttribute('data-down') || metaData.down,
        });
      }
    });
  });

  // 3. Dynamic Real-Time Desk Status
  const statusBadge = document.querySelector('.clinic-status-badge');
  const statusText = document.querySelector('.status-text');
  const statusPulse = document.querySelector('.status-pulse');

  if (statusBadge && statusText) {
    const status = store.getClinicStatus();
    statusText.textContent = status.statusText;
    if (statusPulse) statusPulse.style.background = status.pulseColor;
  }

  // 4. 3D Tilt Movement Handler on Hover
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

  // 5. Smooth Scroll Handler
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Auto-run on DOM Ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEquinoxApp);
  } else {
    initEquinoxApp();
  }
}
