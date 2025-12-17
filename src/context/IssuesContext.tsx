import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  deleteIssue: (issueId: string, userId: string) => Promise<boolean>;
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

// Helper to convert Firestore timestamp to Date
const toDate = (timestamp: Timestamp | Date | null | undefined): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  return new Date();
};

// Convert Firestore document to Issue
const docToIssue = (id: string, data: any): Issue => ({
  id,
  title: data.title || '',
  description: data.description || '',
  category: data.category || 'other',
  location: data.location || '',
  authorNickname: data.createdByNickname || data.authorNickname || 'Anonymous',
  authorId: data.createdBy || data.authorId || '',
  status: data.status || 'pending',
  priority: data.priority,
  assignedDepartment: data.assignedTo ? 'other' : data.assignedDepartment,
  customDepartment: data.assignedTo || data.customDepartment,
  upvotes: data.upvotes || 0,
  downvotes: data.downvotes || 0,
  votedUsers: data.votedUsers || {},
  mediaUrls: data.mediaUrls || [],
  mediaTypes: data.mediaTypes || [],
  proofDocuments: data.proofDocuments || [],
  timeline: (data.timeline || []).map((t: any) => ({
    ...t,
    timestamp: toDate(t.timestamp),
  })),
  commentCount: data.commentCount || 0,
  isUrgent: data.isUrgent || false,
  reports: data.reports || [],
  reportCount: data.reportCount || 0,
  isReported: data.isReported || false,
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
});

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
  const [firestoreConnected, setFirestoreConnected] = useState(false);

  // Subscribe to Firestore issues collection
  useEffect(() => {
    const issuesRef = collection(db, 'issues');
    const q = query(issuesRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreIssues = snapshot.docs.map(doc => docToIssue(doc.id, doc.data()));
        setIssues(firestoreIssues);
        setFirestoreConnected(true);
        localStorage.setItem('campusvoice_issues', JSON.stringify(firestoreIssues));
      }
    }, (error) => {
      console.error('Firestore issues listener error:', error);
      // Keep using local data on error
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to comments
  useEffect(() => {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreComments: Record<string, Comment[]> = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const issueId = data.issueId;
          if (!firestoreComments[issueId]) {
            firestoreComments[issueId] = [];
          }
          firestoreComments[issueId].push({
            id: doc.id,
            issueId: data.issueId,
            authorNickname: data.userNickname || data.authorNickname || 'Anonymous',
            authorId: data.userId || data.authorId || '',
            content: data.text || data.content || '',
            mediaUrl: data.mediaUrl,
            mediaType: data.mediaType,
            createdAt: toDate(data.createdAt),
            isAdminResponse: data.isAdminResponse || false,
            reports: data.reports || [],
          });
        });
        setComments(firestoreComments);
        localStorage.setItem('campusvoice_comments', JSON.stringify(firestoreComments));
      }
    }, (error) => {
      console.error('Firestore comments listener error:', error);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to notifications
  useEffect(() => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreNotifications = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            type: data.type as Notification['type'],
            title: data.message?.split(':')[0] || 'Notification',
            message: data.message || '',
            issueId: data.issueId || '',
            isRead: data.read || false,
            createdAt: toDate(data.createdAt),
          };
        });
        setNotifications(firestoreNotifications);
        localStorage.setItem('campusvoice_notifications', JSON.stringify(firestoreNotifications));
      }
    }, (error) => {
      console.error('Firestore notifications listener error:', error);
    });

    return () => unsubscribe();
  }, []);

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

  const addNotification = async (userId: string, type: Notification['type'], title: string, message: string, issueId: string) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        message: `${title}: ${message}`,
        issueId,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding notification:', error);
      // Fallback to local
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
    }
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

  const addIssue = async (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'votedUsers' | 'timeline' | 'commentCount' | 'status' | 'reports' | 'reportCount' | 'isReported'>) => {
    const now = new Date();
    const initialTimeline = [{ id: crypto.randomUUID(), status: 'pending' as IssueStatus, timestamp: now, note: 'Issue reported' }];
    
    try {
      await addDoc(collection(db, 'issues'), {
        title: issueData.title,
        description: issueData.description,
        category: issueData.category,
        location: issueData.location,
        createdBy: issueData.authorId,
        createdByNickname: issueData.authorNickname,
        authorNickname: issueData.authorNickname,
        authorId: issueData.authorId,
        status: 'open',
        assignedTo: null,
        resolutionReason: null,
        upvotes: 0,
        downvotes: 0,
        votedUsers: {},
        mediaUrls: issueData.mediaUrls || [],
        mediaTypes: issueData.mediaTypes || [],
        timeline: initialTimeline.map(t => ({ ...t, timestamp: Timestamp.fromDate(t.timestamp) })),
        commentCount: 0,
        isUrgent: issueData.isUrgent || false,
        reports: [],
        reportCount: 0,
        isReported: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding issue to Firestore:', error);
      // Fallback to local
      const newIssue: Issue = {
        ...issueData,
        id: crypto.randomUUID(),
        status: 'pending',
        upvotes: 0,
        downvotes: 0,
        votedUsers: {},
        timeline: initialTimeline,
        commentCount: 0,
        reports: [],
        reportCount: 0,
        isReported: false,
        createdAt: now,
        updatedAt: now,
      };
      setIssues(prev => [newIssue, ...prev]);
    }
    updateUserActivity(issueData.authorId, 'issuesPosted', issueData.authorId);
  };

  const vote = async (issueId: string, userId: string, voteType: 'up' | 'down') => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

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

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        votedUsers: newVotedUsers,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating vote:', error);
      // Fallback to local update
      setIssues(prev => prev.map(i => 
        i.id === issueId 
          ? { ...i, upvotes: newUpvotes, downvotes: newDownvotes, votedUsers: newVotedUsers, updatedAt: new Date() }
          : i
      ));
    }

    // Also store vote in votes collection for Firestore structure
    try {
      const votesRef = collection(db, 'votes');
      const q = query(votesRef, where('issueId', '==', issueId), where('userId', '==', userId));
      const existingVotes = await getDocs(q);
      
      if (!existingVotes.empty) {
        // Update or delete existing vote
        const voteDoc = existingVotes.docs[0];
        if (existingVote === voteType) {
          await deleteDoc(voteDoc.ref);
        } else {
          await updateDoc(voteDoc.ref, { type: voteType === 'up' ? 'upvote' : 'downvote' });
        }
      } else if (existingVote !== voteType) {
        // Add new vote
        await addDoc(votesRef, {
          issueId,
          userId,
          type: voteType === 'up' ? 'upvote' : 'downvote',
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error managing vote document:', error);
    }
  };

  const updateStatus = async (issueId: string, status: IssueStatus, note?: string, adminId?: string, adminName?: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    const newTimelineEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      status,
      timestamp: new Date(),
      note,
      adminId,
      adminName,
    };

    const newTimeline = [...issue.timeline, newTimelineEvent];
    
    // Map status to Firestore format
    const firestoreStatus = status === 'pending' ? 'open' : 
                           status === 'resolved' ? 'resolved' : 
                           status === 'rejected' ? 'rejected' : 'assigned';

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        status: firestoreStatus,
        timeline: newTimeline.map(t => ({
          ...t,
          timestamp: t.timestamp instanceof Date ? Timestamp.fromDate(t.timestamp) : t.timestamp,
        })),
        resolutionReason: (status === 'resolved' || status === 'rejected') ? note : null,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating status:', error);
      // Fallback to local
      setIssues(prev => prev.map(i =>
        i.id === issueId ? { ...i, status, timeline: newTimeline, updatedAt: new Date() } : i
      ));
    }

    // Send notification
    addNotification(
      issue.authorId,
      status === 'resolved' ? 'issue_resolved' : 'status_change',
      `Issue ${status === 'resolved' ? 'Resolved' : 'Updated'}`,
      `Your issue "${issue.title}" status changed to ${status}`,
      issueId
    );
  };

  const addComment = async (issueId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'comments'), {
        issueId,
        userId: commentData.authorId,
        userNickname: commentData.authorNickname,
        text: commentData.content,
        mediaUrl: commentData.mediaUrl,
        mediaType: commentData.mediaType,
        isAdminResponse: commentData.isAdminResponse || false,
        reports: [],
        createdAt: serverTimestamp(),
      });

      // Update comment count on issue
      const issue = issues.find(i => i.id === issueId);
      if (issue) {
        await updateDoc(doc(db, 'issues', issueId), {
          commentCount: (issue.commentCount || 0) + 1,
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      // Fallback to local
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
      setIssues(prev => prev.map(i =>
        i.id === issueId ? { ...i, commentCount: i.commentCount + 1 } : i
      ));
    }

    // Send notification if faculty comment
    const issue = issues.find(i => i.id === issueId);
    if (issue && commentData.isAdminResponse && issue.authorId !== commentData.authorId) {
      addNotification(
        issue.authorId,
        'faculty_comment',
        'Faculty Response',
        `Faculty responded to your issue "${issue.title}"`,
        issueId
      );
    }

    updateUserActivity(commentData.authorId, 'issuesCommented', issueId);
  };

  const getIssueById = useCallback((id: string) => issues.find(i => i.id === id), [issues]);

  const reportIssue = async (issueId: string, userId: string, reason: ReportReason, customReason?: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue || issue.reports.some(r => r.reporterId === userId)) return;

    const newReport: Report = {
      id: crypto.randomUUID(),
      reporterId: userId,
      reason,
      customReason,
      createdAt: new Date(),
    };

    const newReports = [...issue.reports, newReport];
    const newReportCount = newReports.length;
    const newIsReported = newReportCount >= 10;

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        reports: newReports,
        reportCount: newReportCount,
        isReported: newIsReported,
        updatedAt: serverTimestamp(),
      });

      // Also add to reports collection
      await addDoc(collection(db, 'reports'), {
        issueId,
        reportedBy: userId,
        reason: customReason || reason,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error reporting issue:', error);
      setIssues(prev => prev.map(i =>
        i.id === issueId 
          ? { ...i, reports: newReports, reportCount: newReportCount, isReported: newIsReported, updatedAt: new Date() }
          : i
      ));
    }

    updateUserActivity(userId, 'issuesReported', issueId);
  };

  const reportComment = async (issueId: string, commentId: string, userId: string, reason: ReportReason, customReason?: string) => {
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

  const deleteIssue = async (issueId: string, userId: string): Promise<boolean> => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue || issue.authorId !== userId || issue.status !== 'pending') {
      return false;
    }
    
    try {
      await deleteDoc(doc(db, 'issues', issueId));
    } catch (error) {
      console.error('Error deleting issue:', error);
      setIssues(prev => prev.filter(i => i.id !== issueId));
    }
    
    return true;
  };

  const setIssuePriority = async (issueId: string, priority: IssuePriority) => {
    try {
      await updateDoc(doc(db, 'issues', issueId), {
        priority,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error setting priority:', error);
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, priority, updatedAt: new Date() } : issue
      ));
    }
  };

  const assignDepartment = async (issueId: string, department: Department, customDepartment?: string) => {
    try {
      await updateDoc(doc(db, 'issues', issueId), {
        assignedDepartment: department,
        customDepartment,
        assignedTo: customDepartment || null,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error assigning department:', error);
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, assignedDepartment: department, customDepartment, updatedAt: new Date() } : issue
      ));
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
      });
    } catch (error) {
      console.error('Error marking notification read:', error);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    }
  };

  const markAllNotificationsRead = async (userId: string) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('userId', '==', userId), where('read', '==', false));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      setNotifications(prev => prev.map(n => 
        n.userId === userId ? { ...n, isRead: true } : n
      ));
    }
  };

  const getUserActivity = (userId: string): UserActivity => {
    return userActivity[userId] || { issuesPosted: [], issuesUpvoted: [], issuesDownvoted: [], issuesCommented: [], issuesReported: [] };
  };

  const addProofDocument = async (issueId: string, documentUrl: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    const newProofDocuments = [...(issue.proofDocuments || []), documentUrl];

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        proofDocuments: newProofDocuments,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding proof document:', error);
      setIssues(prev => prev.map(i => 
        i.id === issueId 
          ? { ...i, proofDocuments: newProofDocuments, updatedAt: new Date() } 
          : i
      ));
    }
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
