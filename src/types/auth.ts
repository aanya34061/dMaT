export type UserRole = 'USER' | 'ADMIN';
export type UserPlan = 'FREE' | 'PRO';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastActive: string;
  subscription: {
    plan: UserPlan;
    status: SubscriptionStatus;
    startDate: string;
    expiryDate?: string;
  };
  profile: {
    streak: number;
    xp: number;
    accuracy: number;
    studyTimeMinutes: number;
    totalAttempts: number;
    correctAnswers: number;
    incorrectAnswers: number;
    completedChaptersCount: number;
    bookmarkedCount: number;
    lastLogin: string;
  };
  progress: {
    lastQuestionId: number | null;
    answers: Record<number, number>;
    bookmarks: number[];
  };
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  proSubscribers: number;
  freeUsers: number;
  totalQuestions: number;
  totalChapters: number;
  averageAccuracy: number;
  totalRevenue: number;
  newUsersToday: number;
}

export interface SubscriberRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  plan: UserPlan;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate?: string;
  paymentStatus: string;
}

export interface AnalyticsData {
  dailyActiveUsers: { date: string; users: number }[];
  registrations: { date: string; count: number }[];
  questionAttempts: { date: string; attempts: number }[];
  chapterCompletions: { chapter: string; completions: number }[];
  subscriptionGrowth: { month: string; free: number; pro: number }[];
}
