import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IssueStatus, STATUS_LABELS, STATUS_TRANSITIONS } from '@/types';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newStatus: IssueStatus, note: string) => void;
  currentStatus: IssueStatus;
  issueTitle: string;
}

export function StatusChangeModal({ isOpen, onClose, onConfirm, currentStatus, issueTitle }: StatusChangeModalProps) {
  const [newStatus, setNewStatus] = useState<IssueStatus | ''>('');
  const [note, setNote] = useState('');

  const availableStatuses = STATUS_TRANSITIONS[currentStatus] || [];
  const isFinalStatus = currentStatus === 'resolved' || currentStatus === 'rejected';

  const handleSubmit = () => {
    if (!newStatus) {
      toast.error('Please select a new status');
      return;
    }

    if (!note.trim()) {
      toast.error('Please add a note explaining this change');
      return;
    }

    // Extra validation for resolved/rejected status
    if (newStatus === 'resolved' || newStatus === 'rejected') {
      if (note.trim().length < 10) {
        toast.error(`Please provide a detailed ${newStatus === 'resolved' ? 'explanation of action taken' : 'reason for rejection'}`);
        return;
      }
    }

    onConfirm(newStatus, note);
    handleClose();
  };

  const handleClose = () => {
    setNewStatus('');
    setNote('');
    onClose();
  };

  // Get placeholder based on selected status
  const getNotePlaceholder = () => {
    if (newStatus === 'resolved') {
      return "Explain the action taken to resolve this issue (e.g., 'Maintenance team fixed the leak and replaced damaged tiles')";
    }
    if (newStatus === 'rejected') {
      return "Provide reason for rejection (e.g., 'Issue already addressed in previous semester' or 'Not within campus jurisdiction')";
    }
    return "Explain this status change (e.g., 'Issue forwarded to maintenance team')";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Update Issue Status
          </DialogTitle>
          <DialogDescription className="truncate">
            {issueTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Current Status Display */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <Label className="text-sm text-muted-foreground mb-2 block">Current Status</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentStatus === 'resolved' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {currentStatus === 'rejected' && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium text-lg">
                  {currentStatus === 'resolved' && '✅ '}
                  {currentStatus === 'rejected' && '❌ '}
                  {STATUS_LABELS[currentStatus]}
                </span>
              </div>

              {/* Right/Wrong indicators for final statuses */}
              {isFinalStatus && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm hover:bg-green-500/20 transition-colors"
                    onClick={() => {
                      toast.success('Decision confirmed as correct');
                      handleClose();
                    }}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Correct
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm hover:bg-red-500/20 transition-colors"
                    onClick={() => {
                      toast.info('Please contact senior administration to reopen this issue');
                      handleClose();
                    }}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Needs Review
                  </button>
                </div>
              )}
            </div>
            {isFinalStatus && (
              <p className="text-xs text-muted-foreground mt-2">
                This issue has been finalized. Use the buttons above to confirm or flag for review.
              </p>
            )}
          </div>

          {/* Only show status change options if not in final state */}
          {!isFinalStatus && (
            <>
              <div>
                <Label htmlFor="newStatus">New Status *</Label>
                <Select value={newStatus} onValueChange={(val) => setNewStatus(val as IssueStatus)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.length === 0 ? (
                      <SelectItem value="" disabled>No transitions available</SelectItem>
                    ) : (
                      availableStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === 'resolved' && '✅ '}
                          {status === 'rejected' && '❌ '}
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="note">
                  {newStatus === 'resolved' 
                    ? 'Resolution Details * (Required)' 
                    : newStatus === 'rejected' 
                    ? 'Rejection Reason * (Required)' 
                    : 'Official Note * (Required)'}
                </Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={getNotePlaceholder()}
                  className="mt-2"
                  rows={4}
                />
                {(newStatus === 'resolved' || newStatus === 'rejected') && (
                  <p className="text-xs text-muted-foreground mt-1">
                    This reason will be visible to students and stored in the issue history.
                  </p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    This action will be logged in the issue timeline and the student will be notified.
                    {(newStatus === 'resolved' || newStatus === 'rejected') && 
                      ' Once marked as resolved or rejected, this decision is permanent.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {isFinalStatus ? 'Close' : 'Cancel'}
          </Button>
          {!isFinalStatus && (
            <Button 
              onClick={handleSubmit}
              disabled={!newStatus || !note.trim() || availableStatuses.length === 0}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
