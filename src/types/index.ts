export type UserRole = 'student' | 'admin';

export type IssueCategory = 
  | 'academics' 
  | 'infrastructure' 
  | 'hostel' 
  | 'transport'
  | 'events'
  | 'other';

export type IssueStatus = 
  | 'pending' 
  | 'under_review' 
  | 'approved'
  | 'in_progress' 
  | 'resolved'
  | 'rejected'
  | 'deleted';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export type Department = 
  | 'admin'
  | 'hostel'
  | 'exam_cell'
  | 'transport'
  | 'harassment_ragging'
  | 'other';

export type ReportReason = 
  | 'fake_spam'
  | 'abusive_content'
  | 'duplicate_issue'
  | 'misleading_info'
  | 'other';

export interface User {
  id: string;
  email?: string;
  role: UserRole;
  nickname?: string;
  isDisabled?: boolean;
  disabledReason?: string;
  disabledAt?: Date;
  createdAt: Date;
}

export interface AccountAppeal {
  id: string;
  userId: string;
  userNickname: string;
  userEmail?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: Date;
  reviewedAt?: Date;
}

export interface TimelineEvent {
  id: string;
  status: IssueStatus;
  timestamp: Date;
  note?: string;
  adminId?: string;
  adminName?: string;
}

export interface Comment {
  id: string;
  issueId: string;
  authorNickname: string;
  authorId: string;
  authorRole?: UserRole;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video' | 'pdf';
  createdAt: Date;
  isAdminResponse?: boolean;
  isOfficial?: boolean;
  reports?: Report[];
}

export interface Report {
  id: string;
  reporterId: string;
  reason: ReportReason;
  customReason?: string;
  createdAt: Date;
}

export interface IssueResolution {
  decision: 'resolved' | 'rejected';
  correct?: boolean;
  reason: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  authorNickname: string;
  authorId: string;
  authorRole?: UserRole;
  status: IssueStatus;
  priority?: IssuePriority;
  assignedDepartment?: Department;
  customDepartment?: string;
  upvotes: number;
  downvotes: number;
  votedUsers: Record<string, 'up' | 'down'>;
  mediaUrls: string[];
  mediaTypes: ('image' | 'audio' | 'video' | 'pdf')[];
  proofDocuments?: string[];
  timeline: TimelineEvent[];
  commentCount: number;
  isUrgent: boolean;
  isOfficial?: boolean;
  reports: Report[];
  reportCount: number;
  isReported: boolean; // true when reportCount >= 3
  isDeleted?: boolean; // true when reportCount >= 35
  isFalselyAccused?: boolean; // true when faculty marks as falsely reported
  resolution?: IssueResolution;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'status_change' | 'faculty_comment' | 'issue_resolved' | 'new_comment' | 'vote_milestone';
  title: string;
  message: string;
  issueId: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Stats {
  totalIssues: number;
  pending: number;
  underReview: number;
  approved: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  reported: number;
  deleted: number;
  avgResponseTime: number;
  topCategories: { category: IssueCategory; count: number }[];
  hotspotLocations: { location: string; count: number }[];
}

export interface UserActivity {
  issuesPosted: string[];
  issuesUpvoted: string[];
  issuesDownvoted: string[];
  issuesCommented: string[];
  issuesReported: string[];
  totalUpvotesReceived: number;
  totalDownvotesReceived: number;
  totalCommentsReceived: number;
}

export const CAMPUS_CODE = 'CAMPUS2024';
export const FACULTY_CODE = 'MITS2025';

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  academics: 'Academics',
  infrastructure: 'Infrastructure',
  hostel: 'Hostel',
  transport: 'Transport',
  events: 'Events',
  other: 'Other',
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  pending: 'Pending',
  under_review: 'Under Review',
  approved: 'Approved',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
  deleted: 'Deleted',
};

export const STATUS_COLORS: Record<IssueStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  under_review: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500',
  approved: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500',
  in_progress: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500',
  resolved: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500',
  rejected: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500',
  deleted: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500',
};

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const PRIORITY_COLORS: Record<IssuePriority, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  high: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
  urgent: 'bg-red-500/20 text-red-600 dark:text-red-400',
};

export const DEPARTMENT_LABELS: Record<Department, string> = {
  admin: 'Admin',
  hostel: 'Hostel',
  exam_cell: 'Exam Cell',
  transport: 'Transport',
  harassment_ragging: 'Harassment/Ragging',
  other: 'Other',
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  fake_spam: 'Fake / Spam',
  abusive_content: 'Abusive Content',
  duplicate_issue: 'Duplicate Issue',
  misleading_info: 'Misleading Information',
  other: 'Other',
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

// Valid status transitions for faculty
export const STATUS_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  pending: ['under_review'],
  under_review: ['approved', 'rejected'],
  approved: ['in_progress'],
  in_progress: ['resolved'],
  resolved: [],
  rejected: [],
  deleted: [],
};
