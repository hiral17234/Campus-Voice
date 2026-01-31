import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Issue, IssuePriority, Department, PRIORITY_LABELS, DEPARTMENT_LABELS } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { DepartmentSelect } from '@/components/DepartmentSelect';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MapPin,
  Eye,
  RefreshCw,
  Flag,
  Shield,
  ChevronDown,
  RotateCcw,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'all' | 'reported' | 'deleted' | 'falsely_accused';

interface AdminIssueCardProps {
  issue: Issue;
  activeTab: TabType;
  onStatusChange: (issue: Issue) => void;
  onPriorityChange: (issueId: string, priority: IssuePriority) => void;
  onDepartmentAssign: (issueId: string, department: Department, customDepartment?: string) => void;
  onRestore: (issueId: string) => void;
  onMarkFalselyAccused: (issueId: string) => void;
  index?: number;
}

export function AdminIssueCard({
  issue,
  activeTab,
  onStatusChange,
  onPriorityChange,
  onDepartmentAssign,
  onRestore,
  onMarkFalselyAccused,
  index = 0,
}: AdminIssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const cardBgClass = issue.isFalselyAccused
    ? 'border-l-4 border-l-green-500 bg-green-500/10'
    : issue.isReported
    ? 'border-l-4 border-l-red-500 bg-red-500/5'
    : issue.isOfficial
    ? 'border-l-4 border-l-primary bg-primary/5'
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className={cn('overflow-hidden', cardBgClass)}>
        <CardContent className="p-0">
          {/* Collapsed Header - Always visible */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
          >
            <div className="flex items-start justify-between gap-3">
              {/* Title and indicators */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {issue.isFalselyAccused && (
                    <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                  {issue.isReported && !issue.isFalselyAccused && (
                    <Flag className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                  {issue.isOfficial && !issue.isFalselyAccused && (
                    <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                  <span className="font-medium truncate">{issue.title}</span>
                </div>

                {/* Badges row - compact */}
                <div className="flex flex-wrap items-center gap-1 mb-2">
                  {issue.isFalselyAccused && (
                    <Badge className="text-[10px] h-5 bg-green-500/20 text-green-600 dark:text-green-400">
                      Verified True
                    </Badge>
                  )}
                  {issue.isOfficial && !issue.isFalselyAccused && (
                    <Badge variant="default" className="text-[10px] h-5">
                      Official
                    </Badge>
                  )}
                </div>

                {/* Location and time */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{issue.location}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(issue.createdAt, { addSuffix: true })}</span>
                </div>
              </div>

              {/* Vote counts and chevron */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-0.5 text-green-500">
                    <ThumbsUp className="h-3 w-3" />
                    {issue.upvotes}
                  </span>
                  <span className="flex items-center gap-0.5 text-red-500">
                    <ThumbsDown className="h-3 w-3" />
                    {issue.downvotes}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              </div>
            </div>
          </button>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-0 border-t border-border">
                  <div className="pt-4 space-y-4">
                    {/* Status, Category, Priority badges */}
                    <div className="flex flex-wrap gap-2">
                      <CategoryBadge category={issue.category} />
                      <StatusBadge status={issue.status} />
                      {issue.priority && <PriorityBadge priority={issue.priority} />}
                    </div>

                    {/* Priority selector (not for deleted tab) */}
                    {activeTab !== 'deleted' && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Priority</label>
                        <Select
                          value={issue.priority || ''}
                          onValueChange={(v) => onPriorityChange(issue.id, v as IssuePriority)}
                        >
                          <SelectTrigger className="w-full h-11 text-sm">
                            <SelectValue placeholder="Set Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Department selector (not for deleted tab) */}
                    {activeTab !== 'deleted' && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Department</label>
                        <DepartmentSelect
                          value={issue.assignedDepartment || ''}
                          customValue={issue.customDepartment}
                          onValueChange={(dept, custom) => onDepartmentAssign(issue.id, dept, custom)}
                        />
                      </div>
                    )}

                    {/* Report count for reported tab */}
                    {activeTab === 'reported' && issue.reportCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-red-500" />
                        <Badge variant="destructive" className="text-xs">
                          {issue.reportCount} reports
                        </Badge>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/issue/${issue.id}`);
                        }}
                        className="flex-1 min-w-[100px] h-11"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>

                      {activeTab === 'deleted' ? (
                        <>
                          <Button
                            variant="outline"
                            size="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestore(issue.id);
                            }}
                            className="flex-1 min-w-[100px] h-11"
                            title="Restore issue"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore
                          </Button>
                          <Button
                            variant="outline"
                            size="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkFalselyAccused(issue.id);
                            }}
                            className="flex-1 min-w-[100px] h-11 text-green-600 border-green-500/50 hover:bg-green-500/10"
                            title="Mark as Falsely Accused"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify True
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(issue);
                          }}
                          className="flex-1 min-w-[100px] h-11"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Status
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
