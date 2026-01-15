// User roles
export type UserRole = 'parent' | 'teacher' | 'center_admin' | 'admin';

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

// ============================================
// CENTER TYPES
// ============================================

export interface CenterService {
  nameEn: string;
  nameAr?: string;
  price: number;
  duration: number; // in minutes
}

export interface OperatingHours {
  [day: number]: { open: string; close: string } | null;
}

export interface CenterProfile {
  id: string;
  user_id: string;
  name_en: string;
  name_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  specializations: Specialization[];
  services_offered: CenterService[];
  logo_url: string | null;
  cover_image_url: string | null;
  location_lat: number | null;
  location_lng: number | null;
  city: string | null;
  district: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  operating_hours: OperatingHours;
  is_verified: boolean;
  is_active: boolean;
  rating_avg: number;
  review_count: number;
  founded_year: number | null;
  license_number: string | null;
}

export interface CenterTeacher {
  id: string;
  center_id: string;
  teacher_id: string;
  role: 'staff' | 'manager' | 'lead';
  employment_type: 'full_time' | 'part_time' | 'contract';
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  can_manage_bookings: boolean;
}

export interface CenterWithProfile extends CenterProfile {
  profile: Profile;
  teacher_count?: number;
}

// ============================================
// ADMIN TYPES
// ============================================

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type ModerationAction = 'approved' | 'rejected' | 'flagged';

export interface TeacherApplication {
  id: string;
  user_id: string;
  status: ApplicationStatus;
  documents: { type: string; url: string; name: string }[];
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by_id: string | null;
  review_notes: string | null;
}

export interface ReviewModeration {
  id: string;
  review_id: string;
  action: ModerationAction;
  reason: string | null;
  moderated_at: string;
  moderated_by_id: string;
}

export interface UserSuspension {
  id: string;
  user_id: string;
  reason: string;
  suspended_at: string;
  suspended_by_id: string;
  unsuspended_at: string | null;
  unsuspended_by_id: string | null;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

// Admin dashboard types
export interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalParents: number;
  totalCenters: number;
  pendingReviews: number;
  pendingApplications: number;
  suspendedUsers: number;
}

export interface UserWithDetails extends Profile {
  is_suspended: boolean;
  parent_profile?: ParentProfile;
  teacher_profile?: TeacherProfile;
  center_profile?: CenterProfile;
  bookings_count?: number;
  reviews_count?: number;
}

// ============================================
// COMMUNITY TYPES
// ============================================

export type EventCategory = 'playdate' | 'support_group' | 'workshop' | 'social';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type RSVPStatus = 'going' | 'maybe' | 'not_going';

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  start_date: string;
  end_date: string | null;
  location_name: string;
  address: string | null;
  city: string;
  district: string | null;
  location_lat: number | null;
  location_lng: number | null;
  is_online: boolean;
  online_link: string | null;
  max_attendees: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: RSVPStatus;
  created_at: string;
}

export interface EventWithDetails extends Event {
  organizer: Profile;
  attendees: EventAttendee[];
  attendee_count: number;
}

export interface ForumCategory {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  post_count?: number;
}

export interface ForumPost {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ForumPostWithDetails extends ForumPost {
  author: Profile;
  category: ForumCategory;
  comment_count: number;
}

export interface ForumCommentWithAuthor extends ForumComment {
  author: Profile;
  replies?: ForumCommentWithAuthor[];
}

// Search filters
export interface EventSearchFilters {
  query?: string;
  category?: EventCategory;
  city?: string;
  startDate?: string;
  endDate?: string;
  isOnline?: boolean;
}
