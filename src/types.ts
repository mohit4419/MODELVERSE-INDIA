/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'client' | 'model' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type PaymentStatus = 'success' | 'pending' | 'failed';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
}

export interface Model {
  id: string;
  userId: string;
  name: string;
  gender: 'female' | 'male' | 'non-binary';
  age: number;
  height: string; // e.g. "5'9\"" or "175 cm"
  city: string;
  state: string;
  languages: string[];
  experience: string; // e.g. "2-5 years", "Fresh Face", "5+ years"
  category: string; // e.g. "Fashion Models", "Commercial Models", etc.
  portfolio: string[]; // images URLs
  portfolioCaptions?: string[]; // captions or descriptions for each portfolio image
  portfolioCategories?: string[]; // categories/tags for each portfolio image (e.g. "Runway", "Editorial")
  videoUrl?: string;
  availabilityStatus?: 'Available' | 'Booked' | 'On-Leave';
  selfieVerified: boolean;
  selfieUrl?: string;
  approved: boolean;
  rejected?: boolean;
  available?: boolean;
  archived?: boolean;
  govIdUrl?: string;
  pdfUrl?: string;
  pdfName?: string;
  startingPrice: number; // in INR
  rating: number;
  reviewsCount: number;
  biography: string;
  phone?: string;
  email?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    portfolio?: string;
  };
  measurements?: {
    bust: string;
    waist: string;
    hips: string;
  };
  agencyInfo?: {
    name: string;
    contactName: string;
  };
  additionalDetails?: Record<string, any>;
}

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  modelId: string;
  modelName: string;
  modelImage: string;
  projectDetails: {
    brandName: string;
    companyName: string;
    campaignType: string;
    shootType: string;
    location: string;
    date: string;
    duration: string;
    budgetRange: string;
    notes?: string;
  };
  status: BookingStatus;
  createdAt: string;
  priceAmount: number;
  pdfSummaryUrl?: string;
  pdfGeneratedAt?: string;
  isSharedWithClient?: boolean;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  amount: number;
  paymentGateway: 'Razorpay' | 'Cashfree' | 'Stripe';
  status: PaymentStatus;
  description: string;
  createdAt: string;
  invoiceId: string;
  sessionId?: string;
  modelId?: string;
  isSandbox?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
  bookingId?: string;
  isRead: boolean;
}

export interface Review {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  modelId: string;
  rating: number;
  review: string;
  date: string;
  campaignPhotoUrl?: string;
}

export interface BlogItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  imageUrl: string;
  author: string;
  publishedDate: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
  entityId?: string;
  entityType?: 'model' | 'booking' | 'user' | 'payment' | 'payout';
}

export type PayoutStatus = 'escrowed' | 'pending_approval' | 'released' | 'cancelled';

export interface Payout {
  id: string;
  bookingId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  clientId: string;
  clientName: string;
  amount: number;
  escrowStatus: PayoutStatus;
  createdAt: string;
  releasedAt?: string;
  transactionReference?: string;
  payoutNotes?: string;
}

export interface Post {
  id: string;
  modelId: string;
  modelName: string;
  modelAvatar?: string;
  imageUrl: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  likedByMe?: boolean;
}
