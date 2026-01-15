'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { approveCenter, rejectCenter } from './actions';

export function CenterApproveButton({ centerId }: { centerId: string }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveCenter(centerId);
    } catch (error) {
      console.error('Failed to approve center:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" onClick={handleApprove} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Check className="h-4 w-4 me-1" />
          Approve
        </>
      )}
    </Button>
  );
}

export function CenterRejectButton({ centerId }: { centerId: string }) {
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    setLoading(true);
    try {
      await rejectCenter(centerId);
    } catch (error) {
      console.error('Failed to reject center:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleReject} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <X className="h-4 w-4 me-1" />
          Reject
        </>
      )}
    </Button>
  );
}
