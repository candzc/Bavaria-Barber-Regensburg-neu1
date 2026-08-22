// Zentrale Stammdaten (NAP etc.) — überall im Code nur von hier referenzieren,
// nie an anderer Stelle neu eintippen, damit NAP zeichengenau konsistent bleibt.
export const business = {
  name: 'Bavaria Barber Regensburg',
  legalName: 'Bavaria Barber Regensburg e.K.',
  owner: 'Bakhtiyar Makos',
  street: 'Furtmayrstraße 2',
  postalCode: '93053',
  city: 'Regensburg',
  district: 'Galgenberg',
  phone: '0941 74769',
  phoneHref: 'tel:+4994174769',
  email: 'bakhtiyarmakos@gmail.com',
  founded: '2006',
  latitude: 49.0097136,
  longitude: 12.102275,
  siteUrl: 'https://www.bavaria-barber-regensburg.de',
  googleMapsUrl: 'https://maps.app.goo.gl/jY51MW2QvUf12SeS7',
  ratingValue: '4.8',
  reviewCount: '336',
} as const;

export const fullAddress = `${business.street}, ${business.postalCode} ${business.city}-${business.district}`;

// Öffnungszeiten laut Google-Unternehmensprofil (vom Kunden bestätigt).
export const openingHours = [
  { day: 'Montag', hours: null },
  { day: 'Dienstag', hours: '09:00–19:00' },
  { day: 'Mittwoch', hours: '09:00–19:00' },
  { day: 'Donnerstag', hours: '09:00–19:00' },
  { day: 'Freitag', hours: '09:00–19:00' },
  { day: 'Samstag', hours: '09:00–18:00' },
  { day: 'Sonntag', hours: null },
] as const;

// Für schema.org openingHoursSpecification (ISO-Wochentage, 24h-Format)
export const openingHoursSchema = [
  { dayOfWeek: 'Tuesday', opens: '09:00', closes: '19:00' },
  { dayOfWeek: 'Wednesday', opens: '09:00', closes: '19:00' },
  { dayOfWeek: 'Thursday', opens: '09:00', closes: '19:00' },
  { dayOfWeek: 'Friday', opens: '09:00', closes: '19:00' },
  { dayOfWeek: 'Saturday', opens: '09:00', closes: '18:00' },
] as const;

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: 'Start', href: '/' },
  { label: 'Leistungen', href: '/leistungen' },
  { label: 'Über uns', href: '/ueber-uns' },
  { label: 'Kontakt', href: '/kontakt' },
];

export const legalNav: NavItem[] = [
  { label: 'Impressum', href: '/impressum' },
  { label: 'Datenschutzerklärung', href: '/datenschutz' },
  { label: 'Cookie-Einstellungen', href: '/cookie-einstellungen' },
];

// Echte, verifizierte Google-Rezensionen (nur positive Auswahl, Text leicht gekürzt
// wo nötig, Aussage nicht verändert). Quelle: Google-Unternehmensprofil.
export const testimonials = [
  {
    author: 'Hoferl',
    text: 'Ich bin mit meinem Sohn schon seit vielen Jahren Kunde bei Bavaria Barber – wir sind jedes Mal rundum zufrieden. Das Team nimmt sich Zeit für jeden Kunden, die Haarschnitte sind sauber und präzise.',
  },
  {
    author: 'David Butler',
    text: 'Ein großartiges Friseurerlebnis! Frischer, gepflegter Look und erstklassige Friseure – keine Terminvereinbarung nötig, die Qualität ist unübertroffen in der Gegend.',
  },
  {
    author: 'Christian Moosburger',
    text: 'Super Friseur – schnell, guter Schnitt und top Preis.',
  },
  {
    author: 'Markumatics',
    text: 'Super nette und kompetente Mitarbeiter, es wird sich Mühe beim Haarschnitt gegeben. Laden schön eingerichtet, Preis-Leistung unschlagbar.',
  },
] as const;

export const partnerSalon = {
  name: 'Makosan Haarstudio',
  url: 'https://www.makosan-haarstudio.de',
  address: 'Maximilianstraße 3, 93047 Regensburg',
} as const;

export const usps = [
  { title: 'Über 20 Jahre Erfahrung', text: 'Vom klassischen Schnitt bis zu modernen Fade-Techniken' },
  { title: 'Spontan statt Terminzwang', text: 'Sie kommen vorbei, wann es Ihnen passt' },
  { title: 'Kurze Wartezeiten', text: 'Bedienung der Reihe nach' },
  { title: 'Parkplätze direkt vor dem Salon', text: 'Keine Parkplatzsuche in der Innenstadt' },
  { title: 'Vierköpfiges Friseurteam', text: 'Von klassischem Schnitt bis Fade sicher' },
] as const;
