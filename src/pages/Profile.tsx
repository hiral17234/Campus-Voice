import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssuesContext';
import { StatusBadge } from '@/components/StatusBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Flag,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Image,
  FileVideo,
  Shield,
  TrendingUp
} from 'lucide-react';
import campusVoiceLogo from '@/assets/campusvoice-logo.png';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { issues, comments, getUserActivity } = useIssues();
  const [activeTab, setActiveTab] = useState('overview');

  const activity = useMemo(() => {
    if (!user) return { 
      issuesPosted: [], 
      issuesUpvoted: [], 
      issuesDownvoted: [], 
      issuesCommented: [], 
      issuesReported: [],
      totalUpvotesReceived: 0,
      totalDownvotesReceived: 0,
      totalCommentsReceived: 0,
    };
    return getUserActivity(user.id);
  }, [user, getUserActivity]);

  const userIssues = useMemo(() => {
    if (!user) return [];
    return issues.filter(i => i.authorId === user.id);
  }, [issues, user]);

  const upvotedIssues = useMemo(() => {
    return issues.filter(i => activity.issuesUpvoted.includes(i.id));
  }, [issues, activity]);

  const downvotedIssues = useMemo(() => {
    return issues.filter(i => activity.issuesDownvoted.includes(i.id));
  }, [issues, activity]);

  const commentedIssues = useMemo(() => {
    return issues.filter(i => activity.issuesCommented.includes(i.id));
  }, [issues, activity]);

  const reportedIssues = useMemo(() => {
    return issues.filter(i => activity.issuesReported.includes(i.id));
  }, [issues, activity]);

  const userMedia = useMemo(() => {
    const media: { issueId: string; issueTitle: string; url: string; type: string }[] = [];
    userIssues.forEach(issue => {
      issue.mediaUrls.forEach((url, idx) => {
        media.push({
          issueId: issue.id,
          issueTitle: issue.title,
          url,
          type: issue.mediaTypes[idx] || 'image'
        });
      });
    });
    return media;
  }, [userIssues]);

  const statusStats = useMemo(() => {
    const stats = {
      total: userIssues.length,
      pending: userIssues.filter(i => i.status === 'pending').length,
      underReview: userIssues.filter(i => i.status === 'under_review').length,
      approved: userIssues.filter(i => i.status === 'approved').length,
      inProgress: userIssues.filter(i => i.status === 'in_progress').length,
      resolved: userIssues.filter(i => i.status === 'resolved').length,
      rejected: userIssues.filter(i => i.status === 'rejected').length,
    };
    return stats;
  }, [userIssues]);

  const resolvedPercentage = statusStats.total > 0 
    ? Math.round((statusStats.resolved / statusStats.total) * 100) 
    : 0;

  if (!user) {
    return null;
  }

  const IssueListItem = ({ issue, showStatus = true }: { issue: typeof issues[0]; showStatus?: boolean }) => (
    <div 
      className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
      onClick={() => navigate(`/issue/${issue.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{issue.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <CategoryBadge category={issue.category} className="text-xs" />
            {showStatus && <StatusBadge status={issue.status} className="text-xs" />}
          </div>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src={campusVoiceLogo} alt="CampusVoice" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold">My Profile</h1>
                <p className="text-xs text-muted-foreground">Activity & Statistics</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{user.nickname}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? (
                        <><Shield className="h-3 w-3 mr-1" /> Faculty</>
                      ) : 'Student'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Anonymous Identity
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <FileText className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold">{statusStats.total}</p>
                  <p className="text-xs text-muted-foreground">Issues Posted</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-green-500">{statusStats.resolved}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                    <Clock className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-orange-500">{statusStats.pending + statusStats.underReview}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-red-500">{statusStats.rejected}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-4">
                <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                    <ThumbsUp className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold text-green-500">{activity.totalUpvotesReceived}</p>
                  <p className="text-xs text-muted-foreground">Upvotes Received</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                    <ThumbsDown className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold text-red-500">{activity.totalDownvotesReceived}</p>
                  <p className="text-xs text-muted-foreground">Downvotes Received</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold text-blue-500">{activity.totalCommentsReceived}</p>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold text-purple-500">{activity.issuesUpvoted.length}</p>
                  <p className="text-xs text-muted-foreground">Issues Upvoted</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                    <Flag className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold text-orange-500">{activity.issuesReported.length}</p>
                  <p className="text-xs text-muted-foreground">Issues Reported</p>
                </div>
              </div>

              {/* Resolution Progress */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Resolution Rate</span>
                  <span className="text-sm font-medium">{resolvedPercentage}%</span>
                </div>
                <Progress value={resolvedPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                <FileText className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">My Issues</span>
              </TabsTrigger>
              <TabsTrigger value="upvoted" className="text-xs sm:text-sm">
                <ThumbsUp className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Upvoted</span>
              </TabsTrigger>
              <TabsTrigger value="downvoted" className="text-xs sm:text-sm">
                <ThumbsDown className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Downvoted</span>
              </TabsTrigger>
              <TabsTrigger value="commented" className="text-xs sm:text-sm">
                <MessageSquare className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Commented</span>
              </TabsTrigger>
              <TabsTrigger value="reported" className="text-xs sm:text-sm">
                <Flag className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Reported</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="text-xs sm:text-sm">
                <Image className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Media</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    My Issues ({userIssues.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {userIssues.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>You haven't posted any issues yet</p>
                      <Button variant="link" onClick={() => navigate('/create')}>
                        Report your first issue
                      </Button>
                    </div>
                  ) : (
                    userIssues.map(issue => (
                      <IssueListItem key={issue.id} issue={issue} />
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upvoted" className="mt-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                    Upvoted Issues ({upvotedIssues.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {upvotedIssues.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No upvoted issues
                    </p>
                  ) : (
                    upvotedIssues.map(issue => (
                      <IssueListItem key={issue.id} issue={issue} />
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="downvoted" className="mt-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ThumbsDown className="h-5 w-5 text-red-500" />
                    Downvoted Issues ({downvotedIssues.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {downvotedIssues.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No downvoted issues
                    </p>
                  ) : (
                    downvotedIssues.map(issue => (
                      <IssueListItem key={issue.id} issue={issue} />
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="commented" className="mt-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Commented Issues ({commentedIssues.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {commentedIssues.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No commented issues
                    </p>
                  ) : (
                    commentedIssues.map(issue => (
                      <IssueListItem key={issue.id} issue={issue} />
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reported" className="mt-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flag className="h-5 w-5 text-orange-500" />
                    Reported Issues ({reportedIssues.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {reportedIssues.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No reported issues
                    </p>
                  ) : (
                    reportedIssues.map(issue => (
                      <IssueListItem key={issue.id} issue={issue} />
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="mt-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Image className="h-5 w-5 text-purple-500" />
                    Shared Media ({userMedia.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userMedia.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No media shared yet
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {userMedia.map((media, idx) => (
                        <div 
                          key={idx}
                          className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => navigate(`/issue/${media.issueId}`)}
                        >
                          {media.type === 'video' ? (
                            <FileVideo className="h-8 w-8 text-muted-foreground" />
                          ) : (
                            <Image className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
