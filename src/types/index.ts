export type UserRole = "STUDENT" | "CUSTOMER" | "ADMIN";
export type UserMode = "STUDENT" | "CUSTOMER";
export type VerificationStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
export type ServiceStatus = "ACTIVE" | "PAUSED" | "DRAFT";
export type OrderStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "IN_PROGRESS" | "DELIVERED" | "COMPLETED" | "CANCELLED";
export type NotificationType = 
  | "ORDER_REQUEST"
  | "ORDER_ACCEPTED"
  | "ORDER_REJECTED"
  | "STATUS_CHANGED"
  | "WORK_DELIVERED"
  | "ORDER_COMPLETED"
  | "NEW_REVIEW"
  | "SYSTEM";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  activeMode: UserMode;
  isVerifiedStudent: boolean;
  avatar?: string | null;
  profile?: {
    college?: string | null;
    degree?: string | null;
    academicYear?: string | null;
    bio?: string | null;
  } | null;
}

export interface ServiceCardData {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  deliveryDays: number;
  averageRating: number;
  totalReviews: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  student: {
    id: string;
    name: string;
    avatar?: string | null;
    isVerifiedStudent: boolean;
    profile?: {
      college?: string | null;
    } | null;
  };
  images: {
    id: string;
    url: string;
    isPrimary: boolean;
  }[];
  isFavorited?: boolean;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  displayOrder: number;
  _count?: {
    services: number;
  };
}

