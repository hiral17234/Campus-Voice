import { cn } from '@/lib/utils';
import { IssuePriority, PRIORITY_LABELS, PRIORITY_COLORS } from '@/types';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: IssuePriority;
  className?: string;
}

const priorityIcons: Record<IssuePriority, typeof AlertCircle> = {
  low: ArrowDown,
  medium: AlertCircle,
  high: ArrowUp,
  urgent: AlertTriangle,
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const Icon = priorityIcons[priority];
  const colorClass = PRIORITY_COLORS[priority] || PRIORITY_COLORS.low;
  const label = PRIORITY_LABELS[priority] || priority;

  return (
    <Badge variant="outline" className={cn('gap-1 font-medium', colorClass, className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
