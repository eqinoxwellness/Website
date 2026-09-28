/**
 * Real-Time Dynamic Clinic Status & Interactive Motion Controller
 */

export function initDynamicHeader() {
  if (typeof window === 'undefined') return;

  // 1. Real-Time Clinic Open/Closed Hours JS Calculator
  const statusBadge = document.querySelector('.clinic-status-badge');
  const statusText = document.querySelector('.status-text');
  const statusPulse = document.querySelector('.status-pulse') as HTMLElement | null;

  if (statusText && statusBadge) {
    const now = new Date();
    // Indian Standard Time (IST) offset +5:30
    const day = now.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    const openMinutes = 11 * 60; // 11:00 AM
    const closeMinutes = 20 * 60; // 8:00 PM

    const isClosedDay = day === 5; // Friday closed
    const isOpenHours = totalMinutes >= openMinutes && totalMinutes < closeMinutes;

    if (!isClosedDay && isOpenHours) {
      statusText.textContent = 'Open Now · Till 8:00 PM';
      if (statusPulse) statusPulse.style.background = '#10b981';
      statusBadge.classList.add('is-open');
    } else if (isClosedDay) {
      statusText.textContent = 'Closed Today (Friday)';
      if (statusPulse) statusPulse.style.background = '#f85149';
      statusBadge.classList.add('is-closed');
    } else if (totalMinutes < openMinutes) {
      statusText.textContent = 'Opens Today at 11:00 AM';
      if (statusPulse) statusPulse.style.background = '#f2c766';
    } else {
      statusText.textContent = 'Closed for Today · Opens 11 AM';
      if (statusPulse) statusPulse.style.background = '#f2c766';
    }
  }

  // 2. Dynamic Scroll Header Elevation & Glass Blur
  const header = document.querySelector('.site-header');
  if (header) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 30) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  // 3. Interactive Smooth Scroll Anchor Handler
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

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDynamicHeader);
  } else {
    initDynamicHeader();
  }
}
