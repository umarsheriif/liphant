import { Badge } from '@/components/ui/badge';
import type { BookingStatus } from '@prisma/client';

const statusConfig: Record<BookingStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  pending: { variant: 'secondary', label: 'Pending' },
  awaiting_assignment: { variant: 'secondary', label: 'Awaiting Assignment' },
  confirmed: { variant: 'default', label: 'Confirmed' },
  completed: { variant: 'outline', label: 'Completed' },
  cancelled: { variant: 'destructive', label: 'Cancelled' },
};

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
