import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssuesContext';
import { IssueCard } from '@/components/IssueCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserProfilePanel } from '@/components/UserProfilePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORY_LABELS, IssueCategory } from '@/types';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Flame, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

type SortOption = 'hot' | 'new';

export default function StudentFeed() {
  const { user } = useAuth();
  const { issues, stats, customCategories } = useIssues();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine default categories with custom ones
  const allCategories = useMemo(() => {
    const categories = { ...CATEGORY_LABELS };
    customCategories.forEach(cat => {
      if (!Object.values(categories).includes(cat)) {
        // Custom categories are stored under 'other' in the Issue
      }
    });
    return categories;
  }, [customCategories]);

  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issues;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          issue.description.toLowerCase().includes(query) ||
          issue.location.toLowerCase().includes(query) ||
          (issue.customCategory && issue.customCategory.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((issue) => {
        if (categoryFilter === 'other') {
          return issue.category === 'other';
        }
        return issue.category === categoryFilter;
      });
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
  }, [issues, sortBy, categoryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-primary-foreground" />
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
                onClick={() => navigate('/stats')}
                className="hidden sm:flex"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Stats
              </Button>
              <ThemeToggle />
              <UserProfilePanel />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Stats */}
          <aside className="lg:col-span-1 space-y-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Issues</span>
                    <span className="font-semibold">{stats.totalIssues}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-warning" />
                      Escalated
                    </span>
                    <span className="font-semibold text-warning">{stats.escalated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-success" />
                      Resolved
                    </span>
                    <span className="font-semibold text-success">{stats.resolved}</span>
                  </div>
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
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.entries(allCategories).map(([key, label]) => (
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
