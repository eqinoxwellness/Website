import { site, feeLine } from '../config/site';
import type { Faq } from './services';

export const homeFaqs: Faq[] = [
  { q: 'Do I need an appointment?', a: 'Yes, booking an appointment in advance ensures you are seen promptly without waiting. Message us on WhatsApp or call, and we will offer you a couple of convenient time slots.' },
  { q: 'Is the clinic open on Fridays?', a: `No, the clinic is closed on Fridays. We are open ${site.hours.openLabel} from Saturday to Thursday.` },
  { q: 'Where exactly is the clinic?', a: `The clinic is located on the first floor of Plot No. 69, Kali Mandir Road, Satya Nagar, Bhubaneswar ${site.address.postalCode}, directly above Sweekruti Creations.` },
  { q: 'How much does a consultation cost?', a: `${feeLine()} If any in-clinic procedure or course of sessions is discussed after the assessment, the doctor explains the cost per session clearly before you decide.` },
  { q: 'Will I get a specific result?', a: 'No, no clinic can promise a specific outcome because skin, hair and health respond differently from person to person. What we do provide is a thorough clinical assessment, an honest explanation of what to expect, and a structured plan before you agree to anything.' },
  { q: 'Who will I see?', a: 'Your consultation is directly with our consulting doctor. If your concern needs another specialist, we will tell you honestly and help with the referral.' },
  { q: 'How do I reach the clinic from Saheed Nagar, Vani Vihar or Jaydev Vihar?', a: 'The clinic is centrally located in Satya Nagar, accessible within 5 to 15 minutes from Saheed Nagar, Vani Vihar, Rasulgarh, and Jaydev Vihar via Janpath or Cuttack-Puri Road. Roadside car parking and two-wheeler spaces are available outside Plot No. 69 on Kali Mandir Road.' },
  { q: 'Can I get a same-day appointment?', a: 'Yes, same-day consultation slots are often available if you contact us earlier in the day. Send a quick message on WhatsApp or call us to check current availability.' },
];
