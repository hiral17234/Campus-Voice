import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IssueStatus, STATUS_LABELS, STATUS_TRANSITIONS } from '@/types';
import { RefreshCw, AlertTriangle } from 'lucide-react';
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

  const handleSubmit = () => {
    if (!newStatus) {
      toast.error('Please select a new status');
      return;
    }

    if (!note.trim()) {
      toast.error('Please add a note explaining this change');
      return;
    }

    onConfirm(newStatus, note);
    handleClose();
  };

  const handleClose = () => {
    setNewStatus('');
    setNote('');
    onClose();
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
          <div>
            <Label className="text-sm text-muted-foreground">Current Status</Label>
            <p className="font-medium">{STATUS_LABELS[currentStatus]}</p>
          </div>

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
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="note">Official Note * (Required)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explain this status change (e.g., 'Issue forwarded to maintenance team')"
              className="mt-2"
              rows={4}
            />
          </div>

          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-primary" />
              <p className="text-xs text-muted-foreground">
                This action will be logged in the issue timeline and the student will be notified.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!newStatus || !note.trim() || availableStatuses.length === 0}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
