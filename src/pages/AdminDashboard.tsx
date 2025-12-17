import { useState, useMemo } from 'react';
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
import { CATEGORY_LABELS, STATUS_LABELS, PRIORITY_LABELS, DEPARTMENT_LABELS, IssueStatus, Issue, IssuePriority, Department } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
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
  Bell
} from 'lucide-react';
import campusAssistLogo from '@/assets/campus-assist-logo.png';
import { DepartmentSelect } from '@/components/DepartmentSelect';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { issues, stats, updateStatus, addComment, setIssuePriority, assignDepartment, notifications } = useIssues();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const unreadNotifications = notifications.filter(n => n.userId === user?.id && !n.isRead).length;

  const reportedIssues = useMemo(() => issues.filter(i => i.isReported), [issues]);

  const filteredIssues = useMemo(() => {
    let filtered = activeTab === 'reported' 
      ? reportedIssues 
      : issues.filter(i => !i.isReported);

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
  }, [issues, reportedIssues, activeTab, searchQuery, statusFilter, categoryFilter, priorityFilter, sortBy]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStatusChange = (newStatus: IssueStatus, note: string) => {
    if (!selectedIssue || !user) return;
    updateStatus(selectedIssue.id, newStatus, note, user.id, user.nickname || 'Admin');
    addComment(selectedIssue.id, {
      issueId: selectedIssue.id,
      authorNickname: user.nickname || 'Administration',
      authorId: user.id,
      content: `Status updated to ${STATUS_LABELS[newStatus]}: ${note}`,
      isAdminResponse: true,
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
                <img src={campusAssistLogo} alt="CampusVoice" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Faculty Dashboard</h1>
                <p className="text-xs text-muted-foreground">CampusVoice Management</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                <Users className="h-4 w-4 text-secondary-foreground" />
                <span className="text-sm font-medium text-secondary-foreground">{user?.nickname || 'Admin'}</span>
              </div>
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
                      Issues with 10+ community reports require moderation
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
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Table */}
              <div className="lg:col-span-3">
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex flex-col gap-4">
                      <CardTitle>{activeTab === 'reported' ? 'Reported Issues' : 'All Issues'}</CardTitle>
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
                            <TableHead>Department</TableHead>
                            <TableHead>Votes</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredIssues.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                No issues found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredIssues.map((issue) => (
                              <TableRow key={issue.id} className={issue.isReported ? 'bg-red-500/5' : ''}>
                                <TableCell>
                                  <div className="max-w-[180px]">
                                    <div className="flex items-center gap-2">
                                      {issue.isReported && <Flag className="h-3 w-3 text-red-500 flex-shrink-0" />}
                                      <p className="font-medium truncate">{issue.title}</p>
                                    </div>
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
                                </TableCell>
                                <TableCell>
                                  <DepartmentSelect 
                                    value={issue.assignedDepartment || ''} 
                                    customValue={issue.customDepartment}
                                    onValueChange={(dept, custom) => handleDepartmentAssign(issue.id, dept, custom)}
                                    className="w-28"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {issue.upvotes - issue.downvotes}
                                  </Badge>
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

              {/* Sidebar Analytics */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Top Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.topCategories.map((cat) => (
                        <div key={cat.category} className="flex justify-between items-center">
                          <span className="text-sm">{CATEGORY_LABELS[cat.category] || cat.category}</span>
                          <Badge variant="secondary">{cat.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-orange-500" />
                      Hotspot Locations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.hotspotLocations.map((loc) => (
                        <div key={loc.location} className="flex justify-between items-center">
                          <span className="text-sm truncate max-w-[120px]">{loc.location}</span>
                          <Badge variant="secondary">{loc.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/stats')}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Public Stats
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/profile')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      My Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
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
          onConfirm={handleStatusChange}
          currentStatus={selectedIssue.status}
          issueTitle={selectedIssue.title}
        />
      )}
    </div>
  );
}
