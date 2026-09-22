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
      { q: 'How long does acne treatment take to show a change?', a: 'Usually several weeks, not days. Skin renews itself roughly once a month, so most plans are reviewed after four to eight weeks. The doctor will give you a timeline for your skin at the first visit.' },
      { q: 'Should I stop my current products before the visit?', a: 'No. Keep using them and bring them along. Stopping suddenly makes it harder to see what your skin is reacting to.' },
      { q: 'Can you look at the marks acne leaves behind?', a: 'Yes. Marks and scarring are assessed in the same consultation. They are often handled in a different order from active acne, and the doctor will explain why.' },
      { q: 'Is the first consultation a sales visit?', a: 'No. The first visit is an assessment and an explanation. You can take the plan home and decide later; nothing is booked unless you ask for it.' },
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
      { q: 'Why does my pigmentation come back?', a: 'Because the trigger is often still there. Sun, heat and hormones can darken the same areas again. Part of the consultation is identifying your triggers, so the plan covers what to do between visits as well as in the clinic.' },
      { q: 'Is melasma the same as pigmentation?', a: 'Melasma is one type of pigmentation, usually linked to hormones and sun, appearing as patches on the cheeks, forehead or upper lip. The doctor will tell you whether what you have is melasma or something else, because the approach differs.' },
      { q: 'Do I need sunscreen indoors?', a: 'Usually yes, if you sit near windows or use screens for long hours. The doctor will recommend what suits your skin type.' },
      { q: 'Will treatment change my natural skin colour?', a: 'No, and that is not what we do. The aim is to address uneven patches and marks, not to change your natural skin tone.' },
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
      { q: 'How is a rejuvenation session different from a salon facial?', a: 'A session here follows a doctor’s assessment, and what is used is chosen for your skin type and sensitivity. The doctor explains what each session involves before you book it.' },
      { q: 'How often do people come for sessions?', a: 'It depends on the session and your skin. The doctor will suggest a frequency after the assessment, and you can try one session before committing to more.' },
      { q: 'Can I come before a wedding or event?', a: 'Yes, but plan ahead. Tell us the date when you book, because some skin needs a few days to settle after a session.' },
      { q: 'Is there any downtime?', a: 'It depends on the session. Some have none; others can leave skin slightly red for a short while. The doctor will tell you before you start.' },
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
      { q: 'How much hair fall is normal?', a: 'Losing roughly 50 to 100 hairs a day is common. It is worth a consultation if you notice more than usual for several weeks, a widening parting, a receding hairline or patches.' },
      { q: 'Do you see women for hair thinning?', a: 'Yes. Thinning in women often has different causes from hair loss in men, including hormonal and nutritional ones, and the assessment reflects that.' },
      { q: 'Will I need blood tests?', a: 'Sometimes. If your history suggests a nutritional or hormonal cause, the doctor may recommend specific tests, and will tell you why before you do them.' },
      { q: 'How long before I see a change?', a: 'Usually a few months. Hair grows around a centimetre a month, so any change takes time to show. The doctor will explain what to watch for and when the plan will be reviewed.' },
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
      { q: 'Is this a replacement for seeing a gynaecologist?', a: 'No. We look at how hormonal concerns affect overall wellbeing, skin, hair and weight. If you need a gynaecological examination or specialist care, we will tell you and help you find it.' },
      { q: 'Can I talk about this privately?', a: 'Yes. Consultations are one to one with the doctor. If you would rather talk before booking, ask for a callback at a time that suits you.' },
      { q: 'Do I need reports before the first visit?', a: 'No. Bring whatever you have. The doctor will tell you if any tests would help.' },
      { q: 'How many visits does it usually take?', a: 'It varies. Most people have a first consultation and then follow-ups a few weeks apart. The doctor will suggest a schedule once the concern is clearer.' },
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
      { q: 'Is this a diet plan?', a: 'Food is part of it, but the programme also looks at routine, sleep, activity and medical factors. The plan is built around your day rather than a fixed chart.' },
      { q: 'How often are the check-ins?', a: 'Usually every one to two weeks at the start, then less often. The doctor agrees a schedule with you.' },
      { q: 'I have tried many diets. Will this be different?', a: 'It is based on an assessment of what is specific to you rather than a general plan. We cannot promise a result; we can promise a plan you understand and regular reviews.' },
      { q: 'Do you see men as well?', a: 'Yes. The programme is for adults of any gender.' },
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
      { q: 'Can I take homeopathy alongside my current medicines?', a: 'Tell the doctor about everything you take. Do not stop any medicine prescribed elsewhere without speaking to the doctor who prescribed it.' },
      { q: 'How long is the first homeopathy consultation?', a: 'Longer than a routine visit, because the history is detailed. We will tell you the expected time when you book.' },
      { q: 'How often are follow-ups?', a: 'It depends on the concern. The doctor suggests a schedule at the first visit and reviews it as you go.' },
      { q: 'Can I get remedies over WhatsApp?', a: 'No. Remedies are prescribed only after a consultation with the doctor.' },
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
      { q: 'What happens in a general wellness consultation?', a: 'A conversation about your health, routine and concerns, a review of any reports, and a short list of practical next steps. You leave knowing what to do next, even if that is nothing new.' },
      { q: 'Is what I say kept private?', a: 'Yes. What you discuss in the consultation stays between you and the clinic.' },
      { q: 'When would you refer me elsewhere?', a: 'Whenever a specialist is better placed to help, for example a psychiatrist, a psychologist or a specialist physician. We will tell you why and help with the next step.' },
      { q: 'Do I need a specific problem to book?', a: 'No. Many people come because they want to understand their health better. Tell us that when you book.' },
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
