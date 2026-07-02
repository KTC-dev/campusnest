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
  images: { id: string; url: string; isPrimary: boolean }[];
}
