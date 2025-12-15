import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  onVote: (type: 'up' | 'down') => void;
  vertical?: boolean;
}

export function VoteButtons({ upvotes, downvotes, userVote, onVote, vertical = true }: VoteButtonsProps) {
  const netVotes = upvotes - downvotes;

  return (
    <div className={cn('flex items-center gap-1', vertical ? 'flex-col' : 'flex-row')}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onVote('up')}
        className={cn(
          'h-8 w-8 p-0 rounded-full transition-all',
          userVote === 'up' && 'bg-primary/20 text-primary hover:bg-primary/30'
        )}
      >
        <motion.div whileTap={{ scale: 1.3 }} transition={{ type: 'spring', stiffness: 500 }}>
          <ChevronUp className="h-5 w-5" />
        </motion.div>
      </Button>
      
      <AnimatePresence mode="wait">
        <motion.span
          key={netVotes}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={cn(
            'text-sm font-semibold min-w-[2rem] text-center',
            netVotes > 0 && 'text-primary',
            netVotes < 0 && 'text-destructive'
          )}
        >
          {netVotes}
        </motion.span>
      </AnimatePresence>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onVote('down')}
        className={cn(
          'h-8 w-8 p-0 rounded-full transition-all',
          userVote === 'down' && 'bg-destructive/20 text-destructive hover:bg-destructive/30'
        )}
      >
        <motion.div whileTap={{ scale: 1.3 }} transition={{ type: 'spring', stiffness: 500 }}>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </Button>
    </div>
  );
}
