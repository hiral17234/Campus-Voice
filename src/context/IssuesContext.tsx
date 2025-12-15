import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Issue, Comment, IssueStatus, IssueCategory, Stats, TimelineEvent, UserStats } from '@/types';

interface IssuesContextType {
  issues: Issue[];
  comments: Record<string, Comment[]>;
  stats: Stats;
  customCategories: string[];
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'votedUsers' | 'timeline' | 'commentCount' | 'status'>) => void;
  vote: (issueId: string, userId: string, voteType: 'up' | 'down') => boolean;
  updateStatus: (issueId: string, status: IssueStatus, note?: string, adminId?: string) => void;
  addComment: (issueId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  getIssueById: (id: string) => Issue | undefined;
  getUserStats: (userId: string) => UserStats;
  hasVoted: (issueId: string, userId: string) => boolean;
  addCustomCategory: (category: string) => void;
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

const SEED_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'Library AC not working for 2 weeks',
    description: 'The air conditioning in the main library has been broken for over two weeks now. Students are struggling to study in the heat, especially during afternoon hours. Multiple complaints have been filed but no action has been taken.',
    category: 'infrastructure',
    location: 'Main Library - Ground Floor',
    authorNickname: 'SilentFox42',
    authorId: 'user1',
    status: 'escalated',
    upvotes: 127,
    downvotes: 3,
    votedUsers: {},
    mediaUrls: [],
    mediaTypes: [],
    timeline: [
      { id: 't1', status: 'open', timestamp: new Date('2024-01-10'), note: 'Issue reported' },
      { id: 't2', status: 'under_review', timestamp: new Date('2024-01-12'), note: 'Reached 50 upvotes' },
      { id: 't3', status: 'escalated', timestamp: new Date('2024-01-14'), note: 'Reached 100 upvotes - Escalated to administration' },
    ],
    commentCount: 24,
    isUrgent: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '2',
    title: 'Unsafe lighting in parking lot B',
    description: 'Several lights in parking lot B are out, creating dark spots that pose safety concerns, especially for students leaving late evening classes. This is a safety hazard that needs immediate attention.',
    category: 'safety',
    location: 'Parking Lot B',
    authorNickname: 'BraveLion88',
    authorId: 'user2',
    status: 'action_in_progress',
    upvotes: 89,
    downvotes: 2,
    votedUsers: {},
    mediaUrls: [],
    mediaTypes: [],
    timeline: [
      { id: 't1', status: 'open', timestamp: new Date('2024-01-08'), note: 'Issue reported' },
      { id: 't2', status: 'under_review', timestamp: new Date('2024-01-09'), note: 'Marked as urgent - Safety issue' },
      { id: 't3', status: 'action_in_progress', timestamp: new Date('2024-01-11'), note: 'Maintenance team dispatched' },
    ],
    commentCount: 15,
    isUrgent: true,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    id: '3',
    title: 'Cafeteria food quality declining',
    description: 'The quality of food in the main cafeteria has significantly declined over the past month. Stale bread, undercooked vegetables, and overall poor hygiene standards have been observed.',
    category: 'food',
    location: 'Main Cafeteria',
    authorNickname: 'QuickEagle55',
    authorId: 'user3',
    status: 'under_review',
    upvotes: 67,
    downvotes: 12,
    votedUsers: {},
    mediaUrls: [],
    mediaTypes: [],
    timeline: [
      { id: 't1', status: 'open', timestamp: new Date('2024-01-12'), note: 'Issue reported' },
      { id: 't2', status: 'under_review', timestamp: new Date('2024-01-14'), note: 'Reached 50 upvotes' },
    ],
    commentCount: 31,
    isUrgent: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '4',
    title: 'Professor frequently misses classes',
    description: 'Prof. Johnson from the Computer Science department has missed 5 classes this semester without prior notice or make-up sessions. Students are falling behind on the curriculum.',
    category: 'faculty',
    location: 'Computer Science Department',
    authorNickname: 'WiseOwl33',
    authorId: 'user4',
    status: 'open',
    upvotes: 34,
    downvotes: 8,
    votedUsers: {},
    mediaUrls: [],
    mediaTypes: [],
    timeline: [
      { id: 't1', status: 'open', timestamp: new Date('2024-01-15'), note: 'Issue reported' },
    ],
    commentCount: 12,
    isUrgent: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '5',
    title: 'Exam schedule conflict for multiple courses',
    description: 'The final exam schedule has conflicts where ECE 301 and CS 401 are scheduled at the same time. Over 40 students are enrolled in both courses.',
    category: 'academics',
    location: 'Examination Office',
    authorNickname: 'SwiftHawk77',
    authorId: 'user5',
    status: 'resolved',
    upvotes: 156,
    downvotes: 1,
    votedUsers: {},
    mediaUrls: [],
    mediaTypes: [],
    timeline: [
      { id: 't1', status: 'open', timestamp: new Date('2024-01-05'), note: 'Issue reported' },
      { id: 't2', status: 'under_review', timestamp: new Date('2024-01-05'), note: 'Reached 50 upvotes' },
      { id: 't3', status: 'escalated', timestamp: new Date('2024-01-06'), note: 'Reached 100 upvotes' },
      { id: 't4', status: 'action_taken', timestamp: new Date('2024-01-07'), note: 'Exam office notified' },
      { id: 't5', status: 'resolved', timestamp: new Date('2024-01-09'), note: 'Schedule revised - ECE 301 moved to afternoon slot' },
    ],
    commentCount: 45,
    isUrgent: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-09'),
  },
];

function calculateStats(issues: Issue[]): Stats {
  const categoryCount: Record<IssueCategory, number> = {
    academics: 0, faculty: 0, infrastructure: 0, safety: 0, food: 0, administration: 0, other: 0
  };
  const locationCount: Record<string, number> = {};

  issues.forEach(issue => {
    categoryCount[issue.category]++;
    locationCount[issue.location] = (locationCount[issue.location] || 0) + 1;
  });

  const topCategories = Object.entries(categoryCount)
    .map(([category, count]) => ({ category: category as IssueCategory, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const hotspotLocations = Object.entries(locationCount)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalIssues: issues.length,
    underReview: issues.filter(i => i.status === 'under_review').length,
    escalated: issues.filter(i => i.status === 'escalated').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    avgResponseTime: 2.3,
    topCategories,
    hotspotLocations,
  };
}

export function IssuesProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>(() => {
    const stored = localStorage.getItem('campusvoice_issues');
    if (stored) {
      try {
        return JSON.parse(stored).map((i: Issue) => ({
          ...i,
          createdAt: new Date(i.createdAt),
          updatedAt: new Date(i.updatedAt),
          timeline: i.timeline.map(t => ({ ...t, timestamp: new Date(t.timestamp) }))
        }));
      } catch {
        return SEED_ISSUES;
      }
    }
    return SEED_ISSUES;
  });

  const [comments, setComments] = useState<Record<string, Comment[]>>(() => {
    const stored = localStorage.getItem('campusvoice_comments');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        Object.keys(parsed).forEach(key => {
          parsed[key] = parsed[key].map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          }));
        });
        return parsed;
      } catch {
        return {};
      }
    }
    return {};
  });

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const stored = localStorage.getItem('campusvoice_custom_categories');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [stats, setStats] = useState<Stats>(() => calculateStats(SEED_ISSUES));

  useEffect(() => {
    localStorage.setItem('campusvoice_issues', JSON.stringify(issues));
    setStats(calculateStats(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem('campusvoice_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('campusvoice_custom_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  const addCustomCategory = (category: string) => {
    if (!customCategories.includes(category)) {
      setCustomCategories(prev => [...prev, category]);
    }
  };

  const addIssue = (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'votedUsers' | 'timeline' | 'commentCount' | 'status'>) => {
    const now = new Date();
    const newIssue: Issue = {
      ...issueData,
      id: crypto.randomUUID(),
      status: issueData.isUrgent && issueData.category === 'safety' ? 'under_review' : 'open',
      upvotes: 0,
      downvotes: 0,
      votedUsers: {},
      timeline: [{ id: crypto.randomUUID(), status: 'open', timestamp: now, note: 'Issue reported' }],
      commentCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    setIssues(prev => [newIssue, ...prev]);

    // Update user stats
    const userStatsKey = `campusvoice_userstats_${issueData.authorId}`;
    const storedStats = localStorage.getItem(userStatsKey);
    const userStats: UserStats = storedStats ? JSON.parse(storedStats) : { upvotesGiven: 0, downvotesGiven: 0, commentsPosted: 0, issuesCreated: 0 };
    userStats.issuesCreated++;
    localStorage.setItem(userStatsKey, JSON.stringify(userStats));
  };

  const hasVoted = (issueId: string, userId: string): boolean => {
    const issue = issues.find(i => i.id === issueId);
    return issue ? userId in issue.votedUsers : false;
  };

  const vote = (issueId: string, userId: string, voteType: 'up' | 'down'): boolean => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return false;

    // Check if user has already voted - votes are permanent
    if (issue.votedUsers[userId]) {
      return false; // Already voted, cannot vote again
    }

    setIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;

      let newUpvotes = issue.upvotes;
      let newDownvotes = issue.downvotes;
      const newVotedUsers = { ...issue.votedUsers };

      // Add vote (permanent - cannot be changed or removed)
      if (voteType === 'up') newUpvotes++;
      else newDownvotes++;
      newVotedUsers[userId] = voteType;

      const netVotes = newUpvotes - newDownvotes;
      let newStatus = issue.status;
      const newTimeline = [...issue.timeline];

      if (issue.status === 'open' && netVotes >= 50) {
        newStatus = 'under_review';
        newTimeline.push({ id: crypto.randomUUID(), status: 'under_review', timestamp: new Date(), note: 'Reached 50 upvotes - Under review' });
      } else if (issue.status === 'under_review' && netVotes >= 100) {
        newStatus = 'escalated';
        newTimeline.push({ id: crypto.randomUUID(), status: 'escalated', timestamp: new Date(), note: 'Reached 100 upvotes - Escalated to administration' });
      }

      return {
        ...issue,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        votedUsers: newVotedUsers,
        status: newStatus,
        timeline: newTimeline,
        updatedAt: new Date(),
      };
    }));

    // Update user stats
    const userStatsKey = `campusvoice_userstats_${userId}`;
    const storedStats = localStorage.getItem(userStatsKey);
    const userStats: UserStats = storedStats ? JSON.parse(storedStats) : { upvotesGiven: 0, downvotesGiven: 0, commentsPosted: 0, issuesCreated: 0 };
    if (voteType === 'up') userStats.upvotesGiven++;
    else userStats.downvotesGiven++;
    localStorage.setItem(userStatsKey, JSON.stringify(userStats));

    return true;
  };

  const updateStatus = (issueId: string, status: IssueStatus, note?: string, adminId?: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;
      const newTimeline: TimelineEvent[] = [
        ...issue.timeline,
        { id: crypto.randomUUID(), status, timestamp: new Date(), note, adminId }
      ];
      return { ...issue, status, timeline: newTimeline, updatedAt: new Date() };
    }));
  };

  const addComment = (issueId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...commentData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setComments(prev => ({
      ...prev,
      [issueId]: [...(prev[issueId] || []), newComment]
    }));
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, commentCount: issue.commentCount + 1 } : issue
    ));

    // Update user stats
    const userStatsKey = `campusvoice_userstats_${commentData.authorId}`;
    const storedStats = localStorage.getItem(userStatsKey);
    const userStats: UserStats = storedStats ? JSON.parse(storedStats) : { upvotesGiven: 0, downvotesGiven: 0, commentsPosted: 0, issuesCreated: 0 };
    userStats.commentsPosted++;
    localStorage.setItem(userStatsKey, JSON.stringify(userStats));
  };

  const getIssueById = (id: string) => issues.find(i => i.id === id);

  const getUserStats = (userId: string): UserStats => {
    const userStatsKey = `campusvoice_userstats_${userId}`;
    const storedStats = localStorage.getItem(userStatsKey);
    return storedStats ? JSON.parse(storedStats) : { upvotesGiven: 0, downvotesGiven: 0, commentsPosted: 0, issuesCreated: 0 };
  };

  return (
    <IssuesContext.Provider value={{ 
      issues, 
      comments, 
      stats, 
      customCategories,
      addIssue, 
      vote, 
      updateStatus, 
      addComment, 
      getIssueById, 
      getUserStats,
      hasVoted,
      addCustomCategory
    }}>
      {children}
    </IssuesContext.Provider>
  );
}

export function useIssues() {
  const context = useContext(IssuesContext);
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssuesProvider');
  }
  return context;
}
