import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssuesContext';
import { IssueCard } from '@/components/IssueCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogoutWarningModal } from '@/components/LogoutWarningModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CATEGORY_LABELS, IssueCategory, IssueStatus, STATUS_LABELS } from '@/types';
import { 
  Plus, 
  LogOut, 
  Search, 
  Flame, 
  Clock, 
  TrendingUp,
  CheckCircle,
  BarChart3,
  User,
  Bell,
  BookOpen,
  Zap,
  Sparkles,
  Flag,
  Shield
} from 'lucide-react';
import campusVoiceLogo from '@/assets/campusvoice-logo.png';

type SortOption = 'hot' | 'new';

export default function StudentFeed() {
  const { user, logout } = useAuth();
  const { issues, stats, notifications } = useIssues();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  const unreadNotifications = notifications.filter(n => n.userId === user?.id && !n.isRead).length;

  // Get reported issues that the user has reported
  const userReportedIssues = useMemo(() => {
    if (!user) return [];
    return issues.filter(i => i.reports.some(r => r.reporterId === user.id));
  }, [issues, user]);

  // All reported issues (any with reportCount > 0)
  const allReportedIssues = useMemo(() => {
    return issues.filter(i => (i.reportCount > 0 || i.isReported) && !i.isDeleted);
  }, [issues]);

  // All official issues (from faculty)
  const officialIssues = useMemo(() => {
    return issues.filter(i => i.isOfficial && !i.isDeleted && !i.isReported);
  }, [issues]);

  const filteredAndSortedIssues = useMemo(() => {
    // Only show non-reported, non-deleted issues in main feed
    let filtered = issues.filter(i => !i.isReported && !i.isDeleted);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          issue.description.toLowerCase().includes(query) ||
          issue.location.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((issue) => issue.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((issue) => issue.status === statusFilter);
    }

    // Sort with official posts (< 24h old) at top
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    if (sortBy === 'hot') {
      return [...filtered].sort((a, b) => {
        // Official posts from last 24h always on top
        const aIsRecentOfficial = a.isOfficial && a.createdAt.getTime() > twentyFourHoursAgo;
        const bIsRecentOfficial = b.isOfficial && b.createdAt.getTime() > twentyFourHoursAgo;
        
        if (aIsRecentOfficial && !bIsRecentOfficial) return -1;
        if (!aIsRecentOfficial && bIsRecentOfficial) return 1;
        
        const scoreA = (a.upvotes - a.downvotes) / Math.pow((Date.now() - a.createdAt.getTime()) / 3600000 + 2, 1.5);
        const scoreB = (b.upvotes - b.downvotes) / Math.pow((Date.now() - b.createdAt.getTime()) / 3600000 + 2, 1.5);
        return scoreB - scoreA;
      });
    }
    return [...filtered].sort((a, b) => {
      // Official posts from last 24h always on top
      const aIsRecentOfficial = a.isOfficial && a.createdAt.getTime() > twentyFourHoursAgo;
      const bIsRecentOfficial = b.isOfficial && b.createdAt.getTime() > twentyFourHoursAgo;
      
      if (aIsRecentOfficial && !bIsRecentOfficial) return -1;
      if (!aIsRecentOfficial && bIsRecentOfficial) return 1;
      
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [issues, sortBy, categoryFilter, statusFilter, searchQuery]);

  const handleLogoutClick = () => {
    if (user?.role === 'student') {
      setShowLogoutWarning(true);
    } else {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const statCards = [
    { label: 'Total Issues', value: stats.totalIssues, icon: BarChart3, color: 'text-foreground', status: 'all' as const },
    { label: 'Under Review', value: stats.underReview, icon: Clock, color: 'text-blue-500', status: 'under_review' as IssueStatus },
    { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'text-orange-500', status: 'in_progress' as IssueStatus },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-500', status: 'resolved' as IssueStatus },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex-shrink-0">
                <img src={campusVoiceLogo} alt="CampusVoice" className="w-full h-full object-contain p-0.5 sm:p-1" />
              </div>
              <div className="min-w-0 hidden xs:block sm:block">
                <h1 className="text-sm sm:text-lg font-bold truncate">CampusVoice</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Anonymous Issue Reporting</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
                className="relative h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/stats')}
                className="hidden sm:flex h-9"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Stats
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-muted h-8 sm:h-9"
              >
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium max-w-[60px] sm:max-w-none truncate">{user?.nickname}</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogoutClick} className="h-8 w-8 sm:h-9 sm:w-9">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Warning Modal */}
      <LogoutWarningModal
        isOpen={showLogoutWarning}
        onClose={() => setShowLogoutWarning(false)}
        onConfirm={handleLogout}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Interactive Stats Cards */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Quick Stats
                </h3>
                <div className="space-y-2">
                  {statCards.map((stat) => (
                    <button
                      key={stat.label}
                      onClick={() => {
                        setActiveTab('feed');
                        setStatusFilter(stat.status);
                      }}
                      className={`w-full flex justify-between items-center p-2 rounded-lg transition-all hover:bg-muted ${
                        statusFilter === stat.status && activeTab === 'feed' ? 'bg-muted ring-2 ring-primary' : ''
                      }`}
                    >
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        {stat.label}
                      </span>
                      <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full gradient-primary" 
              onClick={() => navigate('/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Report Issue
            </Button>

            {/* Sidebar Apps */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Campus Apps
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                    CampusAssist
                    <span className="ml-auto text-xs text-muted-foreground">Soon</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => window.open('https://notehall.vercel.app/', '_blank')}
                  >
                    <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                    NoteHall
                    <span className="ml-auto text-xs text-muted-foreground">Live</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                    CampusBuzz
                    <span className="ml-auto text-xs text-muted-foreground">Soon</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs for Feed and Reported */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="feed" className="text-xs sm:text-sm px-2 sm:px-3">All Issues</TabsTrigger>
                <TabsTrigger value="official" className="relative text-xs sm:text-sm px-2 sm:px-3">
                  <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Official</span>
                  <span className="sm:hidden">Off.</span>
                  {officialIssues.length > 0 && (
                    <Badge variant="secondary" className="ml-1 sm:ml-2 h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
                      {officialIssues.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reported" className="relative text-xs sm:text-sm px-2 sm:px-3">
                  <Flag className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Reported</span>
                  <span className="sm:hidden">Rep.</span>
                  {allReportedIssues.length > 0 && (
                    <Badge variant="destructive" className="ml-1 sm:ml-2 h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
                      {allReportedIssues.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed">
                {/* Filters */}
                <Card className="glass-card mb-4">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search issues..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="w-full xs:w-auto xs:min-w-[120px] sm:w-36 text-xs sm:text-sm h-9">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full xs:w-auto xs:min-w-[100px] sm:w-36 text-xs sm:text-sm h-9">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {Object.entries(STATUS_LABELS).filter(([key]) => key !== 'deleted').map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex rounded-lg bg-muted p-1 ml-auto">
                          <button
                            onClick={() => setSortBy('hot')}
                            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                              sortBy === 'hot' ? 'bg-card shadow-sm' : 'text-muted-foreground'
                            }`}
                          >
                            <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Hot</span>
                          </button>
                          <button
                            onClick={() => setSortBy('new')}
                            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                              sortBy === 'new' ? 'bg-card shadow-sm' : 'text-muted-foreground'
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">New</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Issues List */}
                <div className="space-y-4">
                  {filteredAndSortedIssues.length === 0 ? (
                    <Card className="glass-card">
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">No issues found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredAndSortedIssues.map((issue, index) => (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <IssueCard issue={issue} />
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="official">
                <Card className="glass-card mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Official announcements and issues posted by faculty members.</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {officialIssues.length === 0 ? (
                    <Card className="glass-card">
                      <CardContent className="p-8 text-center">
                        <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No official announcements</p>
                      </CardContent>
                    </Card>
                  ) : (
                    officialIssues.map((issue, index) => (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="relative">
                          <Badge 
                            variant="default" 
                            className="absolute -top-2 -right-2 z-10 flex items-center gap-1"
                          >
                            <Shield className="h-3 w-3" />
                            Official
                          </Badge>
                          <IssueCard issue={issue} />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reported">
                <Card className="glass-card mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Flag className="h-4 w-4 text-red-500" />
                      <span>Issues flagged by the community for review. Issues with 10+ reports are automatically removed.</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {allReportedIssues.length === 0 ? (
                    <Card className="glass-card">
                      <CardContent className="p-8 text-center">
                        <Flag className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No reported issues</p>
                      </CardContent>
                    </Card>
                  ) : (
                    allReportedIssues.map((issue, index) => (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="relative">
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 z-10"
                          >
                            {issue.reportCount} reports
                          </Badge>
                          <IssueCard issue={issue} />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
