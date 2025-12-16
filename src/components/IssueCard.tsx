import { Issue } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { PriorityBadge } from './PriorityBadge';
import { VoteButtons } from './VoteButtons';
import { useAuth } from '@/context/AuthContext';
import { useIssues } from '@/context/IssuesContext';
import { MapPin, MessageSquare, Clock, AlertTriangle, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface IssueCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const { user } = useAuth();
  const { vote } = useIssues();
  const navigate = useNavigate();

  const handleVote = (type: 'up' | 'down') => {
    if (user) {
      vote(issue.id, user.id, type);
    }
  };

  const userVote = user ? issue.votedUsers[user.id] : null;
  const netVotes = issue.upvotes - issue.downvotes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer glass-card"
        onClick={() => navigate(`/issue/${issue.id}`)}
      >
        <CardContent className="p-0">
          <div className="flex">
            {/* Vote Column */}
            <div 
              className="flex flex-col items-center justify-start p-3 bg-muted/50 border-r border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <VoteButtons
                upvotes={issue.upvotes}
                downvotes={issue.downvotes}
                userVote={userVote}
                onVote={handleVote}
              />
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <CategoryBadge category={issue.category} />
                  <StatusBadge status={issue.status} />
                  {issue.priority && <PriorityBadge priority={issue.priority} />}
                  {issue.isUrgent && (
                    <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      Urgent
                    </span>
                  )}
                  {issue.isReported && (
                    <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                      <Flag className="h-3 w-3" />
                      Reported
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 line-clamp-2">{issue.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{issue.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {issue.location}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {issue.commentCount} comments
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
