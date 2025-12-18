import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
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
  increment
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Issue, Comment, IssueStatus, IssueCategory, Stats, TimelineEvent, Report, ReportReason, Notification, UserActivity, IssuePriority, Department, UserRole } from '@/types';

interface IssuesContextType {
  issues: Issue[];
  comments: Record<string, Comment[]>;
  stats: Stats;
  notifications: Notification[];
  userActivity: Record<string, UserActivity>;
  isLoading: boolean;
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'votedUsers' | 'timeline' | 'commentCount' | 'status' | 'reports' | 'reportCount' | 'isReported' | 'isDeleted'>) => Promise<void>;
  vote: (issueId: string, userId: string, voteType: 'up' | 'down') => Promise<void>;
  updateStatus: (issueId: string, status: IssueStatus, note?: string, adminId?: string, adminName?: string) => Promise<void>;
  addComment: (issueId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
  getIssueById: (id: string) => Issue | undefined;
  reportIssue: (issueId: string, userId: string, reason: ReportReason, customReason?: string) => Promise<void>;
  reportComment: (issueId: string, commentId: string, userId: string, reason: ReportReason, customReason?: string) => void;
  deleteIssue: (issueId: string, userId: string) => Promise<boolean>;
  setIssuePriority: (issueId: string, priority: IssuePriority) => Promise<void>;
  assignDepartment: (issueId: string, department: Department, customDepartment?: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: (userId: string) => Promise<void>;
  getUserActivity: (userId: string) => UserActivity;
  addProofDocument: (issueId: string, documentUrl: string) => Promise<void>;
  restoreIssue: (issueId: string) => Promise<void>;
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

function calculateStats(issues: Issue[]): Stats {
  const categoryCount: Record<IssueCategory, number> = {
    academics: 0, infrastructure: 0, hostel: 0, transport: 0, events: 0, other: 0
  };
  const locationCount: Record<string, number> = {};

  const activeIssues = issues.filter(i => !i.isDeleted);

  activeIssues.forEach(issue => {
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
    totalIssues: activeIssues.length,
    pending: activeIssues.filter(i => i.status === 'pending' || i.status === 'open' as any).length,
    underReview: activeIssues.filter(i => i.status === 'under_review').length,
    approved: activeIssues.filter(i => i.status === 'approved').length,
    inProgress: activeIssues.filter(i => i.status === 'in_progress').length,
    resolved: activeIssues.filter(i => i.status === 'resolved').length,
    rejected: activeIssues.filter(i => i.status === 'rejected').length,
    reported: issues.filter(i => i.isReported && !i.isDeleted).length,
    deleted: issues.filter(i => i.isDeleted).length,
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
  authorNickname: data.createdByUsername || data.createdByNickname || data.authorNickname || 'Anonymous',
  authorId: data.createdBy || data.authorId || '',
  authorRole: data.authorRole || data.role || 'student',
  status: mapFirestoreStatus(data.status),
  priority: data.priority,
  assignedDepartment: data.assignedTo ? 'other' : data.assignedDepartment,
  customDepartment: data.assignedTo || data.customDepartment,
  upvotes: data.upvotes || 0,
  downvotes: data.downvotes || 0,
  votedUsers: data.votedUsers || {},
  mediaUrls: data.attachments?.map((a: any) => a.url) || data.mediaUrls || [],
  mediaTypes: data.attachments?.map((a: any) => a.type) || data.mediaTypes || [],
  proofDocuments: data.proofDocuments || [],
  timeline: (data.timeline || []).map((t: any) => ({
    ...t,
    timestamp: toDate(t.timestamp),
  })),
  commentCount: data.commentCount || 0,
  isUrgent: data.urgent || data.isUrgent || false,
  isOfficial: data.isOfficial || data.authorRole === 'admin',
  reports: data.reports || [],
  reportCount: data.reportCount || 0,
  isReported: data.isReported || (data.reportCount >= 3),
  isDeleted: data.isDeleted || (data.reportCount >= 10),
  resolution: data.resolution,
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
});

// Map Firestore status to app status
const mapFirestoreStatus = (status: string): IssueStatus => {
  const statusMap: Record<string, IssueStatus> = {
    'open': 'pending',
    'assigned': 'in_progress',
    'under_review': 'under_review',
    'in_progress': 'in_progress',
    'resolved': 'resolved',
    'rejected': 'rejected',
    'pending': 'pending',
    'approved': 'approved',
    'deleted': 'deleted',
  };
  return statusMap[status] || 'pending';
};

export function IssuesProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Stats>(() => calculateStats([]));
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Compute user activity from issues and comments
  const userActivity = useMemo(() => {
    const activity: Record<string, UserActivity> = {};
    
    // Process issues for votes and posts
    issues.forEach(issue => {
      // Track author's posted issues
      if (issue.authorId) {
        if (!activity[issue.authorId]) {
          activity[issue.authorId] = {
            issuesPosted: [],
            issuesUpvoted: [],
            issuesDownvoted: [],
            issuesCommented: [],
            issuesReported: [],
            totalUpvotesReceived: 0,
            totalDownvotesReceived: 0,
            totalCommentsReceived: 0,
          };
        }
        activity[issue.authorId].issuesPosted.push(issue.id);
        activity[issue.authorId].totalUpvotesReceived += issue.upvotes;
        activity[issue.authorId].totalDownvotesReceived += issue.downvotes;
        activity[issue.authorId].totalCommentsReceived += issue.commentCount;
      }
      
      // Track voters
      Object.entries(issue.votedUsers).forEach(([oderId, voteType]) => {
        if (!activity[oderId]) {
          activity[oderId] = {
            issuesPosted: [],
            issuesUpvoted: [],
            issuesDownvoted: [],
            issuesCommented: [],
            issuesReported: [],
            totalUpvotesReceived: 0,
            totalDownvotesReceived: 0,
            totalCommentsReceived: 0,
          };
        }
        if (voteType === 'up') {
          if (!activity[oderId].issuesUpvoted.includes(issue.id)) {
            activity[oderId].issuesUpvoted.push(issue.id);
          }
        } else {
          if (!activity[oderId].issuesDownvoted.includes(issue.id)) {
            activity[oderId].issuesDownvoted.push(issue.id);
          }
        }
      });
      
      // Track reporters
      issue.reports.forEach(report => {
        if (!activity[report.reporterId]) {
          activity[report.reporterId] = {
            issuesPosted: [],
            issuesUpvoted: [],
            issuesDownvoted: [],
            issuesCommented: [],
            issuesReported: [],
            totalUpvotesReceived: 0,
            totalDownvotesReceived: 0,
            totalCommentsReceived: 0,
          };
        }
        if (!activity[report.reporterId].issuesReported.includes(issue.id)) {
          activity[report.reporterId].issuesReported.push(issue.id);
        }
      });
    });
    
    // Process comments
    Object.values(comments).flat().forEach(comment => {
      if (comment.authorId) {
        if (!activity[comment.authorId]) {
          activity[comment.authorId] = {
            issuesPosted: [],
            issuesUpvoted: [],
            issuesDownvoted: [],
            issuesCommented: [],
            issuesReported: [],
            totalUpvotesReceived: 0,
            totalDownvotesReceived: 0,
            totalCommentsReceived: 0,
          };
        }
        if (!activity[comment.authorId].issuesCommented.includes(comment.issueId)) {
          activity[comment.authorId].issuesCommented.push(comment.issueId);
        }
      }
    });
    
    return activity;
  }, [issues, comments]);

  // Track auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore issues collection - issues are public, no auth needed
  useEffect(() => {
    const issuesRef = collection(db, 'issues');
    const q = query(issuesRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const firestoreIssues = snapshot.docs.map(doc => docToIssue(doc.id, doc.data()));
        console.log('Loaded issues from Firestore:', firestoreIssues.length);
        setIssues(firestoreIssues);
        setStats(calculateStats(firestoreIssues));
        setIsLoading(false);
      }, 
      (error) => {
        console.error('Firestore issues error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to comments - comments are public, no auth needed
  useEffect(() => {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
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
            authorNickname: data.authorNickname || data.userNickname || 'Anonymous',
            authorId: data.authorId || data.userId || '',
            authorRole: data.authorRole || (data.isAdminResponse ? 'admin' : 'student'),
            content: data.text || data.content || '',
            mediaUrl: data.mediaUrl,
            mediaType: data.mediaType,
            createdAt: toDate(data.createdAt),
            isAdminResponse: data.isAdminResponse || false,
            isOfficial: data.isOfficial || data.isAdminResponse || false,
            reports: data.reports || [],
          });
        });
        console.log('Loaded comments from Firestore:', Object.keys(firestoreComments).length, 'issues with comments');
        setComments(firestoreComments);
      }, 
      (error) => {
        console.error('Firestore comments error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to notifications for current user
  useEffect(() => {
    if (!currentUserId) {
      setNotifications([]);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef, 
      where('userId', '==', currentUserId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const firestoreNotifications = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            type: data.type as Notification['type'],
            title: data.title || data.message?.split(':')[0] || 'Notification',
            message: data.message || '',
            issueId: data.issueId || '',
            isRead: data.read || data.isRead || false,
            createdAt: toDate(data.createdAt),
          };
        });
        console.log('Loaded notifications:', firestoreNotifications.length);
        setNotifications(firestoreNotifications);
      }, 
      (error) => {
        console.error('Firestore notifications error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  const addNotification = async (userId: string, type: Notification['type'], title: string, message: string, issueId: string) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        title,
        message,
        issueId,
        read: false,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      console.log('Notification created for user:', userId);
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const addIssue = async (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'votedUsers' | 'timeline' | 'commentCount' | 'status' | 'reports' | 'reportCount' | 'isReported' | 'isDeleted'>): Promise<void> => {
    if (!currentUserId) {
      throw new Error('You must be logged in to create an issue');
    }

    const now = new Date();
    const initialTimeline = [{ 
      id: crypto.randomUUID(), 
      status: 'pending' as IssueStatus, 
      timestamp: now, 
      note: 'Issue reported' 
    }];
    
    // Prepare attachments array for Firestore
    const attachments = (issueData.mediaUrls || []).map((url, index) => ({
      type: issueData.mediaTypes?.[index] || 'image',
      url: url,
    }));

    const isOfficial = issueData.authorRole === 'admin';

    try {
      const docRef = await addDoc(collection(db, 'issues'), {
        title: issueData.title,
        description: issueData.description,
        category: issueData.category,
        location: issueData.location,
        status: 'open',
        urgent: issueData.isUrgent || false,
        
        createdBy: issueData.authorId,
        createdByUsername: issueData.authorNickname,
        authorRole: issueData.authorRole || 'student',
        anonymous: true,
        role: issueData.authorRole || 'student',
        isOfficial: isOfficial,
        
        attachments: attachments,
        mediaUrls: issueData.mediaUrls || [],
        mediaTypes: issueData.mediaTypes || [],
        
        upvotes: 0,
        downvotes: 0,
        votedUsers: {},
        
        timeline: initialTimeline.map(t => ({ 
          ...t, 
          timestamp: Timestamp.fromDate(t.timestamp) 
        })),
        commentCount: 0,
        reports: [],
        reportCount: 0,
        isReported: false,
        isDeleted: false,
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('Issue created successfully with ID:', docRef.id);

      // Update user's issue count
      try {
        await updateDoc(doc(db, 'users', issueData.authorId), {
          issueCount: increment(1),
        });
      } catch (e) {
        console.error('Error updating issue count:', e);
      }
    } catch (error: any) {
      console.error('Error adding issue to Firestore:', error);
      throw new Error(error.message || 'Failed to save issue to database. Please try again.');
    }
  };

  const vote = async (issueId: string, oderId: string, voteType: 'up' | 'down') => {
    if (!currentUserId) {
      throw new Error('You must be logged in to vote');
    }

    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    const existingVote = issue.votedUsers[oderId];
    let newUpvotes = issue.upvotes;
    let newDownvotes = issue.downvotes;
    const newVotedUsers = { ...issue.votedUsers };

    if (existingVote === voteType) {
      // Remove vote
      if (voteType === 'up') newUpvotes--;
      else newDownvotes--;
      delete newVotedUsers[oderId];
    } else {
      // Change or add vote
      if (existingVote === 'up') newUpvotes--;
      if (existingVote === 'down') newDownvotes--;
      if (voteType === 'up') newUpvotes++;
      else newDownvotes++;
      newVotedUsers[oderId] = voteType;
    }

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        votedUsers: newVotedUsers,
        updatedAt: serverTimestamp(),
      });

      // Update votes collection
      const votesRef = collection(db, 'votes');
      const voteDocId = `${issueId}_${oderId}`;
      
      if (existingVote === voteType) {
        // Remove vote
        try {
          await deleteDoc(doc(votesRef, voteDocId));
        } catch (e) {
          // Vote doc might not exist
        }
      } else {
        // Add or update vote
        await addDoc(votesRef, {
          issueId,
          oderId,
          type: voteType,
          createdAt: serverTimestamp(),
        });
      }

      // Send notification on milestone votes
      const netVotes = newUpvotes - newDownvotes;
      if ([10, 25, 50, 100].includes(netVotes) && issue.authorId !== oderId) {
        addNotification(
          issue.authorId,
          'vote_milestone',
          'Vote Milestone!',
          `Your issue "${issue.title}" reached ${netVotes} votes!`,
          issueId
        );
      }
    } catch (error) {
      console.error('Error updating vote:', error);
      throw new Error('Failed to save vote. Please try again.');
    }
  };

  const updateStatus = async (issueId: string, status: IssueStatus, note?: string, adminId?: string, adminName?: string) => {
    if (!currentUserId) {
      throw new Error('You must be logged in to update status');
    }

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
    
    // Map status for Firestore
    const firestoreStatus = status === 'pending' ? 'open' : status;

    // Prepare resolution data if resolved/rejected
    const resolution = (status === 'resolved' || status === 'rejected') ? {
      decision: status,
      reason: note || '',
      resolvedBy: adminId,
      resolvedAt: serverTimestamp(),
    } : null;

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        status: firestoreStatus,
        timeline: newTimeline.map(t => ({
          ...t,
          timestamp: t.timestamp instanceof Date ? Timestamp.fromDate(t.timestamp) : t.timestamp,
        })),
        ...(resolution && { resolution }),
        resolutionReason: note || null,
        updatedAt: serverTimestamp(),
      });

      // Send notification to issue author
      addNotification(
        issue.authorId,
        status === 'resolved' ? 'issue_resolved' : 'status_change',
        `Issue ${status === 'resolved' ? 'Resolved' : 'Updated'}`,
        `Your issue "${issue.title}" status changed to ${status}`,
        issueId
      );
    } catch (error) {
      console.error('Error updating status:', error);
      throw new Error('Failed to update status. Please try again.');
    }
  };

  const addComment = async (issueId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    if (!currentUserId) {
      throw new Error('You must be logged in to comment');
    }

    const isOfficial = commentData.isAdminResponse || commentData.authorRole === 'admin';

    try {
      await addDoc(collection(db, 'comments'), {
        issueId,
        authorId: commentData.authorId,
        userId: commentData.authorId,
        authorNickname: commentData.authorNickname,
        userNickname: commentData.authorNickname,
        authorRole: commentData.authorRole || (commentData.isAdminResponse ? 'admin' : 'student'),
        text: commentData.content,
        content: commentData.content,
        mediaUrl: commentData.mediaUrl,
        mediaType: commentData.mediaType,
        isAdminResponse: commentData.isAdminResponse || false,
        isOfficial: isOfficial,
        reports: [],
        createdAt: serverTimestamp(),
      });

      console.log('Comment saved successfully for issue:', issueId);

      // Update comment count on issue
      const issue = issues.find(i => i.id === issueId);
      if (issue) {
        await updateDoc(doc(db, 'issues', issueId), {
          commentCount: (issue.commentCount || 0) + 1,
        });

        // Update user's comment count
        try {
          await updateDoc(doc(db, 'users', commentData.authorId), {
            commentCount: increment(1),
          });
        } catch (e) {
          console.error('Error updating comment count:', e);
        }

        // Send notification to issue author if it's not their own comment
        if (issue.authorId !== commentData.authorId) {
          addNotification(
            issue.authorId,
            commentData.isAdminResponse ? 'faculty_comment' : 'new_comment',
            commentData.isAdminResponse ? 'Faculty Response' : 'New Comment',
            `${commentData.authorNickname} commented on your issue "${issue.title}"`,
            issueId
          );
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to save comment. Please try again.');
    }
  };

  const getIssueById = useCallback((id: string) => issues.find(i => i.id === id), [issues]);

  const reportIssue = async (issueId: string, userId: string, reason: ReportReason, customReason?: string) => {
    if (!currentUserId) {
      throw new Error('You must be logged in to report');
    }

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
    const shouldFlag = newReportCount >= 3;
    const shouldDelete = newReportCount >= 10;

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        reports: newReports.map(r => ({
          ...r,
          createdAt: r.createdAt instanceof Date ? Timestamp.fromDate(r.createdAt) : r.createdAt,
        })),
        reportCount: newReportCount,
        isReported: shouldFlag,
        isDeleted: shouldDelete,
        ...(shouldDelete && { status: 'deleted' }),
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
      throw new Error('Failed to report issue. Please try again.');
    }
  };

  const reportComment = (issueId: string, commentId: string, userId: string, reason: ReportReason, customReason?: string) => {
    // For now, just log - implement if needed
    console.log('Report comment:', { issueId, commentId, userId, reason, customReason });
  };

  const deleteIssue = async (issueId: string, userId: string): Promise<boolean> => {
    if (!currentUserId) {
      throw new Error('You must be logged in to delete');
    }

    const issue = issues.find(i => i.id === issueId);
    if (!issue || issue.authorId !== userId) return false;

    try {
      await deleteDoc(doc(db, 'issues', issueId));
      return true;
    } catch (error) {
      console.error('Error deleting issue:', error);
      throw new Error('Failed to delete issue. Please try again.');
    }
  };

  const restoreIssue = async (issueId: string) => {
    if (!currentUserId) {
      throw new Error('You must be logged in to restore');
    }

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        isDeleted: false,
        status: 'pending',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error restoring issue:', error);
      throw new Error('Failed to restore issue. Please try again.');
    }
  };

  const setIssuePriority = async (issueId: string, priority: IssuePriority) => {
    if (!currentUserId) return;

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        priority,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error setting priority:', error);
      throw new Error('Failed to set priority. Please try again.');
    }
  };

  const assignDepartment = async (issueId: string, department: Department, customDepartment?: string) => {
    if (!currentUserId) return;

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        assignedDepartment: department,
        customDepartment,
        assignedTo: customDepartment || department,
        updatedAt: serverTimestamp(),
      });

      const issue = issues.find(i => i.id === issueId);
      if (issue) {
        addNotification(
          issue.authorId,
          'status_change',
          'Issue Assigned',
          `Your issue has been assigned to ${customDepartment || department}`,
          issueId
        );
      }
    } catch (error) {
      console.error('Error assigning department:', error);
      throw new Error('Failed to assign department. Please try again.');
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        isRead: true,
      });
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const markAllNotificationsRead = async (userId: string) => {
    const userNotifications = notifications.filter(n => n.userId === userId && !n.isRead);
    
    for (const notification of userNotifications) {
      try {
        await updateDoc(doc(db, 'notifications', notification.id), {
          read: true,
          isRead: true,
        });
      } catch (error) {
        console.error('Error marking notification read:', error);
      }
    }
  };

  const getUserActivity = (userId: string): UserActivity => {
    return userActivity[userId] || { 
      issuesPosted: [], 
      issuesUpvoted: [], 
      issuesDownvoted: [], 
      issuesCommented: [], 
      issuesReported: [],
      totalUpvotesReceived: 0,
      totalDownvotesReceived: 0,
      totalCommentsReceived: 0,
    };
  };

  const addProofDocument = async (issueId: string, documentUrl: string) => {
    if (!currentUserId) return;

    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    const newProofDocs = [...(issue.proofDocuments || []), documentUrl];

    try {
      await updateDoc(doc(db, 'issues', issueId), {
        proofDocuments: newProofDocs,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding proof document:', error);
      throw new Error('Failed to add document. Please try again.');
    }
  };

  return (
    <IssuesContext.Provider value={{
      issues,
      comments,
      stats,
      notifications,
      userActivity,
      isLoading,
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
      restoreIssue,
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
