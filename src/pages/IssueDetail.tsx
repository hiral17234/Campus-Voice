import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssuesContext';
import { StatusBadge } from '@/components/StatusBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { VoteButtons } from '@/components/VoteButtons';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ReportModal } from '@/components/ReportModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { MediaGallery } from '@/components/MediaGallery';
import { ReportsDetailView } from '@/components/ReportsDetailView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STATUS_LABELS, DEPARTMENT_LABELS, ReportReason } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  MessageSquare, 
  Send,
  AlertTriangle,
  Flag,
  Shield,
  Trash2,
  Info,
  Building2,
  Image,
  FileWarning,
  Reply,
  X
} from 'lucide-react';
import campusVoiceLogo from '@/assets/campusvoice-logo.png';

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getIssueById, vote, comments, addComment, reportIssue, reportComment, deleteIssue } = useIssues();
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVoteInfo, setShowVoteInfo] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; nickname: string } | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const issue = getIssueById(id!);
  const issueComments = comments[id!] || [];

  // Group comments: top-level + replies nested under parent
  const groupedComments = useMemo(() => {
    const topLevel = issueComments.filter((c: any) => !c.parentId);
    const replies = issueComments.filter((c: any) => c.parentId);
    const replyMap: Record<string, typeof issueComments> = {};
    replies.forEach((r: any) => {
      const pid = r.parentId as string;
      if (!replyMap[pid]) replyMap[pid] = [];
      replyMap[pid].push(r);
    });
    // Sort replies chronologically
    Object.values(replyMap).forEach(arr => arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    return { topLevel, replyMap };
  }, [issueComments]);

  if (!issue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <FileWarning className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
            <h2 className="text-xl font-semibold mb-2">Issue Not Found</h2>
            <p className="text-muted-foreground text-sm mb-6">
              This issue may have been deleted or doesn't exist.
            </p>
            <Button onClick={() => navigate('/feed')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Feed
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleVote = async (type: 'up' | 'down') => {
    if (user) {
      try {
        await vote(issue.id, user.id, type);
      } catch (error: any) {
        console.error('Vote error:', error);
        toast.error(error.message || 'Failed to vote');
      }
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !user) return;
    
    try {
      const commentData: any = {
        issueId: issue.id,
        authorNickname: user.nickname!,
        authorId: user.id,
        content: newComment.trim(),
        isAdminResponse: user.role === 'admin',
      };

      if (replyingTo) {
        // If replying to a reply, attach to original parent (1 level only)
        const parentComment = issueComments.find((c: any) => c.id === replyingTo.id);
        commentData.parentId = (parentComment as any)?.parentId || replyingTo.id;
        commentData.replyToNickname = replyingTo.nickname;
      }

      await addComment(issue.id, commentData);
      
      setNewComment('');
      setReplyingTo(null);
      toast.success('Comment added');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error(error.message || 'Failed to add comment');
    }
  };

  const handleReply = (commentId: string, nickname: string) => {
    setReplyingTo({ id: commentId, nickname });
    commentInputRef.current?.focus();
  };

  const handleReportIssue = async (reason: ReportReason, customReason?: string) => {
    if (user) {
      try {
        await reportIssue(issue.id, user.id, reason, customReason);
        toast.success('Issue reported successfully');
      } catch (error: any) {
        console.error('Report error:', error);
        toast.error(error.message || 'Failed to report issue');
      }
    }
  };

  const handleReportComment = (reason: ReportReason, customReason?: string) => {
    if (user && reportingCommentId) {
      reportComment(issue.id, reportingCommentId, user.id, reason, customReason);
      setReportingCommentId(null);
    }
  };

  const handleDelete = async () => {
    if (user) {
      const success = await deleteIssue(issue.id, user.id);
      if (success) {
        toast.success('Issue deleted successfully');
        navigate('/feed');
      } else {
        toast.error('Cannot delete this issue');
      }
    }
    setShowDeleteModal(false);
  };

  const userVote = user ? issue.votedUsers[user.id] : null;
  const canDelete = user && issue.authorId === user.id && issue.status === 'pending';
  const hasUserReported = user && issue.reports.some(r => r.reporterId === user.id);
  const isFaculty = user?.role === 'admin';

  const getTimelineColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'in_progress': return 'bg-orange-500';
      case 'approved': return 'bg-purple-500';
      case 'under_review': return 'bg-blue-500';
      default: return 'bg-muted-foreground';
    }
  };

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
                <img src={campusVoiceLogo} alt="CampusVoice" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Issue Details</h1>
                <p className="text-xs text-muted-foreground">View and discuss</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!hasUserReported && user && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowReportModal(true)}
                  className="text-muted-foreground hover:text-red-500"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <ThemeToggle />
            </div>
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
              <Card className={`glass-card ${issue.isReported ? 'border-red-500 border-2' : ''}`}>
                {issue.isReported && (
                  <div className="bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 text-sm flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    This issue has been reported multiple times
                  </div>
                )}
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 text-muted-foreground"
                            onClick={() => setShowVoteInfo(!showVoteInfo)}
                          >
                            <Info className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <p className="text-green-500">↑ {issue.upvotes} upvotes</p>
                            <p className="text-red-500">↓ {issue.downvotes} downvotes</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
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
                        {issue.priority && <PriorityBadge priority={issue.priority} />}
                        {issue.assignedDepartment && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {DEPARTMENT_LABELS[issue.assignedDepartment] || issue.customDepartment}
                          </Badge>
                        )}
                      </div>

                      <h1 className="text-2xl font-bold mb-3">{issue.title}</h1>
                      <p className="text-muted-foreground whitespace-pre-wrap mb-4">{issue.description}</p>

                      {/* Media Gallery */}
                      {issue.mediaUrls && issue.mediaUrls.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Attachments ({issue.mediaUrls.length})
                          </p>
                          <MediaGallery 
                            mediaUrls={issue.mediaUrls} 
                            mediaTypes={issue.mediaTypes} 
                          />
                        </div>
                      )}

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
                    Comments ({issueComments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Reply indicator */}
                  {replyingTo && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/80 text-sm">
                      <Reply className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Replying to</span>
                      <span className="font-medium">@{replyingTo.nickname}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-auto text-muted-foreground hover:text-foreground"
                        onClick={() => setReplyingTo(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <Textarea
                      ref={commentInputRef}
                      placeholder={replyingTo ? `Reply to @${replyingTo.nickname}...` : "Add a comment..."}
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
                      {groupedComments.topLevel.map((comment) => {
                        const hasReportedComment = user && comment.reports?.some(r => r.reporterId === user.id);
                        const replies = groupedComments.replyMap[comment.id] || [];
                        return (
                          <div key={comment.id}>
                            {/* Parent comment */}
                            <div className={`p-4 rounded-lg ${comment.isAdminResponse ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm">{comment.authorNickname}</span>
                                  {comment.isAdminResponse && (
                                    <Badge variant="default" className="text-xs flex items-center gap-1">
                                      <Shield className="h-3 w-3" />
                                      Official Response
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {comment.isAdminResponse ? 'Faculty' : 'Student'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {user && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                                      onClick={() => handleReply(comment.id, comment.authorNickname)}
                                    >
                                      <Reply className="h-3 w-3" />
                                      Reply
                                    </Button>
                                  )}
                                  {!hasReportedComment && user && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                      onClick={() => setReportingCommentId(comment.id)}
                                    >
                                      <Flag className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>

                            {/* Nested replies */}
                            {replies.length > 0 && (
                              <div className="ml-6 mt-2 space-y-2 border-l-2 border-border pl-4">
                                {replies.map((reply) => {
                                  const hasReportedReply = user && reply.reports?.some(r => r.reporterId === user.id);
                                  return (
                                    <div key={reply.id} className={`p-3 rounded-lg ${reply.isAdminResponse ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}>
                                      <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-medium text-sm">{reply.authorNickname}</span>
                                          {reply.isAdminResponse && (
                                            <Badge variant="default" className="text-xs flex items-center gap-1">
                                              <Shield className="h-3 w-3" />
                                              Official
                                            </Badge>
                                          )}
                                          <Badge variant="outline" className="text-xs">
                                            {reply.isAdminResponse ? 'Faculty' : 'Student'}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {user && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                                              onClick={() => handleReply(reply.id, reply.authorNickname)}
                                            >
                                              <Reply className="h-3 w-3" />
                                            </Button>
                                          )}
                                          {!hasReportedReply && user && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                              onClick={() => setReportingCommentId(reply.id)}
                                            >
                                              <Flag className="h-3 w-3" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-sm">
                                        {(reply as any).replyToNickname && (
                                          <span className="text-primary font-medium">@{(reply as any).replyToNickname} </span>
                                        )}
                                        {reply.content}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Timeline & Reports */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card sticky top-24">
                <Tabs defaultValue="timeline" className="w-full">
                  <CardHeader className="pb-2">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      <TabsTrigger value="reports" className="flex items-center gap-1">
                        Reports
                        {issue.reportCount > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {issue.reportCount}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  
                  <CardContent className="pt-2">
                    <TabsContent value="timeline" className="mt-0">
                      <div className="relative">
                        {issue.timeline.map((event, index) => (
                          <div key={event.id} className="flex gap-3 pb-4 last:pb-0">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${getTimelineColor(event.status)}`} />
                              {index < issue.timeline.length - 1 && (
                                <div className="w-0.5 flex-1 bg-border mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-2">
                              <p className="font-medium text-sm">{STATUS_LABELS[event.status] || event.status}</p>
                              {event.note && (
                                <p className="text-xs text-muted-foreground mt-0.5">{event.note}</p>
                              )}
                              {event.adminName && (
                                <p className="text-xs text-primary mt-0.5">By: {event.adminName}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(event.timestamp, 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="reports" className="mt-0">
                      {isFaculty ? (
                        <ReportsDetailView reports={issue.reports} title="All Reports" />
                      ) : (
                        <div className="text-center py-8">
                          <FileWarning className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {issue.reportCount > 0 
                              ? `This issue has ${issue.reportCount} report${issue.reportCount > 1 ? 's' : ''}`
                              : 'No reports yet'
                            }
                          </p>
                          {!hasUserReported && user && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3"
                              onClick={() => setShowReportModal(true)}
                            >
                              <Flag className="h-4 w-4 mr-1" />
                              Report Issue
                            </Button>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Report Issue Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onReport={handleReportIssue}
        type="issue"
      />

      {/* Report Comment Modal */}
      <ReportModal
        isOpen={!!reportingCommentId}
        onClose={() => setReportingCommentId(null)}
        onReport={handleReportComment}
        type="comment"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Issue"
        description="Are you sure you want to delete this issue? This action cannot be undone."
      />
    </div>
  );
}
