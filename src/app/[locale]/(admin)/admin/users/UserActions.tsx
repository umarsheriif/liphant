'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MoreHorizontal, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { suspendUser, unsuspendUser } from './actions';
import { toast } from 'sonner';

interface UserActionsProps {
  userId: string;
  userName: string;
  isSuspended: boolean;
  isAdmin: boolean;
}

export function UserActions({ userId, userName, isSuspended, isAdmin }: UserActionsProps) {
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSuspend() {
    if (!reason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }

    setLoading(true);
    const result = await suspendUser(userId, reason);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`${userName} has been suspended`);
      setSuspendDialogOpen(false);
      setReason('');
    }
  }

  async function handleUnsuspend() {
    setLoading(true);
    const result = await unsuspendUser(userId);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`${userName} has been unsuspended`);
    }
  }

  if (isAdmin) {
    return null; // Cannot take actions on admin users
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isSuspended ? (
            <DropdownMenuItem onClick={handleUnsuspend} disabled={loading}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Unsuspend User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setSuspendDialogOpen(true)}
              className="text-destructive"
            >
              <Ban className="mr-2 h-4 w-4" />
              Suspend User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend {userName}? They will not be able to
              log in until unsuspended.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for suspension</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this user is being suspended..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuspendDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={loading || !reason.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
