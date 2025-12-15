import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssuesContext';
import { StatusBadge } from '@/components/StatusBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { VoteButtons } from '@/components/VoteButtons';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { STATUS_LABELS } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Megaphone, 
  MapPin, 
  Clock, 
  User, 
  MessageSquare, 
  Send,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getIssueById, vote, comments, addComment } = useIssues();
  const [newComment, setNewComment] = useState('');

  const issue = getIssueById(id!);
  const issueComments = comments[id!] || [];

  if (!issue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-card p-8 text-center">
          <p className="text-muted-foreground mb-4">Issue not found</p>
          <Button onClick={() => navigate('/feed')}>Back to Feed</Button>
        </Card>
      </div>
    );
  }

  const handleVote = (type: 'up' | 'down') => {
    if (user) {
      vote(issue.id, user.id, type);
    }
  };

  const handleComment = () => {
    if (!newComment.trim() || !user) return;
    
    addComment(issue.id, {
      issueId: issue.id,
      authorNickname: user.nickname!,
      authorId: user.id,
      content: newComment.trim(),
    });
    
    setNewComment('');
    toast.success('Comment added');
  };

  const userVote = user ? issue.votedUsers[user.id] : null;

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
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Issue Details</h1>
                <p className="text-xs text-muted-foreground">View and discuss</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Vote Column */}
                    <div className="flex flex-col items-center">
                      <VoteButtons
                        upvotes={issue.upvotes}
                        downvotes={issue.downvotes}
                        userVote={userVote}
                        onVote={handleVote}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <CategoryBadge category={issue.category} />
                        <StatusBadge status={issue.status} />
                        {issue.isUrgent && (
                          <span className="flex items-center gap-1 text-xs text-destructive font-medium bg-destructive/10 px-2 py-1 rounded-full">
                            <AlertTriangle className="h-3 w-3" />
                            Urgent
                          </span>
                        )}
                      </div>

                      <h1 className="text-2xl font-bold mb-3">{issue.title}</h1>
                      <p className="text-muted-foreground whitespace-pre-wrap mb-4">{issue.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {issue.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {issue.authorNickname}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments ({issue.commentCount})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      onClick={handleComment} 
                      disabled={!newComment.trim()}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator />

                  {/* Comments List */}
                  {issueComments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {issueComments.map((comment) => (
                        <div key={comment.id} className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">{comment.authorNickname}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                            </span>
                            {comment.isAdminResponse && (
                              <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                                Institute Response
                              </span>
                            )}
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Timeline */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Action Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {issue.timeline.map((event, index) => (
                      <div key={event.id} className="flex gap-3 pb-4 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            event.status === 'resolved' ? 'bg-success' :
                            event.status === 'escalated' ? 'bg-destructive' :
                            event.status === 'under_review' ? 'bg-warning' :
                            'bg-primary'
                          }`} />
                          {index < issue.timeline.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="font-medium text-sm">{STATUS_LABELS[event.status]}</p>
                          {event.note && (
                            <p className="text-xs text-muted-foreground mt-0.5">{event.note}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(event.timestamp, 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
