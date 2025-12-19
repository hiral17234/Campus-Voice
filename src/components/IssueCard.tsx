import { Issue } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { PriorityBadge } from './PriorityBadge';
import { VoteButtons } from './VoteButtons';
import { MediaGallery } from './MediaGallery';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssuesContext';
import { MapPin, MessageSquare, Clock, AlertTriangle, Flag, Image, Info, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface IssueCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const { user } = useAuth();
  const { vote, comments } = useIssues();
  const navigate = useNavigate();

  const handleVote = async (type: 'up' | 'down') => {
    if (user) {
      try {
        await vote(issue.id, user.id, type);
      } catch (error) {
        console.error('Vote error:', error);
      }
    }
  };

  const userVote = user ? issue.votedUsers[user.id] : null;
  const netVotes = issue.upvotes - issue.downvotes;
  const hasMedia = issue.mediaUrls && issue.mediaUrls.length > 0;
  const actualCommentCount = comments[issue.id]?.length || issue.commentCount || 0;

  // Disable voting for deleted issues
  const canInteract = !issue.isDeleted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer glass-card ${issue.isOfficial ? 'border-primary/50' : ''} ${issue.isFalselyAccused ? 'border-green-500/50 bg-green-500/5' : ''} ${issue.isDeleted ? 'opacity-60' : ''}`}
        onClick={() => navigate(`/issue/${issue.id}`)}
      >
        <CardContent className="p-0">
          <div className="flex">
            {/* Vote Column */}
            <div 
              className={`flex flex-col items-center justify-start p-3 bg-muted/50 border-r border-border ${!canInteract ? 'pointer-events-none opacity-50' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <VoteButtons
                upvotes={issue.upvotes}
                downvotes={issue.downvotes}
                userVote={userVote}
                onVote={canInteract ? handleVote : () => {}}
              />
              {/* Vote Info Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="mt-1 p-1 text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="text-xs">
                    <p className="text-green-500">↑ {issue.upvotes} upvotes</p>
                    <p className="text-red-500">↓ {issue.downvotes} downvotes</p>
                    <p className="text-muted-foreground mt-1">Net: {netVotes}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex flex-wrap gap-2 items-center">
                  {issue.isOfficial && (
                    <Badge variant="default" className="text-xs flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Official
                    </Badge>
                  )}
                  <CategoryBadge category={issue.category} />
                  <StatusBadge status={issue.status} />
                  {issue.priority && <PriorityBadge priority={issue.priority} />}
                  {issue.isUrgent && (
                    <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      Urgent
                    </span>
                  )}
                  {issue.reportCount > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`flex items-center gap-1 text-xs font-medium ${issue.isReported ? 'text-red-500' : 'text-orange-500'}`}>
                          <Flag className="h-3 w-3" />
                          {issue.reportCount}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{issue.reportCount} report{issue.reportCount !== 1 ? 's' : ''}</p>
                        {issue.reportCount >= 3 && <p className="text-xs text-red-500">Flagged for review</p>}
                        {issue.reportCount >= 35 && <p className="text-xs text-red-500">Auto-deleted at 35 reports</p>}
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {issue.isFalselyAccused && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1 text-xs font-medium text-green-500">
                          <Shield className="h-3 w-3" />
                          Verified
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs text-green-500">This issue was falsely reported and verified as true by faculty</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {hasMedia && (
                    <span className="flex items-center gap-1 text-xs text-primary font-medium">
                      <Image className="h-3 w-3" />
                      {issue.mediaUrls.length}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 line-clamp-2">{issue.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{issue.description}</p>

              {/* Media Preview - Compact */}
              {hasMedia && (
                <MediaGallery 
                  mediaUrls={issue.mediaUrls.slice(0, 3)} 
                  mediaTypes={issue.mediaTypes.slice(0, 3)} 
                  compact 
                />
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {issue.location}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {actualCommentCount} comments
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
                </span>
                <span className="text-muted-foreground/70">by {issue.authorNickname}</span>
              </div>

              {/* Progress Indicator */}
              {netVotes > 0 && netVotes < 100 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Escalation progress</span>
                    <span>{Math.min(netVotes, 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full gradient-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(netVotes, 100)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
