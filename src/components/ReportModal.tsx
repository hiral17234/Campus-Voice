import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { REPORT_REASON_LABELS, ReportReason } from '@/types';
import { Flag, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: ReportReason, customReason?: string) => void;
  type: 'issue' | 'comment';
}

export function ReportModal({ isOpen, onClose, onReport, type }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [customReason, setCustomReason] = useState('');

  const handleSubmit = () => {
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    if (reason === 'other' && !customReason.trim()) {
      toast.error('Please specify a reason');
      return;
    }

    onReport(reason, reason === 'other' ? customReason : undefined);
    toast.success(`${type === 'issue' ? 'Issue' : 'Comment'} reported successfully`);
    handleClose();
  };

  const handleClose = () => {
    setReason('');
    setCustomReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report {type === 'issue' ? 'Issue' : 'Comment'}
          </DialogTitle>
          <DialogDescription>
            Help us understand what's wrong with this {type}. Your report is anonymous.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={reason} onValueChange={(val) => setReason(val as ReportReason)}>
            {Object.entries(REPORT_REASON_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-3 py-2">
                <RadioGroupItem value={key} id={key} />
                <Label htmlFor={key} className="cursor-pointer flex-1">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {reason === 'other' && (
            <div className="mt-4">
              <Label htmlFor="customReason">Please specify:</Label>
              <Textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe the issue..."
                className="mt-2"
                rows={3}
              />
            </div>
          )}

          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <p className="text-xs">
                False reports may result in action against your account. 
                Please only report content that genuinely violates community guidelines.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={!reason}
          >
            <Flag className="h-4 w-4 mr-2" />
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
