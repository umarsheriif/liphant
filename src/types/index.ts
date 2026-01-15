// User roles
export type UserRole = 'parent' | 'teacher' | 'center_admin';

// Booking status
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Message types
export type MessageType = 'text' | 'image' | 'voice';

// Specializations
export type Specialization =
  | 'adhd'
  | 'autism'
  | 'speech'
  | 'occupational'
  | 'behavioral'
  | 'learning'
  | 'sensory'
  | 'developmental'
  | 'social'
  | 'other';

// Base profile (extends auth.users)
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  preferred_language: 'ar' | 'en';
  created_at: string;
  updated_at: string;
}

// Parent-specific profile
export interface ParentProfile {
  id: string;
  user_id: string;
  children_count: number;
  children_ages: number[];
  children_conditions: Specialization[];
  location_lat: number | null;
  location_lng: number | null;
  city: string | null;
  district: string | null;
}

// Teacher certification
export interface Certification {
  name: string;
  issuer: string;
  year: number;
  url?: string;
}

// Teacher profile
export interface TeacherProfile {
  id: string;
  user_id: string;
  bio_en: string | null;
  bio_ar: string | null;
  specializations: Specialization[];
  experience_years: number;
  education: string | null;
  certifications: Certification[];
  hourly_rate: number;
  location_lat: number | null;
  location_lng: number | null;
  city: string | null;
  district: string | null;
  service_radius_km: number;
  is_verified: boolean;
  is_available: boolean;
  rating_avg: number;
  review_count: number;
}

// Teacher with profile data (for display)
export interface TeacherWithProfile extends TeacherProfile {
  profile: Profile;
}

// Availability slot
export interface Availability {
  id: string;
  teacher_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_recurring: boolean;
}

// Booking
export interface Booking {
  id: string;
  parent_id: string;
  teacher_id: string;
  status: BookingStatus;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Booking with related data
export interface BookingWithDetails extends Booking {
  teacher: TeacherWithProfile;
  parent: ParentProfile & { profile: Profile };
}

// Review
export interface Review {
  id: string;
  booking_id: string;
  parent_id: string;
  teacher_id: string;
  rating: number; // 1-5
  comment: string | null;
  created_at: string;
  is_visible: boolean;
}

// Review with parent info
export interface ReviewWithParent extends Review {
  parent: {
    profile: Profile;
  };
}

// Conversation
export interface Conversation {
  id: string;
  parent_id: string;
  teacher_id: string;
  last_message_at: string;
  created_at: string;
}

// Message
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  is_read: boolean;
  created_at: string;
}

// Conversation with messages and participants
export interface ConversationWithDetails extends Conversation {
  messages: Message[];
  parent: {
    profile: Profile;
  };
  teacher: {
    profile: Profile;
    teacher_profile: TeacherProfile;
  };
}

// Search filters for teachers
export interface TeacherSearchFilters {
  query?: string;
  city?: string;
  district?: string;
  specializations?: Specialization[];
  minRating?: number;
  maxRate?: number;
  minRate?: number;
  isAvailable?: boolean;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
