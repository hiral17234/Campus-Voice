import { cn } from '@/lib/utils';
import { IssueCategory, CATEGORY_LABELS } from '@/types';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Building2, 
  Home,
  Bus,
  Calendar,
  HelpCircle
} from 'lucide-react';

interface CategoryBadgeProps {
  category: IssueCategory;
  customCategory?: string;
  className?: string;
}

const categoryConfig: Record<IssueCategory, { icon: typeof GraduationCap; className: string }> = {
  academics: { icon: GraduationCap, className: 'bg-primary/20 text-primary' },
  infrastructure: { icon: Building2, className: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  hostel: { icon: Home, className: 'bg-purple-500/20 text-purple-600 dark:text-purple-400' },
  transport: { icon: Bus, className: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' },
  events: { icon: Calendar, className: 'bg-pink-500/20 text-pink-600 dark:text-pink-400' },
  other: { icon: HelpCircle, className: 'bg-muted text-muted-foreground' },
};

export function CategoryBadge({ category, customCategory, className }: CategoryBadgeProps) {
  const config = categoryConfig[category] || categoryConfig.other;
  const Icon = config.icon;
  const label = category === 'other' && customCategory ? customCategory : (CATEGORY_LABELS[category] || category);

  return (
    <Badge variant="secondary" className={cn('gap-1', config.className, className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
