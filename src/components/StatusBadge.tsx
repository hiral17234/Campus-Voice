import { cn } from '@/lib/utils';
import { IssueStatus, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, Wrench, XCircle, ThumbsUp } from 'lucide-react';

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

const statusConfig: Record<IssueStatus, { icon: typeof CheckCircle }> = {
  pending: { icon: Clock },
  under_review: { icon: AlertCircle },
  approved: { icon: ThumbsUp },
  in_progress: { icon: Wrench },
  resolved: { icon: CheckCircle },
  rejected: { icon: XCircle },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.pending;

  return (
    <Badge variant="outline" className={cn('gap-1 font-medium', colorClass, className)}>
      <Icon className="h-3 w-3" />
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}
