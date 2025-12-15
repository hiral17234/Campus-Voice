export type UserRole = 'student' | 'admin';

export type IssueCategory = 
  | 'academics' 
  | 'faculty' 
  | 'infrastructure' 
  | 'safety' 
  | 'food' 
  | 'administration';

export type IssueStatus = 
  | 'open' 
  | 'under_review' 
  | 'escalated' 
  | 'action_in_progress' 
  | 'action_taken' 
  | 'resolved';

export interface User {
  id: string;
  role: UserRole;
  nickname?: string;
  createdAt: Date;
}

export interface TimelineEvent {
  id: string;
  status: IssueStatus;
  timestamp: Date;
  note?: string;
  adminId?: string;
}

export interface Comment {
  id: string;
  issueId: string;
  authorNickname: string;
  authorId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  createdAt: Date;
  isAdminResponse?: boolean;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  authorNickname: string;
  authorId: string;
  status: IssueStatus;
  upvotes: number;
  downvotes: number;
  votedUsers: Record<string, 'up' | 'down'>;
  mediaUrls: string[];
  mediaTypes: ('image' | 'audio' | 'video')[];
  timeline: TimelineEvent[];
  commentCount: number;
  isUrgent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Stats {
  totalIssues: number;
  underReview: number;
  escalated: number;
  resolved: number;
  avgResponseTime: number;
  topCategories: { category: IssueCategory; count: number }[];
  hotspotLocations: { location: string; count: number }[];
}

export const CAMPUS_CODE = 'CAMPUS2024';

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  academics: 'Academics',
  faculty: 'Faculty',
  infrastructure: 'Infrastructure',
  safety: 'Safety',
  food: 'Food',
  administration: 'Administration',
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'Open',
  under_review: 'Under Review',
  escalated: 'Escalated',
  action_in_progress: 'Action In Progress',
  action_taken: 'Action Taken',
  resolved: 'Resolved',
};

export const ADJECTIVES = [
  'Silent', 'Swift', 'Brave', 'Cosmic', 'Mystic', 'Noble', 'Clever', 'Bold',
  'Wise', 'Calm', 'Fierce', 'Gentle', 'Mighty', 'Quick', 'Bright', 'Shadow'
];

export const NOUNS = [
  'Fox', 'Lion', 'Eagle', 'Wolf', 'Bear', 'Hawk', 'Tiger', 'Phoenix',
  'Dragon', 'Raven', 'Owl', 'Falcon', 'Panther', 'Viper', 'Cobra', 'Lynx'
];

export function generateNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}
