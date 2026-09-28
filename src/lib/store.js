/**
 * Central State Store & Clinic Data Controller
 * Pure Vanilla JavaScript State Management
 */

export const store = {
  clinicPhone: '+916372528534',
  waNumber: '916372528534',
  
  getWaLink(text = '') {
    return `https://wa.me/${this.waNumber}?text=${encodeURIComponent(text)}`;
  },

  getClinicStatus() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 5=Fri
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMin = hours * 60 + minutes;

    const openMin = 11 * 60; // 11:00 AM
    const closeMin = 20 * 60; // 8:00 PM

    if (day === 5) {
      return { isOpen: false, statusText: 'Closed Today (Friday)', statusClass: 'is-closed', pulseColor: '#f85149' };
    }
    if (totalMin >= openMin && totalMin < closeMin) {
      return { isOpen: true, statusText: 'Open Now · Till 8:00 PM', statusClass: 'is-open', pulseColor: '#10b981' };
    }
    if (totalMin < openMin) {
      return { isOpen: false, statusText: 'Opens Today at 11:00 AM', statusClass: 'is-upcoming', pulseColor: '#f2c766' };
    }
    return { isOpen: false, statusText: 'Closed for Today · Opens 11 AM', statusClass: 'is-upcoming', pulseColor: '#f2c766' };
  },

  modalities: [
    {
      mode: 'pico',
      name: 'Pico & Q-Switched Laser',
      tech: 'Photomechanical Pulse Technology',
      depth: '1.50 mm',
      layer: 'Reticular Dermis',
      wave: '1064nm Pico Pulse',
      target: 'Melanin clusters & pigmentation',
      down: '12–24 hours (Mild flush)',
      desc: 'Delivers ultra-short acoustic pulses to break down deep epidermal and dermal melanin clusters without thermal damage to surrounding tissue.',
      cadence: '3–4 weeks between sessions'
    },
    {
      mode: 'mnrf',
      name: 'Micro-Needle RF (MNRF)',
      tech: 'Fractional Radiofrequency Matrix',
      depth: '2.80 mm',
      layer: 'Deep Collagen Matrix',
      wave: '1MHz RF Matrix',
      target: 'Fibroblast stimulation & scar remodeling',
      down: '2–3 days (Micro-crusting)',
      desc: 'Combines insulated micro-needles with thermal radiofrequency energy at controlled depths to induce neo-collagenesis and remodel deep acne scarring.',
      cadence: '4–6 weeks interval'
    },
    {
      mode: 'prp',
      name: 'PRP & Growth Factor (GFC)',
      tech: 'Autologous Cellular Biostimulation',
      depth: '4.20 mm',
      layer: 'Follicular Matrix',
      wave: 'Biostimulation Factor',
      target: 'Autologous growth factors & vascular support',
      down: '24 hours (Mild scalp tenderness)',
      desc: 'Concentrates active growth factors from your own blood plasma, injected directly into the follicular bulb depth to support miniaturized hair roots.',
      cadence: 'Monthly protocol'
    },
    {
      mode: 'hydra',
      name: 'HydraFacial Vortex Infusion',
      tech: 'Medical-Grade Hydro-Exfoliation',
      depth: '0.25 mm',
      layer: 'Stratum Corneum',
      wave: 'Vortex Infusion 40kPa',
      target: 'Sebum extraction & antioxidant infusion',
      down: 'Zero downtime',
      desc: 'Uses spiral vortex suction to vacuum out comedones while simultaneously infusing targeted botanical antioxidants and hydrating hyaluronic acid.',
      cadence: 'Maintenance every 3–4 weeks'
    }
  ]
};
