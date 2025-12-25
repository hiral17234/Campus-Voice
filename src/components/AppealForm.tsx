import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AppealFormProps {
  userId: string;
  userNickname: string;
  disabledReason?: string;
  onSuccess?: () => void;
}

export function AppealForm({ userId, userNickname, disabledReason, onSuccess }: AppealFormProps) {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for your appeal');
      return;
    }

    if (reason.trim().length < 50) {
      toast.error('Please provide a more detailed explanation (at least 50 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'account_appeals'), {
        userId,
        userNickname,
        userEmail: email.trim() || null,
        reason: reason.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      toast.success('Your appeal has been submitted. We will review it shortly.');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting appeal:', error);
      toast.error('Failed to submit appeal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="glass-card max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Appeal Submitted</h3>
          <p className="text-muted-foreground text-sm">
            Your appeal has been submitted for review. If you provided an email, 
            you will be notified of the decision. Otherwise, please check back later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-card max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Account Suspended</span>
          </div>
          <CardTitle>Appeal Your Suspension</CardTitle>
          <CardDescription>
            Your account was suspended for: <strong>{disabledReason || 'Spam reporting detected'}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Provide an email to receive updates about your appeal
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Why should your account be reinstated?</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you believe your account was incorrectly suspended and why it should be reinstated..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={5}
                required
                minLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 50 characters ({reason.length}/50)
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || reason.trim().length < 50}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Appeal
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
