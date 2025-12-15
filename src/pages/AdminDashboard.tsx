import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssuesContext';
import { StatusBadge } from '@/components/StatusBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CATEGORY_LABELS, STATUS_LABELS, IssueStatus, Issue } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  LogOut,
  Search,
  Filter,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Users,
  MapPin,
  Eye,
  MessageSquare,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { issues, stats, updateStatus, addComment } = useIssues();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [newStatus, setNewStatus] = useState<IssueStatus | ''>('');

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpdateStatus = () => {
    if (!selectedIssue || !newStatus) return;
    updateStatus(selectedIssue.id, newStatus, adminNote, user?.id);
    if (adminNote) {
      addComment(selectedIssue.id, {
        issueId: selectedIssue.id,
        authorNickname: 'Administration',
        authorId: user?.id || '',
        content: adminNote,
        isAdminResponse: true,
      });
    }
    toast.success('Issue status updated');
    setSelectedIssue(null);
    setAdminNote('');
    setNewStatus('');
  };

  const statCards = [
    { label: 'Total Issues', value: stats.totalIssues, icon: BarChart3, color: 'text-foreground' },
    { label: 'Under Review', value: stats.underReview, icon: Clock, color: 'text-warning' },
    { label: 'Escalated', value: stats.escalated, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-success' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">CampusVoice Management</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                <Users className="h-4 w-4 text-secondary-foreground" />
                <span className="text-sm font-medium text-secondary-foreground">Admin</span>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color} opacity-50`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Table */}
          <div className="lg:col-span-3">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <CardTitle>All Issues</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-48"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-36">
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
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
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
                        <TableHead>Votes</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIssues.map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell>
                            <div className="max-w-[200px]">
                              <p className="font-medium truncate">{issue.title}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {issue.location}
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
                            <div className="flex items-center gap-1">
                              <ChevronUp className="h-4 w-4 text-success" />
                              <span className="text-sm">{issue.upvotes - issue.downvotes}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
                            </span>
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
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedIssue(issue);
                                      setNewStatus(issue.status);
                                    }}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Update Issue Status</DialogTitle>
                                    <DialogDescription>
                                      Update the status and add an official response.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>New Status</Label>
                                      <Select value={newStatus} onValueChange={(v) => setNewStatus(v as IssueStatus)}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Admin Note / Response (Optional)</Label>
                                      <Textarea
                                        placeholder="Add official response..."
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                      />
                                    </div>
                                    <Button onClick={handleUpdateStatus} className="w-full gradient-primary">
                                      Update Status
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
                      <span className="text-sm">{CATEGORY_LABELS[cat.category]}</span>
                      <span className="text-sm font-medium">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  Hotspot Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.hotspotLocations.map((loc) => (
                    <div key={loc.location} className="flex justify-between items-center">
                      <span className="text-sm truncate max-w-[150px]">{loc.location}</span>
                      <span className="text-sm font-medium">{loc.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
