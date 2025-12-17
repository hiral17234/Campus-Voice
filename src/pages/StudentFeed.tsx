import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssuesContext';
import { IssueCard } from '@/components/IssueCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
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
  Sparkles
} from 'lucide-react';
import campusAssistLogo from '@/assets/campus-assist-logo.png';

type SortOption = 'hot' | 'new';

export default function StudentFeed() {
  const { user, logout } = useAuth();
  const { issues, stats, notifications } = useIssues();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const unreadNotifications = notifications.filter(n => n.userId === user?.id && !n.isRead).length;

  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issues.filter(i => !i.isReported); // Hide reported issues from main feed

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

    // Sort
    if (sortBy === 'hot') {
      return [...filtered].sort((a, b) => {
        const scoreA = (a.upvotes - a.downvotes) / Math.pow((Date.now() - a.createdAt.getTime()) / 3600000 + 2, 1.5);
        const scoreB = (b.upvotes - b.downvotes) / Math.pow((Date.now() - b.createdAt.getTime()) / 3600000 + 2, 1.5);
        return scoreB - scoreA;
      });
    }
    return [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [issues, sortBy, categoryFilter, statusFilter, searchQuery]);

  const handleLogout = () => {
    logout();
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
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src={campusAssistLogo} alt="CampusVoice" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-bold">CampusVoice</h1>
                <p className="text-xs text-muted-foreground">Anonymous Issue Reporting</p>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/stats')}
                className="hidden sm:flex"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Stats
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user?.nickname}</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                      onClick={() => setStatusFilter(stat.status)}
                      className={`w-full flex justify-between items-center p-2 rounded-lg transition-all hover:bg-muted ${
                        statusFilter === stat.status ? 'bg-muted ring-2 ring-primary' : ''
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
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                    NoteHall
                    <span className="ml-auto text-xs text-muted-foreground">Soon</span>
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
            {/* Filters */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search issues..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-36">
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
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex rounded-lg bg-muted p-1">
                      <button
                        onClick={() => setSortBy('hot')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          sortBy === 'hot' ? 'bg-card shadow-sm' : 'text-muted-foreground'
                        }`}
                      >
                        <Flame className="h-4 w-4" />
                        Hot
                      </button>
                      <button
                        onClick={() => setSortBy('new')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          sortBy === 'new' ? 'bg-card shadow-sm' : 'text-muted-foreground'
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                        New
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
          </div>
        </div>
      </main>
    </div>
  );
}
