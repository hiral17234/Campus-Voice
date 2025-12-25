import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from 'react';
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
  increment,
  arrayUnion,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  Issue,
  Comment,
  IssueStatus,
  IssueCategory,
  Stats,
  TimelineEvent,
  Notification,
  UserActivity,
  IssuePriority,
  Department,
  Report,
  ReportReason,
} from '@/types';

/* ================= CONTEXT ================= */

interface CreateIssueData {
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  authorNickname: string;
  authorId: string;
  authorRole?: string;
  mediaUrls?: string[];
  mediaTypes?: ('image' | 'audio' | 'video' | 'pdf')[];
  isUrgent?: boolean;
  isOfficial?: boolean;
}

interface IssuesContextType {
  issues: Issue[];
  comments: Record<string, Comment[]>;
  notifications: Notification[];
  stats: Stats;
  isLoading: boolean;

  addIssue: (data: CreateIssueData) => Promise<void>;
  addComment: (issueId: string, data: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
  vote: (issueId: string, userId: string, type: 'up' | 'down') => Promise<void>;
  updateStatus: (
    issueId: string,
    status: IssueStatus,
    note?: string,
    adminId?: string,
    adminName?: string
  ) => Promise<void>;

  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: (userId: string) => Promise<void>;
  getIssueById: (id: string) => Issue | undefined;
  
  // Additional functions
  reportIssue: (issueId: string, userId: string, reason: ReportReason, customReason?: string) => Promise<void>;
  reportComment: (issueId: string, commentId: string, userId: string, reason: ReportReason, customReason?: string) => Promise<void>;
  deleteIssue: (issueId: string, userId: string) => Promise<boolean>;
  setIssuePriority: (issueId: string, priority: IssuePriority) => Promise<void>;
  assignDepartment: (issueId: string, department: Department, customDepartment?: string) => Promise<void>;
  restoreIssue: (issueId: string) => Promise<void>;
  markAsFalselyAccused: (issueId: string) => Promise<void>;
  getUserActivity: (userId: string) => UserActivity;
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

/* ================= HELPERS ================= */

const toDate = (t: any): Date =>
  t instanceof Timestamp ? t.toDate() : t ? new Date(t) : new Date();

const mapStatus = (s: string): IssueStatus => {
  const map: Record<string, IssueStatus> = {
    open: 'pending',
    pending: 'pending',
    under_review: 'under_review',
    approved: 'approved',
    in_progress: 'in_progress',
    resolved: 'resolved',
    rejected: 'rejected',
    deleted: 'deleted',
  };
  return map[s] || 'pending';
};

/* ================= PROVIDER ================= */

export function IssuesProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  /* ---------- AUTH ---------- */

  useEffect(() => {
    return auth.onAuthStateChanged((u) => {
      setCurrentUserId(u?.uid || null);
    });
  }, []);

  /* ---------- ISSUES ---------- */

  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snap) => {
        const list: Issue[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title,
            description: data.description,
            category: data.category,
            location: data.location,
            authorId: data.createdBy,
            authorNickname: data.createdByUsername || data.authorNickname,
            authorRole: data.authorRole,
            status: mapStatus(data.status),
            priority: data.priority,
            assignedDepartment: data.assignedDepartment,
            customDepartment: data.customDepartment,
            upvotes: data.upvotes || 0,
            downvotes: data.downvotes || 0,
            votedUsers: data.votedUsers || {},
            mediaUrls: data.mediaUrls || [],
            mediaTypes: data.mediaTypes || [],
            timeline: (data.timeline || []).map((t: any, idx: number) => ({
              id: t.id || `timeline-${idx}`,
              ...t,
              timestamp: toDate(t.timestamp),
            })),
            commentCount: data.commentCount || 0,
            isUrgent: data.isUrgent || false,
            isOfficial: data.isOfficial || false,
            reports: data.reports || [],
            reportCount: data.reportCount || 0,
            isReported: data.isReported || false,
            isDeleted: data.isDeleted || false,
            isFalselyAccused: data.isFalselyAccused || false,
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
          };
        });

        setIssues(list);
        setIsLoading(false);
      },
      (err) => {
        console.error('Issues snapshot error:', err);
        setIsLoading(false);
      }
    );
  }, []);

  /* ---------- COMMENTS (FLAT COLLECTION) ---------- */

  useEffect(() => {
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snap) => {
      const grouped: Record<string, Comment[]> = {};

      snap.docs.forEach((d) => {
        const data = d.data();
        const issueId = data.issueId;

        if (!grouped[issueId]) grouped[issueId] = [];

        grouped[issueId].push({
          id: d.id,
          issueId,
          authorId: data.authorId,
          authorNickname: data.authorNickname,
          authorRole: data.authorRole,
          content: data.text || data.content,
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          createdAt: toDate(data.createdAt),
          isOfficial: data.isOfficial || false,
          isAdminResponse: data.isAdminResponse || data.isOfficial || false,
          reports: data.reports || [],
        });
      });

      setComments(grouped);
    });
  }, []);

  /* ---------- NOTIFICATIONS ---------- */

  useEffect(() => {
    if (!currentUserId) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUserId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: toDate(d.data().createdAt),
        })) as Notification[]
      );
    });
  }, [currentUserId]);

  /* ================= ACTIONS ================= */

  const addIssue = async (data: any) => {
    if (!currentUserId) throw new Error('Not authenticated');

    await addDoc(collection(db, 'issues'), {
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location,
      authorNickname: data.authorNickname,
      authorRole: data.authorRole,
      mediaUrls: data.mediaUrls || [],
      mediaTypes: data.mediaTypes || [],
      isUrgent: data.isUrgent || false,
      isOfficial: data.isOfficial || false,
      createdBy: data.authorId || currentUserId,
      createdByUsername: data.authorNickname,
      upvotes: 0,
      downvotes: 0,
      votedUsers: {},
      commentCount: 0,
      reports: [],
      reportCount: 0,
      isReported: false,
      isDeleted: false,
      status: 'open',
      timeline: [
        {
          id: `timeline-${Date.now()}`,
          status: 'pending',
          note: 'Issue created',
          timestamp: Timestamp.now(), // Use Timestamp.now() instead of serverTimestamp() in arrays
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'users', currentUserId), {
      issueCount: increment(1),
    }).catch(() => {
      // User doc might not exist, ignore
    });
  };

  const addComment = async (issueId: string, data: any) => {
    if (!currentUserId) throw new Error('Not authenticated');

    // Build comment document, only include mediaUrl/mediaType if they exist
    const commentDoc: any = {
      issueId,
      authorId: data.authorId,
      authorNickname: data.authorNickname,
      authorRole: data.authorRole || 'student',
      text: data.content,
      isOfficial: data.isOfficial || (data.authorRole || 'student') === 'admin',
      isAdminResponse: data.isAdminResponse || false,
      reports: [],
      createdAt: serverTimestamp(),
    };

    // Only add media fields if they have values (Firebase rejects undefined)
    if (data.mediaUrl) {
      commentDoc.mediaUrl = data.mediaUrl;
    }
    if (data.mediaType) {
      commentDoc.mediaType = data.mediaType;
    }

    await addDoc(collection(db, 'comments'), commentDoc);

    await updateDoc(doc(db, 'issues', issueId), {
      commentCount: increment(1),
    });

    const issue = issues.find((i) => i.id === issueId);
    if (issue && data.authorId !== issue.authorId) {
      await addDoc(collection(db, 'notifications'), {
        userId: issue.authorId,
        type: 'new_comment',
        title: 'New Comment',
        message: `${data.authorNickname} commented on your issue`,
        issueId,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    }
  };

  const vote = async (issueId: string, userId: string, type: 'up' | 'down') => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;

    const prev = issue.votedUsers[userId];
    let up = issue.upvotes;
    let down = issue.downvotes;
    const voted = { ...issue.votedUsers };

    if (prev === type) {
      delete voted[userId];
      type === 'up' ? up-- : down--;
    } else {
      if (prev === 'up') up--;
      if (prev === 'down') down--;
      type === 'up' ? up++ : down++;
      voted[userId] = type;
    }

    await updateDoc(doc(db, 'issues', issueId), {
      upvotes: up,
      downvotes: down,
      votedUsers: voted,
      updatedAt: serverTimestamp(),
    });
  };

  const updateStatus = async (
    issueId: string,
    status: IssueStatus,
    note?: string,
    adminId?: string,
    adminName?: string
  ) => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;

    // Convert existing timeline timestamps to Firestore Timestamps
    // and add new event with current time (not serverTimestamp since it's in array)
    const newTimeline = [
      ...issue.timeline.map(t => ({
        ...t,
        timestamp: t.timestamp instanceof Date ? Timestamp.fromDate(t.timestamp) : t.timestamp,
      })),
      {
        id: `timeline-${Date.now()}`,
        status,
        note,
        adminId,
        adminName,
        timestamp: Timestamp.now(), // Use Timestamp.now() instead of serverTimestamp() in arrays
      },
    ];

    await updateDoc(doc(db, 'issues', issueId), {
      status,
      timeline: newTimeline,
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'notifications'), {
      userId: issue.authorId,
      type: 'status_change',
      title: 'Issue Updated',
      message: `Status changed to ${status}`,
      issueId,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  };

  const reportIssue = async (issueId: string, userId: string, reason: ReportReason, customReason?: string) => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) throw new Error('Issue not found');
    
    if (issue.reports.some(r => r.reporterId === userId)) {
      throw new Error('You have already reported this issue');
    }

    const newReportCount = (issue.reportCount || 0) + 1;
    const isReported = newReportCount >= 3;
    const isDeleted = newReportCount >= 35; // Changed from 10 to 35

    // Build report object - use Timestamp.now() instead of serverTimestamp() in arrays
    const newReport = {
      id: `report-${Date.now()}`,
      reporterId: userId,
      reason,
      ...(customReason && { customReason }), // Only include if defined
      createdAt: Timestamp.now(),
    };

    await updateDoc(doc(db, 'issues', issueId), {
      reports: arrayUnion(newReport),
      reportCount: increment(1),
      isReported,
      isDeleted,
      updatedAt: serverTimestamp(),
    });

    // Check if user is a spam reporter (reported more than 50% of issues)
    const userReportCount = issues.filter(i => i.reports.some(r => r.reporterId === userId)).length + 1;
    const totalIssues = issues.length;
    
    // If user has reported more than 20 issues and that's more than 50% of all issues, disable their account
    if (userReportCount >= 20 && totalIssues > 0 && (userReportCount / totalIssues) > 0.5) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          isDisabled: true,
          disabledReason: 'Spam reporting detected - You have reported an unusually high number of issues',
          disabledAt: serverTimestamp(),
        });

        // Create email notification record for the disabled user
        await addDoc(collection(db, 'email_notifications'), {
          userId,
          type: 'account_disabled',
          subject: 'Your CampusVoice Account Has Been Suspended',
          message: 'Your account has been suspended due to spam reporting behavior. If you believe this is an error, you can submit an appeal.',
          status: 'pending',
          createdAt: serverTimestamp(),
        });

        // Create in-app notification for the user
        await addDoc(collection(db, 'notifications'), {
          userId,
          type: 'account_disabled',
          title: 'Account Suspended',
          message: 'Your account has been suspended for spam reporting. You can submit an appeal.',
          issueId: issueId,
          isRead: false,
          createdAt: serverTimestamp(),
        });

        // Sign out the user if they're the current user
        if (currentUserId === userId) {
          await auth.signOut();
        }
      } catch (error) {
        console.error('Failed to disable spam reporter:', error);
      }
    }
  };

  const reportComment = async (issueId: string, commentId: string, userId: string, reason: ReportReason, customReason?: string) => {
    // Use Timestamp.now() instead of serverTimestamp() in arrays
    const newReport = {
      id: `report-${Date.now()}`,
      reporterId: userId,
      reason,
      ...(customReason && { customReason }), // Only include if defined
      createdAt: Timestamp.now(),
    };

    await updateDoc(doc(db, 'comments', commentId), {
      reports: arrayUnion(newReport),
    });
  };

  const deleteIssue = async (issueId: string, userId: string): Promise<boolean> => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return false;
    
    // Only author can delete their own pending issues
    if (issue.authorId !== userId || issue.status !== 'pending') {
      return false;
    }

    await updateDoc(doc(db, 'issues', issueId), {
      isDeleted: true,
      status: 'deleted',
      updatedAt: serverTimestamp(),
    });

    return true;
  };

  const setIssuePriority = async (issueId: string, priority: IssuePriority) => {
    await updateDoc(doc(db, 'issues', issueId), {
      priority,
      updatedAt: serverTimestamp(),
    });
  };

  const assignDepartment = async (issueId: string, department: Department, customDepartment?: string) => {
    await updateDoc(doc(db, 'issues', issueId), {
      assignedDepartment: department,
      customDepartment: customDepartment || null,
      updatedAt: serverTimestamp(),
    });
  };

  const restoreIssue = async (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) throw new Error('Issue not found');

    await updateDoc(doc(db, 'issues', issueId), {
      isDeleted: false,
      isReported: false,
      reports: [],
      reportCount: 0,
      status: 'pending',
      updatedAt: serverTimestamp(),
    });
  };

  const markAsFalselyAccused = async (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) throw new Error('Issue not found');

    await updateDoc(doc(db, 'issues', issueId), {
      isDeleted: false,
      isReported: false,
      isFalselyAccused: true,
      reports: [],
      reportCount: 0,
      status: 'pending',
      updatedAt: serverTimestamp(),
    });
  };

  const getUserActivity = useCallback((userId: string): UserActivity => {
    const userIssues = issues.filter(i => i.authorId === userId);
    const upvotedIssues = issues.filter(i => i.votedUsers[userId] === 'up').map(i => i.id);
    const downvotedIssues = issues.filter(i => i.votedUsers[userId] === 'down').map(i => i.id);
    
    // Find issues where user has commented
    const commentedIssueIds: string[] = [];
    Object.entries(comments).forEach(([issueId, issueComments]) => {
      if (issueComments.some(c => c.authorId === userId)) {
        commentedIssueIds.push(issueId);
      }
    });

    // Find issues user has reported
    const reportedIssueIds = issues
      .filter(i => i.reports.some(r => r.reporterId === userId))
      .map(i => i.id);

    // Calculate totals received on user's issues
    let totalUpvotesReceived = 0;
    let totalDownvotesReceived = 0;
    let totalCommentsReceived = 0;

    userIssues.forEach(issue => {
      totalUpvotesReceived += issue.upvotes;
      totalDownvotesReceived += issue.downvotes;
      totalCommentsReceived += issue.commentCount;
    });

    return {
      issuesPosted: userIssues.map(i => i.id),
      issuesUpvoted: upvotedIssues,
      issuesDownvoted: downvotedIssues,
      issuesCommented: commentedIssueIds,
      issuesReported: reportedIssueIds,
      totalUpvotesReceived,
      totalDownvotesReceived,
      totalCommentsReceived,
    };
  }, [issues, comments]);

  const markNotificationRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  };

  const markAllNotificationsRead = async (userId: string) => {
    notifications
      .filter((n) => n.userId === userId && !n.isRead)
      .forEach((n) => updateDoc(doc(db, 'notifications', n.id), { isRead: true }));
  };

  const getIssueById = useCallback(
    (id: string) => issues.find((i) => i.id === id),
    [issues]
  );

  /* ---------- STATS ---------- */

  const stats: Stats = useMemo(() => {
    const active = issues.filter((i) => !i.isDeleted);
    
    // Calculate top categories
    const categoryCounts: Record<string, number> = {};
    active.forEach(issue => {
      categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category: category as any, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate hotspot locations
    const locationCounts: Record<string, number> = {};
    active.forEach(issue => {
      const loc = issue.location.trim();
      if (loc) {
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      }
    });
    const hotspotLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalIssues: active.length,
      pending: active.filter((i) => i.status === 'pending').length,
      underReview: active.filter((i) => i.status === 'under_review').length,
      approved: active.filter((i) => i.status === 'approved').length,
      inProgress: active.filter((i) => i.status === 'in_progress').length,
      resolved: active.filter((i) => i.status === 'resolved').length,
      rejected: active.filter((i) => i.status === 'rejected').length,
      reported: active.filter((i) => i.isReported).length,
      deleted: issues.filter((i) => i.isDeleted).length,
      avgResponseTime: 2.1,
      topCategories,
      hotspotLocations,
    };
  }, [issues]);

  return (
    <IssuesContext.Provider
      value={{
        issues,
        comments,
        notifications,
        stats,
        isLoading,
        addIssue,
        addComment,
        vote,
        updateStatus,
        markNotificationRead,
        markAllNotificationsRead,
        getIssueById,
        reportIssue,
        reportComment,
        deleteIssue,
        setIssuePriority,
        assignDepartment,
        restoreIssue,
        markAsFalselyAccused,
        getUserActivity,
      }}
    >
      {children}
    </IssuesContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useIssues() {
  const ctx = useContext(IssuesContext);
  if (!ctx) throw new Error('useIssues must be used inside IssuesProvider');
  return ctx;
}
