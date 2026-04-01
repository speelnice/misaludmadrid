// ============================================================
// MiSalud v2 — TypeScript Types
// src/types/index.ts
// ============================================================

// --- Enums ---------------------------------------------------

export type UserRole = 'user' | 'admin' | 'specialist';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid' | 'refunded';
export type LocationType = 'centro' | 'home';
export type BookingSource = 'web' | 'admin' | 'phone' | 'whatsapp';
export type NotificationType = 'email_client' | 'email_specialist' | 'email_admin' | 'whatsapp_specialist' | 'whatsapp_admin';
export type NotificationStatus = 'pending' | 'sent' | 'failed';
export type BusinessPlan = 'starter' | 'pro' | 'enterprise';

// --- Base types ----------------------------------------------

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Specialist = {
  id: string;
  profile_id: string | null;
  name: string;
  title: string;
  bio: string | null;
  photo_url: string | null;
  phone: string | null;
  user_email: string | null;
  color: string;
  instagram_url: string | null;
  wellhub_url: string | null;
  google_reviews_url: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  // Relations (joined)
  services?: Service[];
  centros?: Centro[];
};

export type Service = {
  id: string;
  specialist_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_eur: number | null;
  deposit_eur: number | null;
  category: string | null;
  allow_home_visits: boolean;
  display_order: number;
  active: boolean;
  created_at: string;
  // Relations
  specialist?: Specialist;
};

export type Centro = {
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
};

export type AvailabilityRule = {
  id: string;
  specialist_id: string;
  centro_id: string | null;
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  active: boolean;
};

export type BlockedTime = {
  id: string;
  specialist_id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_at: string;
};

// --- Booking -------------------------------------------------

export type Booking = {
  id: string;
  // Client
  client_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  // What
  service_id: string;
  specialist_id: string;
  // Where
  centro_id: string | null;
  location_type: LocationType;
  home_address: string | null;
  // When
  starts_at: string;
  ends_at: string;
  // Status
  status: BookingStatus;
  cancelled_by: 'client' | 'admin' | 'specialist' | null;
  cancel_reason: string | null;
  // Payment
  payment_status: PaymentStatus;
  price_eur: number | null;
  deposit_eur: number | null;
  stripe_session_id: string | null;
  stripe_payment_id: string | null;
  // Notes
  client_notes: string | null;
  internal_notes: string | null;
  // Meta
  source: BookingSource;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  // Relations (joined)
  service?: Service;
  specialist?: Specialist;
  centro?: Centro;
};

// --- Booking flow (UI state) ---------------------------------

export type BookingStep = 'service' | 'specialist' | 'datetime' | 'details' | 'payment' | 'confirmation';

export type BookingFormState = {
  step: BookingStep;
  service: Service | null;
  specialist: Specialist | null;
  centro: Centro | null;
  location_type: LocationType;
  date: string | null;       // YYYY-MM-DD
  time_slot: TimeSlot | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  home_address: string;
  client_notes: string;
};

export type TimeSlot = {
  slot_start: string; // ISO timestamptz
  slot_end: string;
  available: boolean;
};

// --- Availability (API response) ----------------------------

export type AvailabilityResponse = {
  date: string;
  slots: TimeSlot[];
};

// --- Notifications ------------------------------------------

export type Notification = {
  id: string;
  booking_id: string;
  type: NotificationType;
  status: NotificationStatus;
  sent_at: string | null;
  error: string | null;
  created_at: string;
};

// --- Business / Onboarding ----------------------------------

export type Business = {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  plan: BusinessPlan;
  active: boolean;
  onboarded: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type OnboardingStep =
  | 'business'     // Create business name + slug
  | 'service'      // Add first service
  | 'specialist'   // Add specialist + availability
  | 'notifications'// Set up email/WhatsApp
  | 'complete';    // All done

export type OnboardingState = {
  id: string;
  profile_id: string;
  business_id: string | null;
  step: number;
  completed_steps: OnboardingStep[];
  draft: Partial<{
    business_name: string;
    business_slug: string;
    service: Partial<Service>;
    specialist: Partial<Specialist>;
    availability: Partial<AvailabilityRule>[];
  }>;
  completed: boolean;
  completed_at: string | null;
};

// --- API helpers --------------------------------------------

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  count: number;
  page: number;
  per_page: number;
};

// --- Stripe -------------------------------------------------

export type StripeCheckoutPayload = {
  booking_id: string;
  type: 'full' | 'deposit';
  amount_eur: number;
  service_name: string;
  specialist_name: string;
  client_email: string;
  client_name: string;
  starts_at: string;
  success_url: string;
  cancel_url: string;
};
