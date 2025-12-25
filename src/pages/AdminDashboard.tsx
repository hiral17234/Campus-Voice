import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssuesContext';
import { StatusBadge } from '@/components/StatusBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StatusChangeModal } from '@/components/StatusChangeModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORY_LABELS, STATUS_LABELS, PRIORITY_LABELS, DEPARTMENT_LABELS, IssueStatus, Issue, IssuePriority, Department, AccountAppeal } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { collection, query, getDocs, doc, updateDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  LogOut,
  Search,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Users,
  MapPin,
  Eye,
  RefreshCw,
  Flag,
  Building2,
  ArrowUpDown,
  XCircle,
  Bell,
  Plus,
  Trash2,
  RotateCcw,
  Shield,
  Gavel,
  UserX,
  UserCheck
} from 'lucide-react';
import campusVoiceLogo from '@/assets/campusvoice-logo.png';
import { DepartmentSelect } from '@/components/DepartmentSelect';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { issues, stats, updateStatus, addComment, setIssuePriority, assignDepartment, notifications, restoreIssue, markAsFalselyAccused } = useIssues();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Appeals state
  const [appeals, setAppeals] = useState<AccountAppeal[]>([]);
  const [isLoadingAppeals, setIsLoadingAppeals] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  const unreadNotifications = notifications.filter(n => n.userId === user?.id && !n.isRead).length;

  // Show issues with any reports (reportCount > 0) not just isReported (which requires 3+)
  const reportedIssues = useMemo(() => issues.filter(i => (i.reportCount > 0 || i.isReported) && !i.isDeleted && !i.isFalselyAccused), [issues]);
  const deletedIssues = useMemo(() => issues.filter(i => i.isDeleted && !i.isFalselyAccused), [issues]);
  const falselyAccusedIssues = useMemo(() => issues.filter(i => i.isFalselyAccused), [issues]);

  // Fetch appeals when appeals tab is active
  useEffect(() => {
    if (activeTab === 'appeals') {
      fetchAppeals();
    }
  }, [activeTab]);

  const fetchAppeals = async () => {
    setIsLoadingAppeals(true);
    try {
      const appealsQuery = query(collection(db, 'account_appeals'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(appealsQuery);
      const appealsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate() || undefined,
      })) as AccountAppeal[];
      setAppeals(appealsData);
    } catch (error) {
      console.error('Error fetching appeals:', error);
      toast.error('Failed to load appeals');
    } finally {
      setIsLoadingAppeals(false);
    }
  };

  const handleApproveAppeal = async (appeal: AccountAppeal) => {
    try {
      // Update appeal status
      await updateDoc(doc(db, 'account_appeals', appeal.id), {
        status: 'approved',
        reviewedAt: serverTimestamp(),
        reviewedBy: user?.id,
      });

      // Re-enable user account
      await updateDoc(doc(db, 'users', appeal.userId), {
        isDisabled: false,
        disabledReason: null,
        disabledAt: null,
      });

      // Create notification for user
      await addDoc(collection(db, 'notifications'), {
        userId: appeal.userId,
        type: 'system',
        title: 'Account Reinstated',
        message: 'Your appeal has been approved. Your account has been reinstated. Please follow community guidelines.',
        isRead: false,
        createdAt: serverTimestamp(),
      });

      toast.success('Appeal approved - user account reinstated');
      fetchAppeals();
    } catch (error) {
      console.error('Error approving appeal:', error);
      toast.error('Failed to approve appeal');
    }
  };

  const handleRejectAppeal = async (appeal: AccountAppeal, reason: string) => {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      // Update appeal status
      await updateDoc(doc(db, 'account_appeals', appeal.id), {
        status: 'rejected',
        reviewedAt: serverTimestamp(),
        reviewedBy: user?.id,
        rejectionReason: reason.trim(),
      });

      // Create notification for user
      await addDoc(collection(db, 'notifications'), {
        userId: appeal.userId,
        type: 'system',
        title: 'Appeal Rejected',
        message: `Your appeal has been rejected. Reason: ${reason.trim()}`,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      toast.success('Appeal rejected');
      setRejectionReasons(prev => {
        const updated = { ...prev };
        delete updated[appeal.id];
        return updated;
      });
      fetchAppeals();
    } catch (error) {
      console.error('Error rejecting appeal:', error);
      toast.error('Failed to reject appeal');
    }
  };

  const filteredIssues = useMemo(() => {
    let filtered: Issue[] = [];
    
    if (activeTab === 'reported') {
      filtered = reportedIssues;
    } else if (activeTab === 'deleted') {
      filtered = deletedIssues;
    } else if (activeTab === 'falsely_accused') {
      filtered = falselyAccusedIssues;
    } else {
      filtered = issues.filter(i => !i.isReported && !i.isDeleted && !i.isFalselyAccused);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(query) ||
        i.location.toLowerCase().includes(query) ||
        i.authorNickname.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(i => i.category === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(i => i.priority === priorityFilter);
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        filtered = [...filtered].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'popular':
        filtered = [...filtered].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      default:
        filtered = [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return filtered;
  }, [issues, reportedIssues, deletedIssues, falselyAccusedIssues, activeTab, searchQuery, statusFilter, categoryFilter, priorityFilter, sortBy]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleStatusChange = (newStatus: IssueStatus, note: string) => {
    if (!selectedIssue || !user) return;
    updateStatus(selectedIssue.id, newStatus, note, user.id, user.nickname || 'Admin');
    addComment(selectedIssue.id, {
      issueId: selectedIssue.id,
      authorNickname: user.nickname || 'Administration',
      authorId: user.id,
      authorRole: 'admin',
      content: `Status updated to ${STATUS_LABELS[newStatus]}: ${note}`,
      isAdminResponse: true,
      isOfficial: true,
    });
    toast.success('Issue status updated');
    setSelectedIssue(null);
  };

  const handlePriorityChange = (issueId: string, priority: IssuePriority) => {
    setIssuePriority(issueId, priority);
    toast.success('Priority updated');
  };

  const handleDepartmentAssign = (issueId: string, department: Department, customDepartment?: string) => {
    assignDepartment(issueId, department, customDepartment);
    toast.success(department === 'other' && customDepartment ? `Assigned to: ${customDepartment}` : 'Department assigned');
  };

  const handleRestoreIssue = async (issueId: string) => {
    try {
      await restoreIssue(issueId);
      toast.success('Issue restored successfully');
    } catch (error) {
      toast.error('Failed to restore issue');
    }
  };

  const handleMarkFalselyAccused = async (issueId: string) => {
    try {
      await markAsFalselyAccused(issueId);
      toast.success('Issue marked as falsely accused and restored');
    } catch (error) {
      toast.error('Failed to mark issue as falsely accused');
    }
  };

  const statCards = [
    { label: 'Total Issues', value: stats.totalIssues, icon: BarChart3, color: 'text-foreground' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-muted-foreground' },
    { label: 'Under Review', value: stats.underReview, icon: AlertTriangle, color: 'text-blue-500' },
    { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'text-orange-500' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src={campusVoiceLogo} alt="CampusVoice" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Faculty Dashboard</h1>
                <p className="text-xs text-muted-foreground">CampusVoice Management</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/create')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Post Official Issue
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
              <ThemeToggle />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              >
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.nickname || 'Admin'}</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <stat.icon className={`h-6 w-6 ${stat.color} opacity-50`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Reported Issues Alert */}
        {reportedIssues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="mb-6 border-red-500/50 bg-red-500/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flag className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-600 dark:text-red-400">
                      {reportedIssues.length} Reported Issues Need Attention
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Issues with 3+ reports are flagged. Issues with 10+ reports are auto-deleted.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-red-500/50 text-red-600 hover:bg-red-500/10"
                  onClick={() => setActiveTab('reported')}
                >
                  Review Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Issues</TabsTrigger>
            <TabsTrigger value="reported" className="relative">
              Reported
              {reportedIssues.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  {reportedIssues.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="deleted" className="relative">
              <Trash2 className="h-4 w-4 mr-1" />
              Deleted
              {deletedIssues.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {deletedIssues.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="falsely_accused" className="relative">
              <Shield className="h-4 w-4 mr-1 text-green-500" />
              Falsely Accused
              {falselyAccusedIssues.length > 0 && (
                <Badge className="ml-2 h-5 px-1.5 bg-green-500/20 text-green-600 dark:text-green-400">
                  {falselyAccusedIssues.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="appeals" className="relative">
              <Gavel className="h-4 w-4 mr-1" />
              Appeals
              {appeals.filter(a => a.status === 'pending').length > 0 && (
                <Badge variant="outline" className="ml-2 h-5 px-1.5">
                  {appeals.filter(a => a.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Table */}
              <div className="lg:col-span-3">
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex flex-col gap-4">
                      <CardTitle>
                        {activeTab === 'reported' ? 'Reported Issues' : activeTab === 'deleted' ? 'Deleted Issues' : activeTab === 'falsely_accused' ? 'Falsely Accused Issues' : activeTab === 'appeals' ? 'Account Appeals' : 'All Issues'}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search issues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priority</SelectItem>
                            {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                          <SelectTrigger className="w-32">
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="popular">Popular</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Issue</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            {activeTab === 'reported' && <TableHead>Reports</TableHead>}
                            <TableHead>Votes</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredIssues.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={activeTab === 'reported' ? 7 : 6} className="text-center py-8 text-muted-foreground">
                                No issues found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredIssues.map((issue) => (
                              <TableRow key={issue.id} className={issue.isFalselyAccused ? 'bg-green-500/10 border-l-4 border-green-500' : issue.isReported ? 'bg-red-500/5' : issue.isOfficial ? 'bg-primary/5' : ''}>
                                <TableCell>
                                  <div className="max-w-[180px]">
                                    <div className="flex items-center gap-2">
                                      {issue.isFalselyAccused && <Shield className="h-3 w-3 text-green-500 flex-shrink-0" />}
                                      {issue.isReported && !issue.isFalselyAccused && <Flag className="h-3 w-3 text-red-500 flex-shrink-0" />}
                                      {issue.isOfficial && <Shield className="h-3 w-3 text-primary flex-shrink-0" />}
                                      <p className="font-medium truncate">{issue.title}</p>
                                    </div>
                                    {issue.isFalselyAccused && (
                                      <Badge className="text-xs mt-1 bg-green-500/20 text-green-600 dark:text-green-400">
                                        Verified True
                                      </Badge>
                                    )}
                                    {issue.isOfficial && !issue.isFalselyAccused && (
                                      <Badge variant="default" className="text-xs mt-1">
                                        Official
                                      </Badge>
                                    )}
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {issue.location}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <CategoryBadge category={issue.category} />
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={issue.status} />
                                </TableCell>
                                <TableCell>
                                  {activeTab !== 'deleted' ? (
                                    <Select 
                                      value={issue.priority || ''} 
                                      onValueChange={(v) => handlePriorityChange(issue.id, v as IssuePriority)}
                                    >
                                      <SelectTrigger className="w-24 h-8 text-xs">
                                        <SelectValue placeholder="Set" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                                          <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    issue.priority && <PriorityBadge priority={issue.priority} />
                                  )}
                                </TableCell>
                                {activeTab === 'reported' && (
                                  <TableCell>
                                    <Badge variant="destructive" className="text-xs">
                                      {issue.reportCount} reports
                                    </Badge>
                                  </TableCell>
                                )}
                                <TableCell>
                                  <div className="flex items-center gap-1 text-sm">
                                    <span className="text-green-500">↑{issue.upvotes}</span>
                                    <span className="text-red-500">↓{issue.downvotes}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => navigate(`/issue/${issue.id}`)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {activeTab === 'deleted' ? (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRestoreIssue(issue.id)}
                                          className="text-muted-foreground hover:text-foreground"
                                          title="Restore (rightly reported - keep in deleted later)"
                                        >
                                          <RotateCcw className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleMarkFalselyAccused(issue.id)}
                                          className="text-green-500 hover:text-green-600"
                                          title="Mark as Falsely Accused (restore with verification)"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                      </>
                                    ) : activeTab === 'falsely_accused' ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedIssue(issue);
                                          setShowStatusModal(true);
                                        }}
                                      >
                                        <RefreshCw className="h-4 w-4" />
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedIssue(issue);
                                          setShowStatusModal(true);
                                        }}
                                      >
                                        <RefreshCw className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                {/* Top Categories */}
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Top Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {stats.topCategories.map((cat) => (
                      <div key={cat.category} className="flex justify-between items-center">
                        <span className="text-sm">{CATEGORY_LABELS[cat.category]}</span>
                        <Badge variant="secondary">{cat.count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Hotspot Locations */}
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Hotspot Locations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {stats.hotspotLocations.map((loc) => (
                      <div key={loc.location} className="flex justify-between items-center">
                        <span className="text-sm truncate">{loc.location}</span>
                        <Badge variant="outline">{loc.count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Moderation Stats */}
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Moderation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Reported</span>
                      <Badge variant="destructive">{stats.reported}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Deleted</span>
                      <Badge variant="secondary">{stats.deleted}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Appeals Tab Content */}
          <TabsContent value="appeals">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Account Appeals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAppeals ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : appeals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No account appeals to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appeals.map((appeal) => (
                      <Card key={appeal.id} className={`border ${appeal.status === 'pending' ? 'border-orange-500/50 bg-orange-500/5' : appeal.status === 'approved' ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${appeal.status === 'pending' ? 'bg-orange-500/20' : appeal.status === 'approved' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                  <UserX className={`h-5 w-5 ${appeal.status === 'pending' ? 'text-orange-500' : appeal.status === 'approved' ? 'text-green-500' : 'text-red-500'}`} />
                                </div>
                                <div>
                                  <p className="font-medium">{appeal.userNickname}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {appeal.userEmail || 'No email provided'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Submitted {formatDistanceToNow(appeal.createdAt, { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={appeal.status === 'pending' ? 'outline' : appeal.status === 'approved' ? 'default' : 'destructive'}>
                                {appeal.status.charAt(0).toUpperCase() + appeal.status.slice(1)}
                              </Badge>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm font-medium mb-1">Appeal Reason:</p>
                              <p className="text-sm text-muted-foreground">{appeal.reason}</p>
                            </div>

                            {appeal.status === 'pending' && (
                              <div className="flex flex-col gap-3">
                                <div className="space-y-2">
                                  <Textarea
                                    placeholder="Rejection reason (required for rejection)..."
                                    value={rejectionReasons[appeal.id] || ''}
                                    onChange={(e) => setRejectionReasons(prev => ({ ...prev, [appeal.id]: e.target.value }))}
                                    rows={2}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleApproveAppeal(appeal)}
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Approve & Reinstate
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleRejectAppeal(appeal, rejectionReasons[appeal.id] || '')}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            )}

                            {appeal.status === 'rejected' && appeal.rejectionReason && (
                              <div className="bg-red-500/10 rounded-lg p-3">
                                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Rejection Reason:</p>
                                <p className="text-sm text-muted-foreground">{appeal.rejectionReason}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Status Change Modal */}
      {selectedIssue && (
        <StatusChangeModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedIssue(null);
          }}
          currentStatus={selectedIssue.status}
          issueTitle={selectedIssue.title}
          onConfirm={handleStatusChange}
        />
      )}
    </div>
  );
}
