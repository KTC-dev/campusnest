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

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    faculty?: string | null;
    level?: string | null;
    avatarUrl?: string | null;
    universityId?: string | null;
  } | null;
  landlord?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    businessName?: string | null;
    isVerified: boolean;
  } | null;
  admin?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export interface University {
  id: string;
  name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type RoomType = "SELF_CONTAIN" | "SHARED" | "ONE_BEDROOM" | "TWO_BEDROOM" | "HOSTEL";
export type Gender = "MALE" | "FEMALE" | "ANY";
export type ListingStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type VerificationStatus = "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "SUSPENDED";
export type ConversationType = "PROPERTY_CHAT" | "ROOMMATE_CHAT";
export type MessageAttachmentType = "IMAGE" | "PDF";
export type MessageType = "TEXT" | "IMAGE" | "SYSTEM";

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
  university?: {
    id: string;
    name: string;
  };
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
    student: {
      id: string;
      firstName: string;
      lastName: string;
      faculty?: string | null;
      level?: string | null;
      avatarUrl?: string | null;
      university?: { id: string; name: string };
    };
  };
}

export interface ConversationAttachment {
  id?: string;
  url: string;
  publicId?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  type: MessageAttachmentType;
}

export interface ConversationSenderSummary {
  id: string;
  email: string;
  role: Role;
  isVerified: boolean;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  isRead: boolean;
  readAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  attachments: ConversationAttachment[];
  sender: ConversationSenderSummary;
}

export interface ConversationParticipantSummary {
  id: string;
  userId: string;
  user: ConversationSenderSummary;
}

export interface PropertyConversationContext {
  id: string;
  title: string;
  location: string;
  price: string;
  university?: { id: string; name: string };
  images: { id: string; url: string; isPrimary: boolean }[];
  landlord: { firstName: string; lastName: string; businessName?: string | null; isVerified: boolean; phone: string };
}

export interface RoommateConversationContext {
  id: string;
  studentA: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    university?: { id: string; name: string };
    user: ConversationSenderSummary;
    roommateProfile?: {
      budgetMin: string;
      budgetMax: string;
      genderPreference: Gender;
      sleepSchedule: SleepSchedule;
      cleanliness: CleanlinessLevel;
      isSmoker: boolean;
      noiseTolerance: NoiseTolerance;
      bio?: string | null;
    } | null;
  };
  studentB: RoommateConversationContext["studentA"];
  score: number;
}

export interface ConversationSummary {
  id: string;
  type: ConversationType;
  propertyId?: string | null;
  roommateMatchId?: string | null;
  primaryStudentId?: string | null;
  secondaryStudentId?: string | null;
  landlordId?: string | null;
  unreadCount: number;
  isArchived: boolean;
  lastMessageId?: string | null;
  lastMessageContent?: string | null;
  lastMessageType?: MessageType | null;
  lastMessageAt?: string | null;
  lastMessageSenderId?: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: ConversationMessage[];
  primaryStudent?: ConversationParticipantSummary | null;
  secondaryStudent?: ConversationParticipantSummary | null;
  landlord?: ConversationParticipantSummary | null;
  property?: PropertyConversationContext | null;
  roommateMatch?: RoommateConversationContext | null;
  context?: { type: ConversationType; property?: PropertyConversationContext | null; roommateMatch?: RoommateConversationContext | null; landlord?: ConversationParticipantSummary | null };
}

export interface ConversationMessagesPage {
  items: ConversationMessage[];
  hasMore: boolean;
  nextCursor?: string | null;
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
  ownerConfirmation?: boolean;
  isAvailable?: boolean;
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

export interface VerificationUserSummary {
  email: string;
  role: Role;
}

export interface VerificationLandlordSummary {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  businessName?: string | null;
  isVerified?: boolean;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  landlordId?: string | null;
  idDocumentUrl: string;
  selfieUrl?: string | null;
  proofOfOwnershipUrl?: string | null;
  status: VerificationStatus;
  adminNotes?: string | null;
  submitterConfirmation?: boolean | null;
  createdAt: string;
  reviewedAt?: string | null;
  user?: VerificationUserSummary;
  landlord?: VerificationLandlordSummary | null;
}

export interface PublicStats {
  studentsRegistered: number;
  verifiedProperties: number;
  verifiedLandlords: number;
  successfulBookings: number;
}
