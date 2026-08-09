/**
 * Single source of truth for every piece of site content.
 * Editing copy here must never require touching layout code.
 */

export const site = {
  name: 'Coastline Catalyst',
  legalName: 'Coastline Catalyst LLP',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://coastlinecatalyst.com',
  email: 'hello@coastlinecatalyst.com',
  linkedinUrl: 'https://www.linkedin.com/company/coastline-catalyst/',
  /** Compact form, for places with room for one line. */
  location: 'Kochi, Kerala, India',
  /** Display address. Tidied from the registry form, which repeats Ernakulam
   *  three times; the full registered string is kept below for legal copy. */
  addressLines: [
    'Coastline Catalyst LLP',
    '69/1854-A1, GFX44, SRM Road',
    'Kaloor, Kochi',
    'Ernakulam, Kerala 682018',
    'India',
  ],
  /** Exactly as registered. Used where the legal address must be verbatim. */
  registeredAddress:
    'Coastline Catalyst LLP, 69/1854 - A1, GFX44, SRM Road, Kaloor, Kochi, Ernakulam North, North police station, Kochi, Ernakulam, Ernakulam, Ernakulam - 682018, Kerala, India',
  tagline: 'Early-stage investment. India and the GCC.',
  description:
    'Coastline Catalyst is an early-stage investment firm partnering with ambitious founders across India, with a long-term vision of connecting innovation between India and the GCC.',
  copyright: '© 2026 Coastline Catalyst. All rights reserved.',
  disclaimer:
    'Coastline Catalyst does not provide investment advice. Nothing on this site is an offer to sell or a solicitation to buy securities.',
} as const;

export type NavLink = { label: string; href: string; key: string };

/** Header navigation. The pill CTA is rendered separately. */
export const navLinks: NavLink[] = [
  { label: 'Home', href: '/', key: 'home' },
  { label: 'About', href: '/about', key: 'about' },
  { label: 'Portfolio', href: '/portfolio', key: 'portfolio' },
  { label: 'Contact', href: '/contact', key: 'contact' },
];

export const footerNavLinks: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Submit pitch', href: '/submit-pitch' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy policy', href: '/privacy' },
];

export type Focus = { label: string; value: string };

export const focus: Focus[] = [
  { label: 'Stage', value: 'Early stage' },
  { label: 'Geography', value: 'India' },
  { label: 'Corridor', value: 'GCC (emerging)' },
  { label: 'Sector', value: 'Sector agnostic' },
];

export type Company = {
  name: string;
  founders: string;
  desc: string;
  industry: string;
  stage: string;
  status: string;
  url: string;
  linkedin?: string;
  /** Path under /public. Falls back to initials in a bordered tile when absent. */
  logo?: string;
};

export const companies: Company[] = [
  {
    name: 'Oppam',
    founders: 'Ebrahim Hawaz, Abdulla Kunhi',
    desc: 'Affordable, professional, and confidential online therapy and counseling, with licensed professionals available 24/7 for mental health, anxiety, and relationships.',
    industry: 'Mental health',
    stage: 'Early stage',
    status: 'Active',
    url: 'https://oppam.me/',
    linkedin: 'https://www.linkedin.com/company/oppam/',
    logo: '/portfolio/oppam.svg',
  },
  {
    name: 'Eight Times Eight',
    founders: 'Abhijith M, Athul Krishna S, Arijith M, Adesh Joshi',
    desc: 'An online chess academy for children and students at beginner, intermediate, and advanced levels.',
    industry: 'Education',
    stage: 'Early stage',
    status: 'Active',
    url: 'https://www.eighttimeseight.com/',
    linkedin: 'https://www.linkedin.com/company/eight-times-eight/',
    logo: '/portfolio/eight-times-eight.png',
  },
  {
    name: 'Preventify',
    founders: 'Nirmal NR, Rakesh K R',
    desc: 'A patient centered medical home built on evidence-based medicine, helping communities thrive in health.',
    industry: 'Healthcare',
    stage: 'Early stage',
    status: 'Active',
    url: 'https://preventify.me/',
    linkedin: 'https://www.linkedin.com/company/preventify-me/',
    logo: '/portfolio/preventify.png',
  },
];

export type Partner = {
  name: string;
  role: string;
  /** Drop the real headshot at this path in /public and the slot renders it. */
  photo: string | null;
  bio: string;
  linkedin: string;
};

export const partners: Partner[] = [
  {
    name: 'Nadeem Najeeb',
    role: 'Co-Founder & Partner',
    // Drop a square photo in /public/partners/ and set the path here.
    photo: null,
    bio: 'Nadeem Najeeb is a corporate finance and growth professional with experience across investment, strategy and finance in the GCC and India. With a background spanning finance, startups and emerging businesses, he brings a strong focus on financial discipline and commercial strategy.',
    linkedin: 'https://www.linkedin.com/in/nadeem-najeeb-38aa89126/',
  },
  {
    name: 'Sabil Abdullakutty',
    role: 'Co-Founder & Partner',
    photo: null,
    bio: 'Sabil Abdullakutty is a startup investor and growth operator with experience supporting early-stage companies from traction to scale. He focuses on helping founders accelerate growth across sales, marketing, and finance, while leveraging strong networks across India and the Middle East to open new markets and opportunities.',
    linkedin: 'https://www.linkedin.com/in/sabil-abdullakutty-8a4708120/',
  },
];

export type Belief = { title: string; body: string; icon: 'users' | 'clock' | 'arrows' };

export const believe: Belief[] = [
  { title: 'Founder first', body: 'Relationships before transactions.', icon: 'users' },
  {
    title: 'Long-term thinking',
    body: 'We build for decades, not funding rounds.',
    icon: 'clock',
  },
  {
    title: 'India ↔ GCC',
    body: 'Helping companies unlock growth across two markets.',
    icon: 'arrows',
  },
];

export type Item = { title: string; body: string };

export const lookFor: Item[] = [
  {
    title: 'Ambitious founders',
    body: 'We back people with conviction, resilience, and the ability to execute.',
  },
  { title: 'Real problems', body: 'Products or services solving meaningful customer needs.' },
  {
    title: 'Commercial potential',
    body: 'Businesses with a clear path to scalable revenue.',
  },
  {
    title: 'Long-term partnerships',
    body: 'We invest in founders we want to work alongside for years.',
  },
];

export const whyPartner: Item[] = [
  { title: 'Strategic guidance', body: 'Hands-on support on the decisions that compound.' },
  {
    title: 'Commercial introductions',
    body: 'Access to customers, operators, and partners across our network.',
  },
  {
    title: 'GCC market insights',
    body: 'Practical understanding of how to enter and grow in the Gulf.',
  },
  {
    title: 'Financial and growth support',
    body: 'Help with structuring, planning, and the next raise.',
  },
  { title: 'Long-term partnership', body: 'We stay involved long after the cheque clears.' },
];

export const whoWeAre =
  'We back exceptional founders early and work alongside them well beyond capital. We invest early, stay involved, and help businesses unlock opportunities through strategic guidance, commercial networks, and connections between India and the GCC.';

/**
 * The two ideas the firm is built on, in the founders' own words.
 *
 * Three copy corrections were made to the supplied text, all noted here so
 * they can be reversed if they were not typos:
 *   - "building a gre." completed to "building a great company"
 *   - "om traction to scale" corrected to "from traction to scale"
 *   - two em dashes replaced with commas, since the house style bans them
 */
export const foundingIdeas: { title: string; paragraphs: string[] }[] = [
  {
    title: 'We are Coastline Catalyst',
    paragraphs: [
      'In science, a catalyst accelerates a reaction without being consumed by it. That is the role we aim to play for the founders we back.',
      'The early stages of a company are defined by speed, experimentation and execution. We go beyond providing capital by working alongside founders across sales, marketing and finance, helping them make better decisions, move faster and build with greater confidence.',
      'With our strong presence across the Middle East, we also help ambitious Indian startups explore and unlock opportunities in the GCC, connecting founders to the right networks, customers, partners and markets.',
    ],
  },
  {
    title: 'Capital is a resource',
    paragraphs: [
      'Capital is important, but it is only one part of building a great company. Our role is to provide the funding and support founders need to focus on what matters most: building, scaling and creating lasting value.',
      'We back early-stage businesses that have demonstrated initial traction or revenue and are ready to take their next significant step. Our capital is not the destination, it is the fuel that gives founders the capacity to execute their vision faster and reach the next stage of growth.',
    ],
  },
];

export type Principle = { num: string; title: string; body: string };

export const principles: Principle[] = [
  {
    num: '01',
    title: 'Conviction over consensus',
    body: 'We form our own view of a founder and a market, and we are comfortable being early. The best opportunities rarely arrive with agreement around them.',
  },
  {
    num: '02',
    title: 'A small number of companies',
    body: 'We would rather do a few things properly than many things thinly. Each investment gets real time and attention from both partners.',
  },
  {
    num: '03',
    title: 'Deep involvement',
    body: 'We work alongside founders on the decisions that compound: hiring, pricing, market entry, the next raise. Never from the sidelines.',
  },
  {
    num: '04',
    title: 'Patient capital',
    body: 'We underwrite in decades, not funding rounds. We stay involved long after the cheque clears, through the slow middle years where businesses are actually built.',
  },
];

export const ctaBand = {
  heading: 'Ready to build?',
  body: "If you're building something ambitious, we'd like to hear about it early.",
  primary: { label: 'Submit pitch deck', href: '/submit-pitch' },
  secondary: { label: 'Book a conversation', href: '/contact' },
} as const;

/** Submit-pitch select options. */
export const stageOptions = ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Later'];
export const revenueOptions = [
  'Pre-revenue',
  'Under $100k ARR',
  '$100k to $500k ARR',
  '$500k to $2M ARR',
  'Over $2M ARR',
];

export type PrivacySection = { id: string; tocLabel: string; heading: string; body: string };

export const privacyLastUpdated = '[1 August 2026]';
export const privacyPostalAddress = site.registeredAddress;

export const privacySections: PrivacySection[] = [
  {
    id: 'collect',
    tocLabel: 'Information we collect',
    heading: 'Information we collect',
    body: 'We collect the information you give us directly: your name, email address, phone number, and company details when you contact us or submit a founder application, along with anything you include in a message or pitch deck. We also collect limited technical information (browser type, device, and pages visited) through the analytics described below.',
  },
  {
    id: 'use',
    tocLabel: 'How we use it',
    heading: 'How we use it',
    body: "We use your information to review applications, respond to enquiries, and manage our relationship with you. We do not sell your information, and we do not use it for advertising. We may contact you about your submission or, with your consent, about the firm's activities.",
  },
  {
    id: 'decks',
    tocLabel: 'Pitch decks and confidentiality',
    heading: 'Pitch deck submissions and confidentiality',
    body: "Pitch decks and application materials are shared only with the firm's partners and reviewed for investment consideration. Like most investment firms, we review many opportunities in overlapping areas and cannot accept obligations of confidentiality for unsolicited materials. Please do not include trade secrets in an initial submission. We delete materials for opportunities we decline within a reasonable period, as described under data retention.",
  },
  {
    id: 'cookies',
    tocLabel: 'Cookies and analytics',
    heading: 'Cookies and analytics',
    body: 'We use a small number of cookies to understand how the site is used: page views, referral sources, and approximate location at a city level. You can decline analytics cookies through the banner on your first visit, and clear or block cookies at any time in your browser settings. The site works fully without them.',
  },
  {
    id: 'thirdparty',
    tocLabel: 'Third-party services',
    heading: 'Third-party services',
    body: 'We rely on a small set of service providers to run this site: website hosting, form handling and file storage for applications, an analytics provider, and spam protection (reCAPTCHA) on our forms. Each processes data on our instructions and under its own privacy terms. We list current providers on request.',
  },
  {
    id: 'retention',
    tocLabel: 'Data retention',
    heading: 'Data retention',
    body: 'We keep contact enquiries for up to 24 months. Founder applications we decline are deleted within 12 months of the decision, unless you ask us to keep your details for future opportunities. Materials for companies we invest in are retained for the life of the relationship and as required by law.',
  },
  {
    id: 'rights',
    tocLabel: 'Your rights',
    heading: 'Your rights',
    body: 'You can ask us for a copy of the information we hold about you, ask us to correct it, or ask us to delete it. Write to us at the address below and we will respond within 30 days. If you are in a jurisdiction with a data protection authority, you also have the right to lodge a complaint with it.',
  },
  {
    id: 'contact',
    tocLabel: 'Contact us',
    heading: 'Contact us',
    // Rendered with the email as a link; see the privacy page.
    body: 'Questions about this policy or your data:',
  },
];

/** Two-letter tile initials, e.g. "Eight Times Eight" -> "ET". */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
