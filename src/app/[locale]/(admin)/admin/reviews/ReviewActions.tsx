'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, Flag, Loader2 } from 'lucide-react';
import { moderateReview } from './actions';
import { toast } from 'sonner';
import type { ModerationAction } from '@prisma/client';

interface ReviewActionsProps {
  reviewId: string;
}

export function ReviewActions({ reviewId }: ReviewActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<ModerationAction | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleModerate(selectedAction: ModerationAction) {
    // For approve, no reason needed
    if (selectedAction === 'approved') {
      setLoading(true);
      const result = await moderateReview(reviewId, selectedAction);
      setLoading(false);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Review approved');
      }
      return;
    }

    // For reject/flag, open dialog to get reason
    setAction(selectedAction);
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!action) return;

    setLoading(true);
    const result = await moderateReview(reviewId, action, reason || undefined);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        action === 'rejected' ? 'Review rejected' : 'Review flagged'
      );
      setDialogOpen(false);
      setReason('');
      setAction(null);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-green-600 hover:text-green-700"
          onClick={() => handleModerate('approved')}
          disabled={loading}
        >
          <Check className="mr-1 h-4 w-4" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 hover:text-red-700"
          onClick={() => handleModerate('rejected')}
          disabled={loading}
        >
          <X className="mr-1 h-4 w-4" />
          Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-yellow-600 hover:text-yellow-700"
          onClick={() => handleModerate('flagged')}
          disabled={loading}
        >
          <Flag className="mr-1 h-4 w-4" />
          Flag
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'rejected' ? 'Reject Review' : 'Flag Review'}
            </DialogTitle>
            <DialogDescription>
              {action === 'rejected'
                ? 'This review will be hidden from public view.'
                : 'This review will be flagged for further investigation.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Explain the reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={action === 'rejected' ? 'destructive' : 'default'}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {action === 'rejected' ? 'Reject' : 'Flag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
