// types/index.ts

// 사용자 타입
export type UserType = 'influencer' | 'advertiser';

// 인플루언서 프로필
export interface InfluencerProfile {
  id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  profileImage?: string;
  categories: string[];
  platforms: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    blog?: string;
  };
  stats: {
    followers: number;
    engagementRate: number;
    avgViews: number;
    completedCampaigns: number;
    avgRating: number;
  };
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip';
  location?: string;
  audienceAgeRange?: [number, number];
  audienceGender?: {
    male: number;
    female: number;
    other: number;
  };
  isVerified: boolean;
  realFollowerRatio?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 광고주 프로필
export interface AdvertiserProfile {
  id: string;
  userId: string;
  companyName: string;
  companyLogo?: string;
  businessRegistration?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  industry: string;
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
  isVerified: boolean;
  campaigns: number;
  totalSpent: number;
  avgRating: number;
  createdAt: Date;
  updatedAt: Date;
}

// 캠페인
export interface Campaign {
  id: string;
  advertiserId: string;
  title: string;
  description: string;
  brand: string;
  brandLogo?: string;
  categories: string[];
  budget: number;
  budgetRange?: {
    min: number;
    max: number;
  };
  startDate: Date;
  endDate: Date;
  location?: string;
  targetAgeRange: [number, number];
  targetGender?: 'all' | 'male' | 'female';
  minFollowers?: number;
  minEngagementRate: number;
  deliverables: string[];
  requirements: string[];
  perks?: string[];
  image?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  urgency?: 'low' | 'medium' | 'high';
  isPremium?: boolean;
  isVIP?: boolean;
  applicants: number;
  viewingNow?: number;
  matchScore?: number;
  aiInsights?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 캠페인 지원
export interface CampaignApplication {
  id: string;
  campaignId: string;
  influencerId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  proposedPrice?: number;
  coverLetter?: string;
  portfolio?: string[];
  estimatedReach?: number;
  estimatedEngagement?: number;
  aiScore?: number;
  aiRecommendation?: string;
  notified: boolean;
  appliedAt: Date;
  respondedAt?: Date;
}

// 메시지
export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderType: UserType | 'system';
  content: string;
  attachments?: {
    type: 'image' | 'file' | 'contract';
    url: string;
    name?: string;
    size?: number;
  }[];
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

// 채팅방
export interface ChatRoom {
  id: string;
  campaignId: string;
  advertiserId: string;
  influencerId: string;
  status: 'active' | 'archived' | 'blocked';
  lastMessage?: Message;
  unreadCount: {
    advertiser: number;
    influencer: number;
  };
  contractStatus?: 'none' | 'proposed' | 'negotiating' | 'accepted' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// 알림
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  priority: 'low' | 'normal' | 'high';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export type NotificationType = 
  | 'campaign_match'
  | 'application_accepted'
  | 'application_rejected'
  | 'payment_received'
  | 'campaign_deadline'
  | 'new_message'
  | 'campaign_reminder'
  | 'profile_view'
  | 'super_like'
  | 'new_applicant'
  | 'milestone_reached'
  | 'ai_insight'
  | 'budget_alert'
  | 'campaign_completed'
  | 'review_submitted'
  | 'content_uploaded'
  | 'high_match_alert'
  | 'system_update'
  | 'promotion'
  | 'achievement';

// AI 분석 결과
export interface AIAnalysisResult {
  influencer: InfluencerProfile;
  matchScore: number;
  pricing: {
    recommended: number;
    min: number;
    max: number;
    factors: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
  };
  analysis: {
    score: number;
    reasons: string[];
    strengths: string[];
    concerns: string[];
  };
  recommendation: string;
}

// 포트폴리오 아이템
export interface PortfolioItem {
  id: string;
  influencerId: string;
  campaignId?: string;
  title: string;
  description?: string;
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  platform: 'instagram' | 'youtube' | 'tiktok' | 'blog';
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number;
  };
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
}

// 결제/정산
export interface Payment {
  id: string;
  campaignId: string;
  influencerId: string;
  advertiserId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  method: 'bank_transfer' | 'card' | 'wallet';
  transactionId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 리뷰
export interface Review {
  id: string;
  campaignId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerType: UserType;
  rating: number;
  comment?: string;
  tags?: string[];
  isPublic: boolean;
  createdAt: Date;
}

// API 응답
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}