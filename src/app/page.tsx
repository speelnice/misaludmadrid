import { createClient } from '@/lib/supabase/server';
import type { PageData, Specialist, Centro, DomicilioZone, Review, Faq, SiteSettings } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import EspecialistasSection from '@/components/EspecialistasSection';
import ResenasSection from '@/components/ResenasSection';
import CentrosSection from '@/components/CentrosSection';
import DomicilioSection from '@/components/DomicilioSection';
import WellhubBanner from '@/components/WellhubBanner';
import FaqSection from '@/components/FaqSection';
import ContactoSection from '@/components/ContactoSection';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';


// ============================================================
// FALLBACK DATA — used when Supabase is not configured
// ============================================================

const FALLBACK_SPECIALISTS: Specialist[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Iván Leptach',
    title: 'Osteópata',
    bio: 'Especialista en osteopatía estructural y funcional con más de 10 años de experiencia. Iván combina técnicas clásicas de osteopatía con terapias complementarias naturales para ofrecer un tratamiento integral y personalizado. Su enfoque holístico busca no solo aliviar el dolor sino abordar la causa raíz de cada problema musculoesquelético.',
    photo_url: null,
    instagram_url: null,
    wellhub_url: 'https://wellhub.com/es-es/search/partners/ivan-leptach-masaje-osteopatia-salamanca/',
    google_reviews_url: null,
    display_order: 1,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    services: [
      { id: 's1', specialist_id: '11111111-1111-1111-1111-111111111111', name: 'Osteopatía de columna y articulaciones', description: null, duration_minutes: null, price_eur: null, display_order: 1, active: true, created_at: new Date().toISOString() },
      { id: 's2', specialist_id: '11111111-1111-1111-1111-111111111111', name: 'Liberación de cuello y cintura escapular', description: null, duration_minutes: null, price_eur: null, display_order: 2, active: true, created_at: new Date().toISOString() },
      { id: 's3', specialist_id: '11111111-1111-1111-1111-111111111111', name: 'Alineación de cadera', description: null, duration_minutes: null, price_eur: null, display_order: 3, active: true, created_at: new Date().toISOString() },
      { id: 's4', specialist_id: '11111111-1111-1111-1111-111111111111', name: 'Desbloqueos vertebrales', description: null, duration_minutes: null, price_eur: null, display_order: 4, active: true, created_at: new Date().toISOString() },
      { id: 's5', specialist_id: '11111111-1111-1111-1111-111111111111', name: 'Asesoramiento postural y de movimiento', description: null, duration_minutes: null, price_eur: null, display_order: 5, active: true, created_at: new Date().toISOString() },
      { id: 's6', specialist_id: '11111111-1111-1111-1111-111111111111', name: 'Terapias complementarias naturales', description: null, duration_minutes: null, price_eur: null, display_order: 6, active: true, created_at: new Date().toISOString() },
      { id: 's7', specialist_id: '11111111-1111-1111-1111-111111111111', name: 'Ventosas', description: null, duration_minutes: null, price_eur: null, display_order: 7, active: true, created_at: new Date().toISOString() },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Matteo',
    title: 'Masajista',
    bio: 'Masajista profesional especializado en técnicas terapéuticas y de bienestar. Matteo integra diferentes disciplinas del masaje para ofrecer una experiencia única, adaptada a las necesidades de cada persona. Su formación incluye técnicas orientales y occidentales que combinan a la perfección.',
    photo_url: null,
    instagram_url: null,
    wellhub_url: null,
    google_reviews_url: 'https://www.google.com/maps/place//data=!4m3!3m2!1s0xd418beaef00d16b:0x7949382245d8d14d!12e1',
    display_order: 2,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    services: [
      { id: 'm1', specialist_id: '22222222-2222-2222-2222-222222222222', name: 'Masaje relajante', description: null, duration_minutes: null, price_eur: null, display_order: 1, active: true, created_at: new Date().toISOString() },
      { id: 'm2', specialist_id: '22222222-2222-2222-2222-222222222222', name: 'Masaje descontracturante y deportivo', description: null, duration_minutes: null, price_eur: null, display_order: 2, active: true, created_at: new Date().toISOString() },
      { id: 'm3', specialist_id: '22222222-2222-2222-2222-222222222222', name: 'Drenaje linfático y reflexología podal', description: null, duration_minutes: null, price_eur: null, display_order: 3, active: true, created_at: new Date().toISOString() },
      { id: 'm4', specialist_id: '22222222-2222-2222-2222-222222222222', name: 'Masaje facial Kobido', description: null, duration_minutes: null, price_eur: null, display_order: 4, active: true, created_at: new Date().toISOString() },
      { id: 'm5', specialist_id: '22222222-2222-2222-2222-222222222222', name: 'Vendaje neuromuscular, ventosas y Cross Tape', description: null, duration_minutes: null, price_eur: null, display_order: 5, active: true, created_at: new Date().toISOString() },
    ],
  },
];

const FALLBACK_CENTROS: Centro[] = [
  { id: 'c1', name: 'ARomaMatSens', address: 'Plaza Inmaculada 30', district: 'Leganés', city: 'Madrid', maps_url: 'https://share.google/O24gJkBBIMOQuacHw', phone: null, description: null, photo_url: null, display_order: 1, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c2', name: 'Box Morales Salamanca', address: 'Hermosilla 56', district: 'Salamanca', city: 'Madrid', maps_url: 'https://share.google/1V3gCc6sdecmDKAHe', phone: null, description: null, photo_url: null, display_order: 2, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c3', name: 'Box Morales Alcalá', address: 'Alcalá 507', district: 'Alcalá de Henares', city: 'Madrid', maps_url: 'https://share.google/8EXggdz1zzLa1IcAd', phone: null, description: null, photo_url: null, display_order: 3, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c4', name: 'Fight Club Madrid', address: 'Mejorana 23, Vallecas', district: 'Vallecas', city: 'Madrid', maps_url: 'https://share.google/PO7C9ZgJiliKqoPOZ', phone: null, description: null, photo_url: null, display_order: 4, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c5', name: "Belu's Estético", address: 'Guadalupe N2', district: 'Leganés', city: 'Madrid', maps_url: 'https://share.google/5QTgP27vWXmWYZgYk', phone: null, description: null, photo_url: null, display_order: 5, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const FALLBACK_ZONES: DomicilioZone[] = [
  { id: 'z1', region: 'Norte', districts: ['Chamartín', 'Tetuán', 'Fuencarral', 'Hortaleza', 'La Moraleja', 'Alcobendas', 'San Sebastián de los Reyes'], display_order: 1 },
  { id: 'z2', region: 'Centro', districts: ['Salamanca', 'Chamberí', 'Retiro', 'Centro', 'Argüelles', 'Moncloa'], display_order: 2 },
  { id: 'z3', region: 'Sur', districts: ['Leganés', 'Vallecas', 'Usera', 'Villaverde', 'Getafe', 'Fuenlabrada', 'Alcorcón'], display_order: 3 },
  { id: 'z4', region: 'Este / Oeste', districts: ['Hortaleza', 'Vicálvaro', 'Moratalaz', 'Carabanchel', 'Pozuelo', 'Majadahonda', 'Las Rozas'], display_order: 4 },
];

const FALLBACK_REVIEWS: Review[] = [
  { id: 'r1', specialist_id: '11111111-1111-1111-1111-111111111111', author_name: 'María García', author_location: 'Salamanca, Madrid', rating: 5, content: 'Iván es increíble. Llevo meses con dolor de espalda y tras tres sesiones me siento como nueva. Su forma de trabajar es muy profesional y detallada. Totalmente recomendable.', source: 'google', verified: true, display_order: 1, active: true, created_at: new Date().toISOString() },
  { id: 'r2', specialist_id: '11111111-1111-1111-1111-111111111111', author_name: 'Carlos Fernández', author_location: 'Chamberí, Madrid', rating: 5, content: 'Acudí a Iván con una contractura cervical muy fuerte y en dos sesiones ya estaba perfecto. Conoce muy bien el cuerpo humano y sabe exactamente dónde tocar. Excelente profesional.', source: 'google', verified: true, display_order: 2, active: true, created_at: new Date().toISOString() },
  { id: 'r3', specialist_id: '22222222-2222-2222-2222-222222222222', author_name: 'Laura Martínez', author_location: 'Leganés, Madrid', rating: 5, content: 'El masaje con Matteo fue simplemente espectacular. El Kobido facial me dejó con una piel increíble y una sensación de bienestar total. Volveré sin duda.', source: 'google', verified: true, display_order: 3, active: true, created_at: new Date().toISOString() },
  { id: 'r4', specialist_id: '22222222-2222-2222-2222-222222222222', author_name: 'Sergio López', author_location: 'Vallecas, Madrid', rating: 5, content: 'Matteo tiene manos mágicas. El masaje deportivo después de mis entrenos me ha cambiado la vida. Muy recomendable para deportistas que necesitan recuperación muscular.', source: 'google', verified: true, display_order: 4, active: true, created_at: new Date().toISOString() },
  { id: 'r5', specialist_id: null, author_name: 'Ana Rodríguez', author_location: 'Pozuelo, Madrid', rating: 5, content: 'Servicio a domicilio impecable. Puntualidad absoluta y una calidad de tratamiento que no esperaba. El equipo de MiSalud es de los mejores que he probado en Madrid.', source: 'google', verified: true, display_order: 5, active: true, created_at: new Date().toISOString() },
  { id: 'r6', specialist_id: null, author_name: 'Javier Ruiz', author_location: 'Alcobendas, Madrid', rating: 5, content: 'Muy agradecido con todo el equipo. Tuve una lesión de hombro y gracias al tratamiento he recuperado la movilidad completamente. Profesionalidad y cercanía a partes iguales.', source: 'google', verified: true, display_order: 6, active: true, created_at: new Date().toISOString() },
];

const FALLBACK_FAQS: Faq[] = [
  { id: 'f1', question: '¿Ofrecéis servicio a domicilio?', answer: 'Sí, realizamos sesiones en tu propio domicilio en las principales zonas de Madrid y municipios cercanos: Norte, Centro, Sur, Este y Oeste. Cubrimos desde Alcobendas y San Sebastián de los Reyes hasta Leganés, Getafe o Las Rozas. Consulta las zonas disponibles más abajo.', category: 'servicio', display_order: 1, active: true },
  { id: 'f2', question: '¿Cómo reservo una cita?', answer: 'Puedes reservar directamente a través de Wellhub para sesiones con Iván, o mediante Google Maps para sesiones con Matteo. También puedes contactarnos por WhatsApp o email y te ayudamos a encontrar el horario y centro que mejor se adapte a ti.', category: 'reservas', display_order: 2, active: true },
  { id: 'f3', question: '¿Cuántas sesiones necesito?', answer: 'Depende de tu situación y objetivos. Para dolores agudos, suelen ser suficientes 2-3 sesiones. Para procesos crónicos o de mantenimiento recomendamos sesiones periódicas. En la primera visita evaluamos tu caso y te hacemos una propuesta personalizada.', category: 'tratamiento', display_order: 3, active: true },
  { id: 'f4', question: '¿Qué diferencia hay entre osteopatía y masaje?', answer: 'La osteopatía es una terapia manual que trabaja sobre el sistema musculoesquelético buscando restaurar la movilidad y función del cuerpo. El masaje actúa principalmente sobre los tejidos blandos (músculos, fascia) para aliviar tensión y mejorar la circulación. En muchos casos son complementarios.', category: 'tratamiento', display_order: 4, active: true },
  { id: 'f5', question: '¿Aceptáis Wellhub / Gympass?', answer: 'Sí, Iván Leptach está dado de alta en Wellhub. Puedes reservar sesiones de osteopatía directamente desde la app. Para más información, visita su perfil en Wellhub.', category: 'pagos', display_order: 5, active: true },
  { id: 'f6', question: '¿Cuánto dura cada sesión?', answer: 'Las sesiones suelen durar entre 45 y 60 minutos según el tipo de tratamiento. Los masajes relajantes o deportivos pueden ser de 30 a 90 minutos según tu preferencia. Las sesiones de osteopatía incluyen evaluación inicial y pueden alargarse en la primera visita.', category: 'tratamiento', display_order: 6, active: true },
];

const FALLBACK_SETTINGS: SiteSettings = {
  general: {
    site_name: 'MiSalud',
    tagline: 'Salud que viene a ti',
    description: 'Osteopatía, masajes y terapias de bienestar en Madrid. Servicio en centros y a domicilio.',
    phone: '+34 600 000 000',
    email: 'hola@misalud.es',
    instagram: 'https://instagram.com/misalud.es',
  },
  hero: {
    heading: 'Tu salud, en tus manos',
    subheading: 'Osteopatía y masajes terapéuticos en Madrid. En centro o en tu domicilio.',
    cta_primary: 'Reservar cita',
    cta_secondary: 'Conoce al equipo',
  },
  contact: {
    whatsapp: 'https://wa.me/34600000000',
    email: 'hola@misalud.es',
    address: 'Madrid y área metropolitana',
  },
};

// ============================================================
// DATA FETCHING
// ============================================================

async function fetchPageData(): Promise<PageData> {
  // If Supabase env vars not set, return fallback immediately
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co'
  ) {
    return {
      specialists: FALLBACK_SPECIALISTS,
      centros: FALLBACK_CENTROS,
      domicilioZones: FALLBACK_ZONES,
      reviews: FALLBACK_REVIEWS,
      faqs: FALLBACK_FAQS,
      settings: FALLBACK_SETTINGS,
    };
  }

  try {
    const supabase = await createClient();

    const [specialistsRes, servicesRes, centrosRes, zonesRes, reviewsRes, faqsRes, settingsRes] =
      await Promise.all([
        supabase.from('specialists').select('*').eq('active', true).order('display_order'),
        supabase.from('services').select('*').eq('active', true).order('display_order'),
        supabase.from('centros').select('*').eq('active', true).order('display_order'),
        supabase.from('domicilio_zones').select('*').order('display_order'),
        supabase.from('reviews').select('*').eq('active', true).order('display_order'),
        supabase.from('faqs').select('*').eq('active', true).order('display_order'),
        supabase.from('site_settings').select('*'),
      ]);

    // Attach services to specialists
    const services = servicesRes.data ?? [];
    const specialists: Specialist[] = (specialistsRes.data ?? []).map((s) => ({
      ...s,
      services: services.filter((svc) => svc.specialist_id === s.id),
    }));

    // Parse site settings
    const rawSettings = settingsRes.data ?? [];
    const settingsMap: Record<string, unknown> = {};
    rawSettings.forEach((row) => {
      settingsMap[row.key] = row.value;
    });

    const settings: SiteSettings = {
      general: (settingsMap.general as SiteSettings['general']) ?? FALLBACK_SETTINGS.general,
      hero: (settingsMap.hero as SiteSettings['hero']) ?? FALLBACK_SETTINGS.hero,
      contact: (settingsMap.contact as SiteSettings['contact']) ?? FALLBACK_SETTINGS.contact,
    };

    return {
      specialists: specialists.length ? specialists : FALLBACK_SPECIALISTS,
      centros: (centrosRes.data ?? []).length ? (centrosRes.data as Centro[]) : FALLBACK_CENTROS,
      domicilioZones: (zonesRes.data ?? []).length ? (zonesRes.data as DomicilioZone[]) : FALLBACK_ZONES,
      reviews: (reviewsRes.data ?? []).length ? (reviewsRes.data as Review[]) : FALLBACK_REVIEWS,
      faqs: (faqsRes.data ?? []).length ? (faqsRes.data as Faq[]) : FALLBACK_FAQS,
      settings,
    };
  } catch (error) {
    console.error('Supabase fetch error, using fallback data:', error);
    return {
      specialists: FALLBACK_SPECIALISTS,
      centros: FALLBACK_CENTROS,
      domicilioZones: FALLBACK_ZONES,
      reviews: FALLBACK_REVIEWS,
      faqs: FALLBACK_FAQS,
      settings: FALLBACK_SETTINGS,
    };
  }
}

// ============================================================
// PAGE
// ============================================================

export default async function Home() {
  const data = await fetchPageData();
  const { specialists, centros, domicilioZones, reviews, faqs, settings } = data;

  return (
    <>
      <Navbar />
      <main>
        <Hero
          heading={settings.hero.heading}
          subheading={settings.hero.subheading}
          ctaPrimary={settings.hero.cta_primary}
          ctaSecondary={settings.hero.cta_secondary}
        />
        <EspecialistasSection specialists={specialists} />
        <WellhubBanner />
        <CentrosSection centros={centros} />
        <DomicilioSection zones={domicilioZones} />
        <ResenasSection reviews={reviews} />
        <FaqSection faqs={faqs} />
        <ContactoSection
          email={settings.contact.email}
          whatsapp={settings.contact.whatsapp}
        />
      </main>
      <Footer />
    </>
  );
}
