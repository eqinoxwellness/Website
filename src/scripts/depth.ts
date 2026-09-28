/**
 * Equinox depth & specular effects.
 *
 * Requirements:
 * - Only active when (hover: hover) and (pointer: fine) matches.
 * - Entirely disabled under prefers-reduced-motion: reduce.
 * - Single passive listener, throttled with requestAnimationFrame.
 * - Disconnected via IntersectionObserver when the hero leaves the viewport.
 * - Transforms only transform/gradient values (no layout triggers).
 */

(() => {
  // Guard against server-side execution
  if (typeof window === 'undefined') return;

  // Hard constraints check
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!finePointer.matches || reducedMotion.matches) return;

  // Cached SVG gradient elements for specular highlight shifting
  const facetL = document.getElementById('eqx-facet-l') as unknown as SVGLinearGradientElement | null;
  const facetD = document.getElementById('eqx-facet-d') as unknown as SVGLinearGradientElement | null;
  const gold = document.getElementById('eqx-gold') as unknown as SVGLinearGradientElement | null;

  // 1. Hero depth parallax & specular gold
  const hero = document.querySelector<HTMLElement>('.hero');

  if (hero) {
    let heroVisible = false;
    let heroRafPending = false;
    let targetX = 0;
    let targetY = 0;

    const updateHero = () => {
      heroRafPending = false;
      if (!heroVisible) return;

      // Update CSS custom properties for transform parallax
      hero.style.setProperty('--pointer-x', targetX.toFixed(3));
      hero.style.setProperty('--pointer-y', targetY.toFixed(3));

      // Specular highlight angle on gold facets: subtle rotation (±8 deg)
      const angle = 45 + targetX * 8 + targetY * 4;
      const angle2 = 45 - targetX * 6 - targetY * 3;

      if (facetL) facetL.setAttribute('gradientTransform', `rotate(${angle.toFixed(1)}, 0.5, 0.5)`);
      if (facetD) facetD.setAttribute('gradientTransform', `rotate(${angle2.toFixed(1)}, 0.5, 0.5)`);
      if (gold) gold.setAttribute('gradientTransform', `rotate(${angle.toFixed(1)}, 0.5, 0.5)`);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!heroVisible) return;
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetX = Math.max(-1, Math.min(1, x));
      targetY = Math.max(-1, Math.min(1, y));

      if (!heroRafPending) {
        heroRafPending = true;
        requestAnimationFrame(updateHero);
      }
    };

    // Detach / pause when hero leaves viewport
    const heroObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          heroVisible = entry.isIntersecting;
          if (!heroVisible) {
            hero.style.setProperty('--pointer-x', '0');
            hero.style.setProperty('--pointer-y', '0');
            if (facetL) facetL.removeAttribute('gradientTransform');
            if (facetD) facetD.removeAttribute('gradientTransform');
            if (gold) gold.removeAttribute('gradientTransform');
          }
        }
      },
      { threshold: 0.05 }
    );

    heroObserver.observe(hero);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  // 2. Surface tilt on doctor card, concern-finder result, and what-to-expect note
  // Maximum 2.5 degrees tilt with shifting soft shadow
  let activeTiltEl: HTMLElement | null = null;
  let tiltRafPending = false;
  let tiltX = 0;
  let tiltY = 0;

  const updateTilt = () => {
    tiltRafPending = false;
    if (!activeTiltEl) return;
    activeTiltEl.style.setProperty('--tilt-x', tiltX.toFixed(3));
    activeTiltEl.style.setProperty('--tilt-y', tiltY.toFixed(3));
  };

  const isTiltTarget = (el: HTMLElement | null): HTMLElement | null => {
    if (!el) return null;
    return el.closest<HTMLElement>('.doctor-card, .finder__result, .note');
  };

  document.addEventListener(
    'pointermove',
    (e: PointerEvent) => {
      const target = isTiltTarget(e.target as HTMLElement);
      if (!target) {
        if (activeTiltEl) {
          activeTiltEl.style.removeProperty('--tilt-x');
          activeTiltEl.style.removeProperty('--tilt-y');
          activeTiltEl.removeAttribute('data-tilting');
          activeTiltEl = null;
        }
        return;
      }

      if (activeTiltEl !== target) {
        if (activeTiltEl) {
          activeTiltEl.style.removeProperty('--tilt-x');
          activeTiltEl.style.removeProperty('--tilt-y');
          activeTiltEl.removeAttribute('data-tilting');
        }
        activeTiltEl = target;
        activeTiltEl.setAttribute('data-tilting', 'true');
      }

      const rect = target.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      tiltX = Math.max(-1, Math.min(1, x));
      tiltY = Math.max(-1, Math.min(1, y));

      if (!tiltRafPending) {
        tiltRafPending = true;
        requestAnimationFrame(updateTilt);
      }
    },
    { passive: true }
  );

  document.addEventListener(
    'pointerleave',
    () => {
      if (activeTiltEl) {
        activeTiltEl.style.removeProperty('--tilt-x');
        activeTiltEl.style.removeProperty('--tilt-y');
        activeTiltEl.removeAttribute('data-tilting');
        activeTiltEl = null;
      }
    },
    { passive: true }
  );
})();
