import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  onVote: (type: 'up' | 'down') => boolean;
  vertical?: boolean;
  disabled?: boolean;
}

export function VoteButtons({ upvotes, downvotes, userVote, onVote, vertical = true, disabled = false }: VoteButtonsProps) {
  const netVotes = upvotes - downvotes;
  const hasVoted = userVote !== null && userVote !== undefined;

  const handleVote = (type: 'up' | 'down') => {
    if (hasVoted) {
      toast.error('You have already voted on this issue');
      return;
    }
    if (disabled) return;
    
    const success = onVote(type);
    if (!success) {
      toast.error('You have already voted on this issue');
    }
  };

  return (
    <div className={cn('flex items-center gap-1', vertical ? 'flex-col' : 'flex-row')}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('up')}
        disabled={hasVoted || disabled}
        className={cn(
          'h-8 w-8 p-0 rounded-full transition-all',
          userVote === 'up' && 'bg-success/20 text-success hover:bg-success/30 border-2 border-success',
          hasVoted && userVote !== 'up' && 'opacity-50 cursor-not-allowed'
        )}
      >
        <motion.div whileTap={{ scale: hasVoted ? 1 : 1.3 }} transition={{ type: 'spring', stiffness: 500 }}>
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
            netVotes > 0 && 'text-success',
            netVotes < 0 && 'text-destructive'
          )}
        >
          {netVotes}
        </motion.span>
      </AnimatePresence>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('down')}
        disabled={hasVoted || disabled}
        className={cn(
          'h-8 w-8 p-0 rounded-full transition-all',
          userVote === 'down' && 'bg-destructive/20 text-destructive hover:bg-destructive/30 border-2 border-destructive',
          hasVoted && userVote !== 'down' && 'opacity-50 cursor-not-allowed'
        )}
      >
        <motion.div whileTap={{ scale: hasVoted ? 1 : 1.3 }} transition={{ type: 'spring', stiffness: 500 }}>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </Button>
    </div>
  );
}
