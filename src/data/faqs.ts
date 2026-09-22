import { site, feeLine } from '../config/site';
import type { Faq } from './services';

export const homeFaqs: Faq[] = [
  { q: 'Do I need an appointment?', a: 'An appointment means you will not wait. Message us on WhatsApp or call, and we will offer you a couple of time slots.' },
  { q: 'Is the clinic open on Fridays?', a: `No. We are open ${site.hours.openLabel} from Saturday to Thursday, and closed on Fridays.` },
  { q: 'Where exactly is the clinic?', a: `On the first floor of Plot No. 69, Kali Mandir Road, Satya Nagar, Bhubaneswar ${site.address.postalCode}, above Sweekruti Creations.` },
  { q: 'How much does a consultation cost?', a: feeLine() },
  { q: 'Will I get a specific result?', a: 'No one can honestly promise that. Skin, hair and health respond differently from person to person. What we do promise is a proper assessment, a clear explanation and a plan you understand before you agree to anything.' },
  { q: 'Who will I see?', a: `Your consultation is with ${site.doctor.displayName}. If your concern needs another specialist, we will tell you and help with the referral.` },
];
