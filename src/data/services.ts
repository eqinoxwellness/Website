/**
 * Every service page is generated from this file.
 * `verified: false` means Equinox has not yet confirmed in writing that it offers this service.
 * Preflight warns on each one; STRICT=1 blocks the build until all live services are verified.
 *
 * Copy rules: describe the clinic's process, never promise an outcome. No best, guaranteed,
 * permanent, cure, miracle, painless, 100%, fairness or whitening. Preflight enforces this.
 */
export type Faq = { q: string; a: string };
export type Category = 'Skin' | 'Hair' | 'Hormones and weight' | 'Whole-person care';

export type Service = {
  slug: string;
  category: Category;
  name: string;
  navName: string;
  indexLine: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  covers: string[];
  bring: string[];
  expectations: string;
  extra?: { heading: string; body: string[] };
  faqs: Faq[];
  waText: string;
  related: string[];
  verified: boolean;
};

const wa = (page: string, code: string, ask = 'book a consultation') =>
  `Hi, I found you through the ${page} page and would like to ${ask}. #${code}`;

export const services: Service[] = [
  {
    slug: 'acne',
    category: 'Skin',
    name: 'Acne consultation',
    navName: 'Acne',
    indexLine: 'Breakouts, the marks they leave behind, and acne that keeps coming back.',
    title: 'Acne consultation in Satya Nagar, Bhubaneswar | Equinox',
    description:
      'Doctor-led acne consultation in Satya Nagar, Bhubaneswar. We assess your skin, explain what we find and talk through options before anything starts.',
    h1: 'Acne consultation in Satya Nagar, Bhubaneswar',
    intro:
      'Acne has more than one cause, and the right approach depends on which ones apply to you. The consultation is where we find that out, before anything is suggested.',
    covers: [
      'A look at your skin in good light: the type of breakouts, where they appear, and any marks or scarring',
      'Your history: when it started, what makes it better or worse, and what you have already tried',
      'Your routine and products, including anything prescribed elsewhere',
      'A plain explanation of what we think is going on',
      'The options available at the clinic, what each involves, how many visits it usually takes and what it costs',
    ],
    bring: [
      'Photos of your skin on a bad day, if the breakouts come and go',
      'The creams, face washes or medicines you use now',
      'Earlier prescriptions or reports, if you have them',
    ],
    expectations:
      'Acne usually improves over weeks rather than days, and it can flare again with hormones, stress or the seasons. Outcomes vary from person to person. We will tell you what is realistic for your skin, including when a treatment is unlikely to help.',
    faqs: [
      { q: 'How long does acne treatment take to show a change?', a: 'Usually several weeks, not days. Skin renews itself roughly once a month, so most plans are reviewed after four to eight weeks. The doctor will give you a realistic timeline for your skin at the first visit.' },
      { q: 'Should I stop my current products before the visit?', a: 'No, keep using your current products and bring them along to the clinic. Stopping suddenly makes it harder to identify what your skin is reacting to.' },
      { q: 'Can you look at the marks acne leaves behind?', a: 'Yes, marks and scarring are assessed together in the same consultation. They are often handled in a phased sequence with active breakouts, and the doctor will explain why.' },
      { q: 'Is the first consultation a sales visit?', a: 'No, the first visit is strictly an assessment and clinical explanation. You can take the plan home and decide later; nothing is booked unless you ask for it.' },
      { q: 'Does MNRF help with acne scars?', a: 'Yes, MNRF (micro-needling with radiofrequency) is one of the modalities the doctor may recommend for pitted or rolling acne scars. Fine insulated needles deliver radiofrequency energy into the deeper skin layers to stimulate collagen repair, typically over 3 to 4 sessions spaced a month apart.' },
      { q: 'How do I reach the clinic from Saheed Nagar or Vani Vihar for an acne appointment?', a: 'The clinic is a 5 to 10-minute drive from Saheed Nagar or Vani Vihar via Janpath. We are on the first floor above Sweekruti Creations on Kali Mandir Road in Satya Nagar, with two-wheeler and roadside parking available outside.' },
    ],
    waText: wa('acne', 'EQ-AC'),
    related: ['pigmentation', 'skin-rejuvenation'],
    verified: false,
  },
  {
    slug: 'pigmentation',
    category: 'Skin',
    name: 'Pigmentation consultation',
    navName: 'Pigmentation',
    indexLine: 'Dark patches, uneven tone, sun spots and marks that linger.',
    title: 'Pigmentation consultation in Satya Nagar, Bhubaneswar | Equinox',
    description:
      'Doctor-led pigmentation consultation in Bhubaneswar. We work out what is causing the patches before suggesting anything, and explain every option clearly.',
    h1: 'Pigmentation consultation in Satya Nagar, Bhubaneswar',
    intro:
      'Pigmentation looks similar on the surface but has different causes underneath: sun, hormones, inflammation or old marks. Treating the wrong cause can make it worse, so the consultation starts by working out which one you have.',
    covers: [
      'Where the pigmentation is, how deep it appears and how long it has been there',
      'Triggers such as sun exposure, hormonal changes, medicines or earlier skin treatments',
      'Your skin type and how it has reacted to products or procedures before',
      'What we think is causing it, in plain language',
      'The options available at the clinic, what each involves and the likely number of visits',
    ],
    bring: [
      'The products you apply, including sunscreen',
      'Any medicines you take regularly',
      'Details of earlier treatments for the same concern',
    ],
    expectations:
      'Pigmentation tends to fade gradually and can return with sun or hormonal change, so daily sun protection is usually part of any plan. How much it changes differs from person to person. We will be clear about what is realistic before you start.',
    faqs: [
      { q: 'Why does my pigmentation come back?', a: 'Pigmentation recurs because underlying triggers such as sun exposure, heat, or hormonal fluctuations can re-stimulate melanocytes. Part of the consultation is identifying your specific triggers, so the plan covers preventive maintenance between visits as well as in-clinic care.' },
      { q: 'Is melasma the same as pigmentation?', a: 'Melasma is a specific chronic type of pigmentation characterized by symmetrical brownish patches, typically triggered by hormones and ultraviolet light. The doctor will determine whether your patches are melasma, sun spots, or post-inflammatory marks, as the clinical protocol differs.' },
      { q: 'Do I need sunscreen indoors?', a: 'Yes, daily broad-spectrum sun protection is recommended indoors if you sit near windows or work in front of bright screens. The doctor will suggest an appropriate formulation for your skin type.' },
      { q: 'Will treatment change my natural skin colour?', a: 'No, and our clinic does not provide skin lightening or bleaching. The objective is to address localized hyperpigmented patches and restore even skin tone, respecting your natural complexion.' },
      { q: 'Does pico laser work for dark pigmentation patches?', a: 'Yes, pico laser is one of the advanced modalities the doctor may consider for stubborn pigmentation and melasma. It delivers ultra-short picosecond pulses to fragment pigment particles into tiny dust-like fragments with minimal thermal damage to surrounding skin.' },
      { q: 'How do I travel to the clinic from Jaydev Vihar or Nayapalli?', a: 'It takes approximately 15 to 20 minutes from Jaydev Vihar or Nayapalli via Janpath. Turn onto Kali Mandir Road in Satya Nagar; the clinic is situated on the 1st floor above Sweekruti Creations.' },
    ],
    waText: wa('pigmentation', 'EQ-PG'),
    related: ['acne', 'skin-rejuvenation'],
    verified: false,
  },
  {
    slug: 'skin-rejuvenation',
    category: 'Skin',
    name: 'Skin rejuvenation consultation',
    navName: 'Skin rejuvenation',
    indexLine: 'Dullness, dehydration, uneven texture and skin that looks tired.',
    title: 'Skin rejuvenation in Satya Nagar, Bhubaneswar | Equinox',
    description:
      'Skin rejuvenation in Bhubaneswar that starts with a doctor’s assessment of hydration, texture and routine, and a clear view of whether you need a session at all.',
    h1: 'Skin rejuvenation in Satya Nagar, Bhubaneswar',
    intro:
      'Dull or tired-looking skin is usually a mix of dehydration, texture and a routine that no longer suits you. We look at all three before recommending anything, including whether you need a session at all.',
    covers: [
      'Your skin’s hydration, texture, tone and sensitivity',
      'Your current routine, and anything that may be working against you',
      'Sleep, sun and water intake, which show up in the skin',
      'Which in-clinic sessions suit your skin, what one session includes and how long it takes',
      'Session costs and how often people usually return',
    ],
    bring: [
      'Your current skincare products, or photos of their labels',
      'The date of any upcoming event, so we can plan the timing',
    ],
    expectations:
      'The effect of a single session is modest, and it lasts longer when your daily routine supports it. Results differ from person to person. If a change to your routine will do more for you than a session, we will say so.',
    faqs: [
      { q: 'How is a rejuvenation session different from a salon facial?', a: 'An in-clinic session is customized following a clinical examination by the doctor, using medical-grade technologies and active ingredients chosen for your skin sensitivity. The doctor explains each step and what it accomplishes before you proceed.' },
      { q: 'How often do people come for sessions?', a: 'Session intervals typically range from 4 to 6 weeks depending on whether you are receiving an Advanced HydraFacial, skin boosters, or vector therapy. The doctor suggests a frequency suited to your skin barrier.' },
      { q: 'Can I come before a wedding or event?', a: 'Yes, but booking 1 to 2 weeks prior to your event is strongly recommended. This gives your skin adequate time to settle and showcase peak hydration.' },
      { q: 'Is there any downtime?', a: 'Most hydration and facial sessions have zero downtime, while microneedling or deeper modalities may cause mild redness for 24 to 48 hours. The doctor clarifies post-care guidelines before every session.' },
      { q: 'What is the difference between Advanced HydraFacial and skin boosters?', a: 'An Advanced HydraFacial is a non-invasive device-based cleansing, exfoliation, and serum infusion, whereas skin boosters involve micro-injections of hyaluronic acid deeper into the dermis to restore long-term hydration from within.' },
      { q: 'How does diode laser hair reduction work, and does it require maintenance?', a: 'Diode laser directs concentrated light into hair follicles to achieve gradual reduction over 6 to 8 sessions spaced a few weeks apart. Maintenance visits once or twice a year are usually advised, as laser reduces hair growth rather than eliminating it in a single visit.' },
      { q: 'Can I reach the clinic easily from Kharavela Nagar or Master Canteen?', a: 'Yes, the clinic is just 3 to 5 minutes from Kharavela Nagar and Master Canteen Station. We are located on Kali Mandir Road in Satya Nagar, above Sweekruti Creations.' },
    ],
    waText: wa('skin rejuvenation', 'EQ-SR'),
    related: ['pigmentation', 'acne'],
    verified: false,
  },
  {
    slug: 'hair',
    category: 'Hair',
    name: 'Hair fall and scalp consultation',
    navName: 'Hair and scalp',
    indexLine: 'Hair fall, thinning, patches and scalp concerns, for women and men.',
    title: 'Hair fall and scalp consultation in Bhubaneswar | Equinox',
    description:
      'Doctor-led hair fall and scalp consultation in Satya Nagar, Bhubaneswar. We examine the scalp, review your history and explain the likely cause first.',
    h1: 'Hair fall and scalp consultation in Satya Nagar, Bhubaneswar',
    intro:
      'Hair fall has many possible causes, from stress, diet and hormones to genetics and scalp conditions. The consultation narrows down which ones apply to you, because the options differ for each.',
    covers: [
      'An examination of your scalp and the pattern of hair fall or thinning',
      'Your history: when it started, family history, recent illness, stress, diet and medicines',
      'Whether any tests would help, and which ones, before anything else is suggested',
      'A plain explanation of the likely cause',
      'The options available at the clinic, what each involves, how long a change usually takes to show and what it costs',
    ],
    bring: [
      'Recent blood test reports, if you have them',
      'A list of hair products, supplements and medicines',
      'Photos from a year or two ago, if the change has been gradual',
    ],
    expectations:
      'Hair grows slowly, so most approaches are judged over months, not weeks. How hair responds differs from person to person and depends on the cause. We will tell you what is realistic, including when your concern is better handled by another specialist.',
    faqs: [
      { q: 'How much hair fall is normal?', a: 'Losing 50 to 100 hairs daily is part of the natural hair shedding cycle. If you notice significantly more shedding, thinning along your parting line, or localized patches for several weeks, a consultation is advisable.' },
      { q: 'Do you see women for hair thinning?', a: 'Yes, women frequently consult us for diffuse hair thinning, widening partings, and hormonal or nutritional shedding. The examination evaluates hormonal, nutritional, and lifestyle factors alongside scalp health.' },
      { q: 'Will I need blood tests?', a: 'Blood investigations are recommended if your history indicates possible nutritional deficiencies, thyroid variance, or hormonal changes. The doctor discusses which specific markers are necessary before ordering them.' },
      { q: 'How long before I see a change?', a: 'Noticeable changes in hair shedding and density typically require 3 to 6 months because hair follicles cycle slowly. The doctor explains progress milestones and schedules periodic reviews.' },
      { q: 'What does PRP (platelet-rich plasma) involve, and how many sessions are typical?', a: 'PRP involves drawing a small blood sample, concentrating the natural platelets, and micro-injecting them into thinning scalp areas. A typical course involves 3 to 5 sessions spaced 3 to 4 weeks apart, followed by a review.' },
      { q: 'What is GFC and how does it compare to PRP?', a: 'GFC (growth factor concentrate) isolates growth factors directly from blood platelets in an acellular format, minimizing discomfort during administration. The doctor determines whether PRP, GFC, or Italian Alsavique hair therapy is more appropriate after examining your scalp.' },
      { q: 'How do I reach the clinic from Rasulgarh or NH16 for a hair consultation?', a: 'The clinic is an easy 10 to 12-minute drive from Rasulgarh Square down Cuttack-Puri Road into Satya Nagar. Turn onto Kali Mandir Road; the clinic is directly above Sweekruti Creations with convenient parking.' },
    ],
    waText: wa('hair and scalp', 'EQ-HR'),
    related: ['womens-wellness', 'homeopathy'],
    verified: false,
  },
  {
    slug: 'womens-wellness',
    category: 'Hormones and weight',
    name: 'Women’s wellness consultation',
    navName: 'Women’s wellness',
    indexLine: 'Irregular periods, hormonal concerns, and how they show up in skin, hair and weight.',
    title: 'Women’s wellness consultation in Bhubaneswar | Equinox',
    description:
      'Women’s wellness consultation in Satya Nagar, Bhubaneswar, looking at cycles, hormones, skin, hair and weight together, with referral when a specialist is needed.',
    h1: 'Women’s wellness consultation in Satya Nagar, Bhubaneswar',
    intro:
      'Irregular cycles, hormonal changes and their effect on skin, hair, energy and weight are often looked at separately. This consultation looks at them together, and tells you clearly when you need a gynaecologist or another specialist instead.',
    covers: [
      'A conversation about your cycle, your symptoms and how long they have been going on',
      'How the concern is showing up elsewhere: skin, hair, weight, sleep or energy',
      'Reports, scans or treatments you already have',
      'Which tests, if any, would be useful',
      'What the clinic can help with, and when we will refer you to a specialist',
    ],
    bring: [
      'The dates of your last few cycles, if you track them',
      'Any reports, scans or prescriptions',
      'A list of medicines and supplements',
    ],
    expectations:
      'Hormonal concerns usually need time and follow-up rather than a single visit, and every body responds differently. If your concern needs a gynaecologist, an endocrinologist or another specialist, we will say so at the first visit.',
    faqs: [
      { q: 'Is this a replacement for seeing a gynaecologist?', a: 'No, this consultation does not replace a gynaecologist. We evaluate how hormonal imbalances manifest across cycles, skin, hair, and metabolic health, and we assist with specialist referrals whenever gynaecological exams or prescriptions are indicated.' },
      { q: 'Can I talk about this privately?', a: 'Yes, all consultations are strictly confidential and conducted one-on-one with the doctor in a private room. You can also request a private callback before visiting.' },
      { q: 'Do I need reports before the first visit?', a: 'No previous reports are required to book your first appointment. Bring any past ultrasound scans, cycle logs, or blood investigations if you have them, and the doctor will advise if new tests are warranted.' },
      { q: 'How many visits does it usually take?', a: 'Hormonal and cycle-related concerns usually involve an initial consultation followed by reviews spaced 3 to 4 weeks apart over a few cycles. The doctor outlines a review schedule once the underlying factors are understood.' },
      { q: 'Can hormonal breakouts and hair thinning be addressed in the same visit?', a: 'Yes, addressing skin breakouts and hair thinning alongside menstrual irregularities is the specific purpose of this consultation. The doctor examines both concerns in the context of your overall hormonal health.' },
      { q: 'Is the clinic accessible from Saheed Nagar or Rasulgarh?', a: 'Yes, Satya Nagar directly adjoins Saheed Nagar and is a quick 5 to 10-minute commute from both Saheed Nagar and Rasulgarh via Janpath or Cuttack-Puri Road.' },
    ],
    waText: wa('women’s wellness', 'EQ-WW', 'know more about a consultation'),
    related: ['weight-management', 'hair'],
    verified: false,
  },
  {
    slug: 'weight-management',
    category: 'Hormones and weight',
    name: 'Weight management consultation',
    navName: 'Weight management',
    indexLine: 'A measured, supervised plan built around your routine.',
    title: 'Weight management consultation in Bhubaneswar | Equinox',
    description:
      'Supervised weight management in Satya Nagar, Bhubaneswar. An assessment of routine, sleep and medical factors, realistic targets and regular reviews.',
    h1: 'Weight management consultation in Satya Nagar, Bhubaneswar',
    intro:
      'Weight is shaped by food, sleep, stress, activity, hormones and medicines, and most people have already tried the simple advice. The assessment looks at what is specific to you before any plan is suggested.',
    covers: [
      'Measurements taken at the clinic, so progress is tracked from a real starting point',
      'Your eating pattern, routine, sleep and activity',
      'Medical history, medicines and any condition that affects weight',
      'What has and has not worked for you before',
      'How the programme runs: how often you check in, what is measured, how long it lasts and what it costs',
    ],
    bring: [
      'A rough note of what you ate over two or three typical days',
      'Recent blood reports, if any',
      'A list of medicines and supplements',
    ],
    expectations:
      'Lasting change is gradual, and the pace differs from person to person. We do not promise a number of kilos. We agree realistic targets with you and review them at every check-in.',
    faqs: [
      { q: 'Is this a diet plan?', a: 'No, it is a doctor-supervised lifestyle and metabolic programme rather than a restrictive diet sheet. We review your daily routine, sleep architecture, stress levels, and medical history alongside nutritional habits.' },
      { q: 'How often are the check-ins?', a: 'Check-in visits are usually scheduled every 1 to 2 weeks initially, and then transition to monthly reviews as healthy habits stabilize. The review schedule is agreed upon during your first visit.' },
      { q: 'I have tried many diets. Will this be different?', a: 'Yes, because the programme is tailored around your individual metabolic baseline, work routine, and medical history rather than a generic diet chart. We do not make unrealistic promises; we focus on gradual, sustainable habits with regular clinical monitoring.' },
      { q: 'Do you see men as well?', a: 'Yes, our weight management consultations are open to adults of all genders.' },
      { q: 'Where can I park when driving from Nayapalli or Jaydev Vihar?', a: 'Roadside car parking and dedicated two-wheeler spaces are available directly outside Plot No. 69 on Kali Mandir Road. It takes about 15 to 20 minutes to reach Satya Nagar from Nayapalli via Janpath.' },
    ],
    waText: wa('weight management', 'EQ-WM', 'book an assessment'),
    related: ['womens-wellness', 'wellness'],
    verified: false,
  },
  {
    slug: 'homeopathy',
    category: 'Whole-person care',
    name: 'Homeopathy consultation',
    navName: 'Homeopathy',
    indexLine: 'A detailed consultation for long-standing concerns, with planned follow-ups.',
    title: 'Homeopathy consultation in Satya Nagar, Bhubaneswar | Equinox',
    description:
      'Homeopathy consultation in Satya Nagar, Bhubaneswar: a detailed history, a clear follow-up schedule, and no request to stop medicines prescribed elsewhere.',
    h1: 'Homeopathy consultation in Satya Nagar, Bhubaneswar',
    intro:
      'A homeopathy consultation is a long conversation about your concern, your history and your general health. It is usually followed by a series of follow-up visits rather than a single appointment.',
    covers: [
      'A detailed history of the concern you have come with',
      'Your general health, sleep, appetite, stress and routine',
      'Other treatment you are taking, which you should not stop without your treating doctor’s advice',
      'How follow-ups work and how often they happen',
      'What the consultation and follow-ups cost',
    ],
    bring: [
      'Reports and prescriptions from any current treatment',
      'A list of medicines and supplements you take',
    ],
    expectations:
      'Homeopathy consultations are usually part of an ongoing process with regular follow-ups, and how people respond varies. We never ask anyone to stop medicines prescribed by another doctor. If your concern needs urgent or specialist care, we will tell you.',
    faqs: [
      { q: 'Can I take homeopathy alongside my current medicines?', a: 'Yes, in most cases homeopathy can be taken safely alongside conventional medicines. Tell the doctor about all medications you currently take, and never stop any prescribed treatment without speaking to your treating physician.' },
      { q: 'How long is the first homeopathy consultation?', a: 'The first consultation usually takes 30 to 45 minutes because the doctor conducts an in-depth clinical history. We will confirm the appointment duration when scheduling your slot.' },
      { q: 'How often are follow-ups?', a: 'Follow-ups are typically spaced 2 to 4 weeks apart depending on whether your concern is acute or chronic. The doctor discusses the review cadence at your initial visit.' },
      { q: 'Can I get remedies over WhatsApp?', a: 'No, remedies are prescribed strictly following a formal in-person consultation with the doctor.' },
      { q: 'Can chronic skin and scalp issues be managed with homeopathy?', a: 'Yes, constitutional homeopathy backed by 14 years of clinical experience is frequently sought for recurring skin flare-ups and chronic scalp issues alongside general care.' },
      { q: 'How do I reach the clinic from Vani Vihar or Kharavela Nagar?', a: 'The clinic is located in Satya Nagar, just 5 minutes from both Vani Vihar and Kharavela Nagar. Head toward Kali Mandir Road; we are on the first floor above Sweekruti Creations.' },
    ],
    waText: wa('homeopathy', 'EQ-HM'),
    related: ['hair', 'wellness'],
    verified: false,
  },
  {
    slug: 'wellness',
    category: 'Whole-person care',
    name: 'General and mental wellness consultation',
    navName: 'General and mental wellness',
    indexLine: 'Preventive check-ins, stress and wellbeing, with a plan you can keep.',
    title: 'General and mental wellness consultation in Bhubaneswar | Equinox',
    description:
      'General and mental wellness consultations in Satya Nagar, Bhubaneswar: a broad conversation, practical next steps, and referral when a specialist is right.',
    h1: 'General and mental wellness in Satya Nagar, Bhubaneswar',
    intro:
      'Some people come in with a specific concern. Others feel run down, stressed or out of balance and want to understand why. A wellness consultation starts with a broad conversation and ends with a small number of practical next steps.',
    covers: [
      'Your sleep, energy, stress, eating pattern and activity',
      'Existing conditions, medicines and recent reports',
      'Whether any checks or tests would be useful',
      'Practical, realistic changes, and whether follow-ups would help',
      'Referral to a specialist when that is the right next step',
    ],
    bring: ['Recent health reports, if you have them', 'A list of medicines and supplements'],
    expectations:
      'Wellbeing is built over time, and what works differs from person to person. A consultation gives you a clearer picture and a plan; it does not replace care from your regular doctor or a specialist.',
    extra: {
      heading: 'Stress and mental wellbeing',
      body: [
        'If stress, low mood, poor sleep or anxiety are affecting your daily life, you can talk about it at the consultation. We will listen, explain what support is available, and refer you to a psychiatrist or psychologist when that is the right step.',
        'This is not an emergency service. If you are in crisis or thinking about harming yourself, call 112 or the national Tele-MANAS helpline on 14416 now.',
      ],
    },
    faqs: [
      { q: 'What happens in a general wellness consultation?', a: 'A wellness consultation is a structured 30-minute review of your health baseline, daily routine, energy, sleep patterns, and stress triggers. You leave with practical, realistic lifestyle guidance and next steps.' },
      { q: 'Is what I say kept private?', a: 'Yes, everything discussed during a wellness consultation is strictly confidential between you and the doctor.' },
      { q: 'When would you refer me elsewhere?', a: 'We refer you to a specialist psychiatrist, clinical psychologist, or specialized physician whenever specialized medical care is the right next step. We explain our reasoning clearly and assist with the referral process.' },
      { q: 'Do I need a specific problem to book?', a: 'No, many individuals book a consultation simply for a preventive health review, stress evaluation, or guidance on improving daily energy.' },
      { q: 'Do parents need to call before booking child counselling?', a: 'Yes, we request that parents or guardians call the clinic prior to booking child counselling. This initial conversation allows us to understand the child’s concern and confirm whether our supportive setting is suitable or if a pediatric specialist referral is indicated.' },
      { q: 'How do I travel to the clinic from Jaydev Vihar or Saheed Nagar?', a: 'From Saheed Nagar it is a 5-minute drive via Janpath, and from Jaydev Vihar it takes roughly 15 minutes. We are on the 1st floor of Plot No. 69, Kali Mandir Road in Satya Nagar, directly above Sweekruti Creations.' },
    ],
    waText: wa('wellness', 'EQ-WL'),
    related: ['weight-management', 'homeopathy'],
    verified: false,
  },
];

export const categories: Category[] = ['Skin', 'Hair', 'Hormones and weight', 'Whole-person care'];

export const bySlug = (slug: string) => services.find((s) => s.slug === slug);

export const firstVisitSteps = [
  { title: 'Message or call', body: 'Tell us your name and what you would like to talk about. We reply during clinic hours, usually within minutes.' },
  { title: 'Three short questions', body: 'We ask what the concern is, how long it has been going on and what you have tried, so the doctor can prepare.' },
  { title: 'The consultation', body: 'The doctor examines, asks about your history and explains what is likely going on, in plain language.' },
  { title: 'You decide', body: 'You hear the options, what each involves and what it costs. You can start, think it over, or ask for a referral.' },
];
