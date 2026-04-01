export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Specialist {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  photo_url: string | null;
  instagram_url: string | null;
  wellhub_url: string | null;
  google_reviews_url: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  services?: Service[];
}

export interface Service {
  id: string;
  specialist_id?: string | null;
  name: string;
  category: string | null;
  description: string | null;
  duration_minutes: number | null;
  price_eur: number | null;
  deposit_eur: number | null;
  display_order: number;
  active: boolean;
  allow_home_visits: boolean;
  created_at: string;
  specialists?: Pick<Specialist, 'id' | 'name' | 'title'>[];
}

export interface Centro {
  id: string;
  name: string;
  address: string;
  district: string | null;
  city: string;
  maps_url: string | null;
  phone: string | null;
  description: string | null;
  photo_url: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DomicilioZone {
  id: string;
  region: string;
  districts: string[];
  display_order: number;
}

export interface Review {
  id: string;
  specialist_id: string | null;
  author_name: string;
  author_location: string | null;
  rating: number;
  content: string;
  source: string;
  verified: boolean;
  display_order: number;
  active: boolean;
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  display_order: number;
  active: boolean;
}

export interface SiteSettings {
  general: {
    site_name: string;
    tagline: string;
    description: string;
    phone: string;
    email: string;
    instagram: string;
  };
  hero: {
    heading: string;
    subheading: string;
    cta_primary: string;
    cta_secondary: string;
  };
  contact: {
    whatsapp: string;
    email: string;
    address: string;
  };
}

export interface PageData {
  specialists: Specialist[];
  centros: Centro[];
  domicilioZones: DomicilioZone[];
  reviews: Review[];
  faqs: Faq[];
  settings: SiteSettings;
}
