import { cn } from '@/lib/utils';
import { IssueCategory, CATEGORY_LABELS } from '@/types';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  Building2, 
  Shield, 
  UtensilsCrossed, 
  Landmark 
} from 'lucide-react';

interface CategoryBadgeProps {
  category: IssueCategory;
  className?: string;
}

const categoryConfig: Record<IssueCategory, { icon: typeof GraduationCap; className: string }> = {
  academics: { icon: GraduationCap, className: 'bg-accent/20 text-accent-foreground' },
  faculty: { icon: Users, className: 'bg-primary/20 text-primary-foreground' },
  infrastructure: { icon: Building2, className: 'bg-secondary/20 text-secondary-foreground' },
  safety: { icon: Shield, className: 'bg-destructive/20 text-destructive' },
  food: { icon: UtensilsCrossed, className: 'bg-success/20 text-success' },
  administration: { icon: Landmark, className: 'bg-warning/20 text-warning-foreground' },
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={cn('gap-1', config.className, className)}>
      <Icon className="h-3 w-3" />
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
