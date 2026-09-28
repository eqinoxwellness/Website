/**
 * Treatment modalities available at the clinic.
 * Source: the clinic's list dated 21 September 2026.
 *
 * Copy rules (in addition to AGENTS.md):
 * - Never use "skin lightening", "fairness" or "whitening". Use melasma and pigmentation treatment.
 * - Laser hair reduction is reduction, not removal for life. Note maintenance sessions.
 * - PRP, GFC, Alsavique: describe procedure and course, no regrowth promises or percentages.
 * - Exosome therapy: note evidence is still developing.
 * - Child counselling: parent pre-call note.
 * - Every group ends with: doctor assesses first, then explains options, sessions and cost.
 */

export type TreatmentGroup = 'Skin' | 'Hair and scalp' | 'Homeopathy and counselling';

export type Treatment = {
  name: string;
  what: string;
  usedFor: string;
  caution?: string;
  servicePages: string[];
};

export type TreatmentCategory = {
  group: TreatmentGroup;
  items: Treatment[];
  footer: string;
};

const assessFirst =
  'The doctor assesses your concern first, then explains which of these options may suit you, how sessions work and what they cost.';

export const treatmentCategories: TreatmentCategory[] = [
  {
    group: 'Skin',
    items: [
      {
        name: 'Advanced HydraFacial',
        what: 'A multi-step facial that cleanses, exfoliates, extracts and hydrates using a device with medical-grade serums.',
        usedFor: 'Dull or dehydrated skin, congested pores, uneven texture and fine lines.',
        servicePages: ['skin-rejuvenation'],
      },
      {
        name: 'Skin boosters',
        what: 'Micro-injections of hyaluronic acid into the skin to improve hydration from within.',
        usedFor: 'Dehydrated, dull or crepey skin that does not respond to topical care alone.',
        servicePages: ['skin-rejuvenation'],
      },
      {
        name: 'PDRN therapy',
        what: 'Micro-injections of polynucleotides derived from salmon DNA, aimed at supporting skin repair.',
        usedFor: 'Skin that looks tired, uneven in texture or slow to recover after procedures.',
        servicePages: ['skin-rejuvenation'],
      },
      {
        name: 'Skin vector therapy',
        what: 'A technique using threads or fillers placed along specific vectors to support skin structure.',
        usedFor: 'Loss of firmness or definition in the mid-face and jawline area.',
        servicePages: ['skin-rejuvenation'],
      },
      {
        name: 'Acne treatment',
        what: 'A combination of topical care, in-clinic procedures and sometimes oral medication, guided by the type and severity of breakouts.',
        usedFor: 'Active acne, recurring breakouts and the marks they leave behind.',
        servicePages: ['acne'],
      },
      {
        name: 'Melasma and pigmentation treatment',
        what: 'A course of topical agents, in-clinic procedures such as pico laser or peels, and sun protection, tailored to the type of pigmentation.',
        usedFor: 'Dark patches, uneven tone, sun spots and post-inflammatory marks.',
        servicePages: ['pigmentation'],
      },
      {
        name: 'Pico laser',
        what: 'A laser that delivers energy in very short pulses (picoseconds) to target pigment or ink in the skin with less surrounding heat.',
        usedFor: 'Tattoo removal, carbon facial, melasma and hyperpigmentation.',
        servicePages: ['pigmentation', 'skin-rejuvenation'],
      },
      {
        name: 'MNRF (micro-needling with radiofrequency)',
        what: `Fine needles deliver radiofrequency energy into the deeper skin layers, stimulating the skin's own repair process.`,
        usedFor: 'Anti-ageing, skin tightening, acne scar treatment and uneven texture.',
        servicePages: ['acne', 'skin-rejuvenation'],
      },
    ],
    footer: assessFirst,
  },
  {
    group: 'Hair and scalp',
    items: [
      {
        name: 'Diode laser hair reduction',
        what: 'A medical-grade laser targets the pigment in hair follicles to reduce hair growth over a course of sessions.',
        usedFor: 'Unwanted facial or body hair. Maintenance sessions are usually needed, as reduction is gradual and not a one-time outcome.',
        caution: 'This is hair reduction, not a one-time solution. The number of sessions and the degree of reduction vary from person to person, and periodic maintenance is usually needed.',
        servicePages: ['skin-rejuvenation'],
      },
      {
        name: 'Laser hair regrowth therapy',
        what: 'A device directs low-level laser energy to the scalp to support micro-circulation and encourage the hair growth cycle.',
        usedFor: 'Hair fall control, thinning and scalp health.',
        servicePages: ['hair'],
      },
      {
        name: 'PRP (platelet-rich plasma)',
        what: 'A small blood sample is drawn, processed to concentrate the platelets, and injected into the scalp. Sessions are usually spaced a few weeks apart over a course.',
        usedFor: 'Hair thinning and scalp health, as part of a broader assessment and plan.',
        caution: 'Response varies from person to person. The doctor explains the expected course, including how many sessions are typical and when progress is reviewed.',
        servicePages: ['hair'],
      },
      {
        name: 'GFC (growth factor concentrate)',
        what: 'Similar to PRP, but the blood processing concentrates growth factors specifically. Injected into the scalp over a planned course.',
        usedFor: 'Hair thinning and as a complement to other scalp treatments.',
        caution: 'Response varies. The doctor discusses realistic expectations and the review schedule before starting.',
        servicePages: ['hair'],
      },
      {
        name: 'Exosome therapy',
        what: 'A newer approach where exosomes (tiny vesicles derived from cells) are applied to the scalp to support the hair growth environment.',
        usedFor: 'Hair thinning, as an option the doctor may discuss after assessment.',
        caution: 'Exosome therapy is newer, and the clinical evidence is still developing. The doctor will explain what is known, what is not yet established, and when a more proven option may suit you better.',
        servicePages: ['hair'],
      },
      {
        name: 'Alsavique hair restoration therapy',
        what: 'A hair restoration protocol from Italy (Alsavique) involving a planned course of scalp treatments using proprietary formulations.',
        usedFor: 'Hair thinning and hair fall, as part of a structured treatment course.',
        caution: 'The doctor explains the course, the number of sessions typically involved and when results are reviewed. Individual response varies.',
        servicePages: ['hair'],
      },
    ],
    footer: assessFirst,
  },
  {
    group: 'Homeopathy and counselling',
    items: [
      {
        name: 'Homeopathy (14 years of clinical experience)',
        what: 'A detailed consultation covering your concern, general health and history, followed by a course of follow-up visits rather than a single appointment.',
        usedFor: 'Long-standing and recurring concerns where a whole-person approach is preferred, alongside or after conventional treatment.',
        servicePages: ['homeopathy'],
      },
      {
        name: 'Mental health counselling',
        what: 'A confidential conversation about stress, low mood, anxiety, sleep or other concerns affecting daily life, with referral when a specialist is the right next step.',
        usedFor: 'Stress, anxiety, low mood and general mental wellbeing.',
        servicePages: ['wellness'],
      },
      {
        name: 'Child counselling',
        what: 'Supportive sessions for children and young people, after an initial conversation with a parent or guardian.',
        usedFor: 'Behavioural concerns, emotional difficulties and adjustment issues in children.',
        caution: 'Please call the clinic before booking so we can understand the concern and confirm whether the clinic is the right place, or refer you to a specialist who may suit better.',
        servicePages: ['wellness'],
      },
    ],
    footer: assessFirst,
  },
];

/** Flat list of all treatments */
export const allTreatments = treatmentCategories.flatMap((c) => c.items);

/** Treatments relevant to a given service page slug */
export const treatmentsForService = (slug: string) =>
  treatmentCategories
    .map((c) => ({
      ...c,
      items: c.items.filter((t) => t.servicePages.includes(slug)),
    }))
    .filter((c) => c.items.length > 0);
