export type Role = "STUDENT" | "LANDLORD" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type RoomType = "SELF_CONTAIN" | "SHARED" | "ONE_BEDROOM" | "TWO_BEDROOM" | "HOSTEL";
export type Gender = "MALE" | "FEMALE" | "ANY";
export type ListingStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface Amenity {
  id: string;
  name: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  distanceFromCampusKm: string;
  bedrooms: number;
  bathrooms: number;
  roomType: RoomType;
  genderRestriction: Gender;
  isAvailable: boolean;
  status: ListingStatus;
  rejectionReason?: string | null;
  createdAt?: string;
  images: { id: string; url: string; isPrimary: boolean }[];
  amenities: { amenity: Amenity }[];
  landlord?: {
    firstName: string;
    lastName: string;
    businessName?: string | null;
    isVerified: boolean;
    phone: string;
  };
  _count?: { bookings: number };
}

export interface PropertyListResult {
  items: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  maxDistanceKm?: number;
  gender?: Gender;
  roomType?: RoomType;
  amenityIds?: string[];
  availableOnly?: boolean;
  page?: number;
}

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  id: string;
  status: BookingStatus;
  moveInDate: string;
  message?: string | null;
  createdAt: string;
  property: {
    id?: string;
    title: string;
    images?: { url: string }[];
  };
  student?: {
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
}

export type SleepSchedule = "EARLY_BIRD" | "NIGHT_OWL" | "FLEXIBLE";
export type CleanlinessLevel = "RELAXED" | "MODERATE" | "VERY_CLEAN";
export type NoiseTolerance = "LOW" | "MEDIUM" | "HIGH";

export interface RoommateProfile {
  id: string;
  budgetMin: string;
  budgetMax: string;
  genderPreference: Gender;
  sleepSchedule: SleepSchedule;
  cleanliness: CleanlinessLevel;
  isSmoker: boolean;
  noiseTolerance: NoiseTolerance;
  bio?: string | null;
  isActive: boolean;
}

export interface RoommateMatch {
  score: number;
  profile: RoommateProfile & {
    student: { firstName: string; lastName: string; faculty?: string | null; level?: string | null; avatarUrl?: string | null };
  };
}

export type NotificationType = "BOOKING_UPDATE" | "MESSAGE" | "LISTING_STATUS" | "ROOMMATE_MATCH" | "SYSTEM";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}
export interface CreatePropertyPayload {
  title: string;
  location: string;
  distanceFromCampusKm: number;
  bedrooms: number;
  bathrooms: number;
  roomType: RoomType;
  genderRestriction: Gender;
  amenityIds: string[];
  images: string[]; // base64 data URLs
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalLandlords: number;
  totalProperties: number;
  pendingApprovals: number;
  totalBookings: number;
  approvedBookings: number;
  revenue: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminStudentRow {
  id: string;
  firstName: string;
  lastName: string;
  university: { name: string };
  user: { email: string; isActive: boolean; createdAt: string };
}

export interface AdminLandlordRow {
  id: string;
  firstName: string;
  lastName: string;
  businessName?: string | null;
  isVerified: boolean;
  user: { email: string; isActive: boolean; createdAt: string };
  _count: { properties: number };
}

export interface AdminBookingRow {
  id: string;
  status: BookingStatus;
  moveInDate: string;
  createdAt: string;
  property: { title: string };
  student: { firstName: string; lastName: string };
}
