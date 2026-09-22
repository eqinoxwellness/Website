/**
 * Single source of truth for clinic facts.
 * Lines marked `// CONFIRM:` are not yet verified by Equinox. `npm run preflight`
 * lists them before every build; `STRICT=1 npm run build` refuses to build until they are cleared.
 */
const env = import.meta.env;
const orNull = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export const site = {
  name: 'Equinox Aesthetic & Wellness Centre',
  shortName: 'Equinox',
  legalName: 'EQUINOX Aesthetic and Wellness Centre',
  description:
    'Doctor-led aesthetic, skin, hair and wellness consultations in Satya Nagar, Bhubaneswar. Assessment first, clear explanations, no pressure to commit.',
  phoneDisplay: '+91 63725 28534',
  phoneE164: '+916372528534',
  whatsappNumber: '916372528534',
  email: orNull(env.PUBLIC_CLINIC_EMAIL), // CONFIRM: clinic email for the privacy policy and footer
  instagramUrl: orNull(env.PUBLIC_INSTAGRAM_URL), // CONFIRM: Instagram profile URL
  address: {
    street: 'Plot No. 69, 1st Floor, Kali Mandir Road',
    locality: 'Satya Nagar',
    city: 'Bhubaneswar',
    region: 'Odisha',
    postalCode: '751007',
    country: 'IN',
    landmark: 'Above Sweekruti Creations',
  },
  geo: { lat: 20.2829335, lng: 85.8464242 },
  hours: {
    open: '11:00',
    close: '20:00',
    openLabel: '11am to 8pm',
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'],
    closedDay: 'Friday',
  },
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=EQUINOX+Aesthetic+and+Wellness+Centre+Satya+Nagar+Bhubaneswar',
  areaServed: [
    'Satya Nagar', 'Saheed Nagar', 'Kharavela Nagar', 'Vani Vihar', 'Rasulgarh',
    'Jaydev Vihar', 'Mancheswar', 'Nayapalli', 'Bhubaneswar',
  ],
  doctor: {
    displayName: 'Dr Heena', // CONFIRM: full name as registered
    qualification: null as string | null, // CONFIRM: e.g. MBBS, MD (Dermatology) or BHMS
    registration: null as string | null, // CONFIRM: registration number and council
    focus: null as string | null, // CONFIRM: one sentence on clinical focus, in the doctor's own words
    photo: null as string | null, // CONFIRM: real photograph, e.g. '/doctor.jpg' (800×1000) placed in /public
  },
  consultationFee: null as number | null, // CONFIRM: consultation fee in INR
  consultationMinutes: null as number | null, // CONFIRM: typical first-consultation length
  policyUpdated: '2026-09-22',
  dataRetentionMonths: 12, // CONFIRM: how long enquiry records are kept
};

export const tracking = {
  ga4: orNull(env.PUBLIC_GA4_ID),
  gadsId: orNull(env.PUBLIC_GADS_ID),
  gadsLeadLabel: orNull(env.PUBLIC_GADS_LEAD_LABEL),
  gadsWhatsappLabel: orNull(env.PUBLIC_GADS_WHATSAPP_LABEL),
  gadsCallLabel: orNull(env.PUBLIC_GADS_CALL_LABEL),
  metaPixel: orNull(env.PUBLIC_META_PIXEL_ID),
  clarity: orNull(env.PUBLIC_CLARITY_ID),
  gtm: orNull(env.PUBLIC_GTM_ID),
  gscVerification: orNull(env.PUBLIC_GSC_VERIFICATION),
  bingVerification: orNull(env.PUBLIC_BING_VERIFICATION),
};

export const waLink = (text: string) =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;

export const telLink = `tel:${site.phoneE164}`;

export const fullAddress = `${site.address.street}, ${site.address.locality}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;

export const feeLine = () =>
  site.consultationFee
    ? `The consultation fee is ₹${site.consultationFee.toLocaleString('en-IN')}, paid at the clinic.`
    : 'We tell you the consultation fee on WhatsApp or over the phone before you book, so there are no surprises at the desk.';
