import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Issue, Comment, IssueStatus, IssueCategory, Stats, TimelineEvent, Report, ReportReason, Notification, UserActivity, IssuePriority, Department } from '@/types';

interface IssuesContextType {
  issues: Issue[];
  comments: Record<string, Comment[]>;
  stats: Stats;
  notifications: Notification[];
  userActivity: Record<string, UserActivity>;
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'votedUsers' | 'timeline' | 'commentCount' | 'status' | 'reports' | 'reportCount' | 'isReported'>) => void;
  vote: (issueId: string, userId: string, voteType: 'up' | 'down') => void;
  updateStatus: (issueId: string, status: IssueStatus, note?: string, adminId?: string, adminName?: string) => void;
  addComment: (issueId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  getIssueById: (id: string) => Issue | undefined;
  reportIssue: (issueId: string, userId: string, reason: ReportReason, customReason?: string) => void;
  reportComment: (issueId: string, commentId: string, userId: string, reason: ReportReason, customReason?: string) => void;
  deleteIssue: (issueId: string, userId: string) => boolean;
  setIssuePriority: (issueId: string, priority: IssuePriority) => void;
  assignDepartment: (issueId: string, department: Department, customDepartment?: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  getUserActivity: (userId: string) => UserActivity;
  addProofDocument: (issueId: string, documentUrl: string) => void;
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
    status: 'in_progress',
    upvotes: 127,
    downvotes: 3,
    votedUsers: {},
    mediaUrls: [],
    mediaTypes: [],
    timeline: [
      { id: 't1', status: 'pending', timestamp: new Date('2024-01-10'), note: 'Issue reported' },
      { id: 't2', status: 'under_review', timestamp: new Date('2024-01-12'), note: 'Being reviewed by administration' },
      { id: 't3', status: 'approved', timestamp: new Date('2024-01-13'), note: 'Issue approved for action' },
      { id: 't4', status: 'in_progress', timestamp: new Date('2024-01-14'), note: 'Maintenance team dispatched' },
    ],
    commentCount: 24,
    isUrgent: false,
    reports: [],
    reportCount: 0,
    isReported: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '2',
    title: 'Hostel water supply issues',
    description: 'Block B hostel has been facing water supply issues for the past week. Water comes only in the morning for 2 hours and evening for 1 hour. This is affecting students daily routines.',
    category: 'hostel',
    location: 'Block B Hostel',
    authorNickname: 'BraveLion88',
    authorId: 'user2',
    status: 'under_review',
    upvotes: 89,
    downvotes: 2,
    votedUsers: {},
    mediaUrls: [],
    mediaTypes: [],
    timeline: [
      { id: 't1', status: 'pending', timestamp: new Date('2024-01-08'), note: 'Issue reported' },
      { id: 't2', status: 'under_review', timestamp: new Date('2024-01-09'), note: 'Under review by Hostel department' },
    ],
    commentCount: 15,
    isUrgent: true,
    reports: [],
    reportCount: 0,
    isReported: false,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    id: '3',
    title: 'Bus timing not followed',
    description: 'The college bus on Route 5 consistently arrives 15-20 minutes late. Students are missing their first classes regularly. The driver seems to take breaks without informing.',
    category: 'transport',
    location: 'Route 5 - Main Gate',
    authorNickname: 'QuickEagle55',
    authorId: 'user3',
    status: 'pending',
    upvotes: 67,
    downvotes: 12,
    votedUsers: {},
    mediaUrls: [],
    mediaTypes: [],
    timeline: [
      { id: 't1', status: 'pending', timestamp: new Date('2024-01-12'), note: 'Issue reported' },
    ],
    commentCount: 31,
    isUrgent: false,
    reports: [],
    reportCount: 0,
    isReported: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '4',
    title: 'Lab equipment outdated',
    description: 'The computer lab equipment in CS department is severely outdated. Most computers are running Windows 7 and cannot run modern development tools required for coursework.',
    category: 'academics',
    location: 'Computer Science Department - Lab 3',
    authorNickname: 'WiseOwl33',
    authorId: 'user4',
    status: 'pending',
    upvotes: 34,
    downvotes: 8,
    votedUsers: {},
    mediaUrls: [],
    mediaTypes: [],
    timeline: [
      { id: 't1', status: 'pending', timestamp: new Date('2024-01-15'), note: 'Issue reported' },
    ],
    commentCount: 12,
    isUrgent: false,
    reports: [],
    reportCount: 0,
    isReported: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '5',
    title: 'Cultural fest registration issues',
    description: 'The online registration portal for the upcoming cultural fest is not working. Multiple students have reported payment failures and duplicate registrations.',
    category: 'events',
    location: 'Student Affairs Office',
    authorNickname: 'SwiftHawk77',
    authorId: 'user5',
    status: 'resolved',
    upvotes: 156,
    downvotes: 1,
    votedUsers: {},
    mediaUrls: [],
    mediaTypes: [],
    timeline: [
      { id: 't1', status: 'pending', timestamp: new Date('2024-01-05'), note: 'Issue reported' },
      { id: 't2', status: 'under_review', timestamp: new Date('2024-01-05'), note: 'Forwarded to IT team' },
      { id: 't3', status: 'approved', timestamp: new Date('2024-01-06'), note: 'Issue confirmed' },
      { id: 't4', status: 'in_progress', timestamp: new Date('2024-01-07'), note: 'IT team working on fix' },
      { id: 't5', status: 'resolved', timestamp: new Date('2024-01-09'), note: 'Portal fixed and duplicate registrations refunded' },
    ],
    commentCount: 45,
    isUrgent: false,
    reports: [],
    reportCount: 0,
    isReported: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-09'),
  },
];

function calculateStats(issues: Issue[]): Stats {
  const categoryCount: Record<IssueCategory, number> = {
    academics: 0, infrastructure: 0, hostel: 0, transport: 0, events: 0, other: 0
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
    pending: issues.filter(i => i.status === 'pending').length,
    underReview: issues.filter(i => i.status === 'under_review').length,
    approved: issues.filter(i => i.status === 'approved').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    rejected: issues.filter(i => i.status === 'rejected').length,
    reported: issues.filter(i => i.isReported).length,
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
          timeline: i.timeline.map(t => ({ ...t, timestamp: new Date(t.timestamp) })),
          reports: i.reports || [],
          reportCount: i.reportCount || 0,
          isReported: i.isReported || false,
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
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem('campusvoice_notifications');
    if (stored) {
      try {
        return JSON.parse(stored).map((n: Notification) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [userActivity, setUserActivity] = useState<Record<string, UserActivity>>(() => {
    const stored = localStorage.getItem('campusvoice_user_activity');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
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
    localStorage.setItem('campusvoice_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('campusvoice_user_activity', JSON.stringify(userActivity));
  }, [userActivity]);

  const addNotification = (userId: string, type: Notification['type'], title: string, message: string, issueId: string) => {
    const notification: Notification = {
      id: crypto.randomUUID(),
      userId,
      type,
      title,
      message,
      issueId,
      isRead: false,
      createdAt: new Date(),
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const updateUserActivity = (userId: string, field: keyof UserActivity, issueId: string, remove = false) => {
    setUserActivity(prev => {
      const activity = prev[userId] || { issuesPosted: [], issuesUpvoted: [], issuesDownvoted: [], issuesCommented: [], issuesReported: [] };
      const currentList = activity[field];
      const newList = remove 
        ? currentList.filter(id => id !== issueId)
        : currentList.includes(issueId) ? currentList : [...currentList, issueId];
      return { ...prev, [userId]: { ...activity, [field]: newList } };
    });
  };

  const addIssue = (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'votedUsers' | 'timeline' | 'commentCount' | 'status' | 'reports' | 'reportCount' | 'isReported'>) => {
    const now = new Date();
    const newIssue: Issue = {
      ...issueData,
      id: crypto.randomUUID(),
      status: 'pending',
      upvotes: 0,
      downvotes: 0,
      votedUsers: {},
      timeline: [{ id: crypto.randomUUID(), status: 'pending', timestamp: now, note: 'Issue reported' }],
      commentCount: 0,
      reports: [],
      reportCount: 0,
      isReported: false,
      createdAt: now,
      updatedAt: now,
    };
    setIssues(prev => [newIssue, ...prev]);
    updateUserActivity(issueData.authorId, 'issuesPosted', newIssue.id);
  };

  const vote = (issueId: string, userId: string, voteType: 'up' | 'down') => {
    setIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;

      const existingVote = issue.votedUsers[userId];
      let newUpvotes = issue.upvotes;
      let newDownvotes = issue.downvotes;
      const newVotedUsers = { ...issue.votedUsers };

      if (existingVote === voteType) {
        // Remove vote
        if (voteType === 'up') {
          newUpvotes--;
          updateUserActivity(userId, 'issuesUpvoted', issueId, true);
        } else {
          newDownvotes--;
          updateUserActivity(userId, 'issuesDownvoted', issueId, true);
        }
        delete newVotedUsers[userId];
      } else {
        // Change or add vote
        if (existingVote === 'up') {
          newUpvotes--;
          updateUserActivity(userId, 'issuesUpvoted', issueId, true);
        }
        if (existingVote === 'down') {
          newDownvotes--;
          updateUserActivity(userId, 'issuesDownvoted', issueId, true);
        }
        if (voteType === 'up') {
          newUpvotes++;
          updateUserActivity(userId, 'issuesUpvoted', issueId);
        } else {
          newDownvotes++;
          updateUserActivity(userId, 'issuesDownvoted', issueId);
        }
        newVotedUsers[userId] = voteType;
      }

      return {
        ...issue,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        votedUsers: newVotedUsers,
        updatedAt: new Date(),
      };
    }));
  };

  const updateStatus = (issueId: string, status: IssueStatus, note?: string, adminId?: string, adminName?: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;
      const newTimeline: TimelineEvent[] = [
        ...issue.timeline,
        { id: crypto.randomUUID(), status, timestamp: new Date(), note, adminId, adminName }
      ];
      
      // Send notification to issue author
      addNotification(
        issue.authorId,
        status === 'resolved' ? 'issue_resolved' : 'status_change',
        `Issue ${status === 'resolved' ? 'Resolved' : 'Updated'}`,
        `Your issue "${issue.title}" status changed to ${status}`,
        issueId
      );

      return { ...issue, status, timeline: newTimeline, updatedAt: new Date() };
    }));
  };

  const addComment = (issueId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...commentData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      reports: [],
    };
    setComments(prev => ({
      ...prev,
      [issueId]: [...(prev[issueId] || []), newComment]
    }));
    setIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;
      
      // Send notification if faculty comment
      if (commentData.isAdminResponse && issue.authorId !== commentData.authorId) {
        addNotification(
          issue.authorId,
          'faculty_comment',
          'Faculty Response',
          `Faculty responded to your issue "${issue.title}"`,
          issueId
        );
      }
      
      return { ...issue, commentCount: issue.commentCount + 1 };
    }));
    updateUserActivity(commentData.authorId, 'issuesCommented', issueId);
  };

  const getIssueById = (id: string) => issues.find(i => i.id === id);

  const reportIssue = (issueId: string, userId: string, reason: ReportReason, customReason?: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;
      
      // Check if user already reported
      if (issue.reports.some(r => r.reporterId === userId)) return issue;

      const newReport: Report = {
        id: crypto.randomUUID(),
        reporterId: userId,
        reason,
        customReason,
        createdAt: new Date(),
      };

      const newReportCount = issue.reportCount + 1;
      
      return {
        ...issue,
        reports: [...issue.reports, newReport],
        reportCount: newReportCount,
        isReported: newReportCount >= 10,
        updatedAt: new Date(),
      };
    }));
    updateUserActivity(userId, 'issuesReported', issueId);
  };

  const reportComment = (issueId: string, commentId: string, userId: string, reason: ReportReason, customReason?: string) => {
    setComments(prev => ({
      ...prev,
      [issueId]: (prev[issueId] || []).map(comment => {
        if (comment.id !== commentId) return comment;
        if (comment.reports?.some(r => r.reporterId === userId)) return comment;

        const newReport: Report = {
          id: crypto.randomUUID(),
          reporterId: userId,
          reason,
          customReason,
          createdAt: new Date(),
        };

        return {
          ...comment,
          reports: [...(comment.reports || []), newReport],
        };
      })
    }));
  };

  const deleteIssue = (issueId: string, userId: string): boolean => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue || issue.authorId !== userId || issue.status !== 'pending') {
      return false;
    }
    setIssues(prev => prev.filter(i => i.id !== issueId));
    return true;
  };

  const setIssuePriority = (issueId: string, priority: IssuePriority) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, priority, updatedAt: new Date() } : issue
    ));
  };

  const assignDepartment = (issueId: string, department: Department, customDepartment?: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, assignedDepartment: department, customDepartment, updatedAt: new Date() } : issue
    ));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const markAllNotificationsRead = (userId: string) => {
    setNotifications(prev => prev.map(n => 
      n.userId === userId ? { ...n, isRead: true } : n
    ));
  };

  const getUserActivity = (userId: string): UserActivity => {
    return userActivity[userId] || { issuesPosted: [], issuesUpvoted: [], issuesDownvoted: [], issuesCommented: [], issuesReported: [] };
  };

  const addProofDocument = (issueId: string, documentUrl: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, proofDocuments: [...(issue.proofDocuments || []), documentUrl], updatedAt: new Date() } 
        : issue
    ));
  };

  return (
    <IssuesContext.Provider value={{ 
      issues, 
      comments, 
      stats, 
      notifications,
      userActivity,
      addIssue, 
      vote, 
      updateStatus, 
      addComment, 
      getIssueById,
      reportIssue,
      reportComment,
      deleteIssue,
      setIssuePriority,
      assignDepartment,
      markNotificationRead,
      markAllNotificationsRead,
      getUserActivity,
      addProofDocument,
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
