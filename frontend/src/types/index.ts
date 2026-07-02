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

export interface CreatePropertyPayload {
  title: string;
  description: string;
  price: number;
  location: string;
  distanceFromCampusKm: number;
  bedrooms: number;
  bathrooms: number;
  roomType: RoomType;
  genderRestriction: Gender;
  amenityIds: string[];
  images: string[]; // base64 data URLs
}
