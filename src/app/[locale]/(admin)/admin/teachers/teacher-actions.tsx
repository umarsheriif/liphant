'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { approveTeacher, rejectTeacher, approveApplication, rejectApplication } from './actions';

export function TeacherApproveButton({ teacherId }: { teacherId: string }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveTeacher(teacherId);
    } catch (error) {
      console.error('Failed to approve teacher:', error);
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

export function TeacherRejectButton({ teacherId }: { teacherId: string }) {
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    setLoading(true);
    try {
      await rejectTeacher(teacherId);
    } catch (error) {
      console.error('Failed to reject teacher:', error);
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

export function ApplicationApproveButton({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveApplication(applicationId);
    } catch (error) {
      console.error('Failed to approve application:', error);
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

export function ApplicationRejectButton({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    setLoading(true);
    try {
      await rejectApplication(applicationId);
    } catch (error) {
      console.error('Failed to reject application:', error);
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
