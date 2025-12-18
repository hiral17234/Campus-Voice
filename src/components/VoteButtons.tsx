import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  onVote: (type: 'up' | 'down') => void;
  vertical?: boolean;
  showDetails?: boolean;
}

export function VoteButtons({ upvotes, downvotes, userVote, onVote, vertical = true, showDetails = false }: VoteButtonsProps) {
  const netVotes = upvotes - downvotes;

  return (
    <div className={cn('flex items-center gap-1', vertical ? 'flex-col' : 'flex-row')}>
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent side={vertical ? 'right' : 'top'}>
          <p className="text-green-500">{upvotes} upvotes</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={netVotes}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={cn(
                  'text-sm font-semibold min-w-[2rem] text-center block',
                  netVotes > 0 && 'text-primary',
                  netVotes < 0 && 'text-destructive'
                )}
              >
                {netVotes}
              </motion.span>
            </AnimatePresence>
            {showDetails && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="text-green-500">↑{upvotes}</span>
                <span className="text-red-500">↓{downvotes}</span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p className="text-green-500">↑ {upvotes} upvotes</p>
            <p className="text-red-500">↓ {downvotes} downvotes</p>
          </div>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent side={vertical ? 'right' : 'bottom'}>
          <p className="text-red-500">{downvotes} downvotes</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
