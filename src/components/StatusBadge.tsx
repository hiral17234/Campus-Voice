import { cn } from '@/lib/utils';
import { IssueStatus, STATUS_LABELS } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, TrendingUp, Wrench, FileCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

const statusConfig: Record<IssueStatus, { icon: typeof CheckCircle; className: string }> = {
  open: { icon: Clock, className: 'bg-muted text-muted-foreground' },
  under_review: { icon: AlertCircle, className: 'bg-warning/20 text-warning-foreground border-warning' },
  escalated: { icon: TrendingUp, className: 'bg-destructive/20 text-destructive border-destructive' },
  action_in_progress: { icon: Wrench, className: 'bg-info/20 text-info-foreground border-info' },
  action_taken: { icon: FileCheck, className: 'bg-accent/20 text-accent-foreground border-accent' },
  resolved: { icon: CheckCircle, className: 'bg-success/20 text-success border-success' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1 font-medium', config.className, className)}>
      <Icon className="h-3 w-3" />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
