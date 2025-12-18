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

interface IssuesContextType {
  issues: Issue[];
  comments: Record<string, Comment[]>;
  notifications: Notification[];
  stats: Stats;
  isLoading: boolean;

  addIssue: (data: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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
            authorNickname: data.createdByUsername,
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
            timeline: (data.timeline || []).map((t: any) => ({
              ...t,
              timestamp: toDate(t.timestamp),
            })),
            commentCount: data.commentCount || 0,
            reports: data.reports || [],
            reportCount: data.reportCount || 0,
            isReported: data.isReported || false,
            isDeleted: data.isDeleted || false,
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
          content: data.text,
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          createdAt: toDate(data.createdAt),
          isOfficial: data.isOfficial || false,
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
      ...data,
      createdBy: currentUserId,
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
          status: 'pending',
          note: 'Issue created',
          timestamp: serverTimestamp(),
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'users', currentUserId), {
      issueCount: increment(1),
    });
  };

  const addComment = async (issueId: string, data: any) => {
    if (!currentUserId) throw new Error('Not authenticated');

    await addDoc(collection(db, 'comments'), {
      issueId,
      authorId: data.authorId,
      authorNickname: data.authorNickname,
      authorRole: data.authorRole,
      text: data.content,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      isOfficial: data.authorRole === 'admin',
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'issues', issueId), {
      commentCount: increment(1),
    });

    if (data.authorId !== issues.find((i) => i.id === issueId)?.authorId) {
      await addDoc(collection(db, 'notifications'), {
        userId: issues.find((i) => i.id === issueId)?.authorId,
        type: 'comment',
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

    await updateDoc(doc(db, 'issues', issueId), {
      status,
      timeline: [
        ...issue.timeline,
        {
          status,
          note,
          adminId,
          adminName,
          timestamp: serverTimestamp(),
        },
      ],
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'notifications'), {
      userId: issue.authorId,
      type: 'status',
      title: 'Issue Updated',
      message: `Status changed to ${status}`,
      issueId,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  };

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
      topCategories: [],
      hotspotLocations: [],
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
