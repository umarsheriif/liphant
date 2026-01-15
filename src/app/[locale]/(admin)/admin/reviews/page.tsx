import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Star } from 'lucide-react';
import { getReviews } from '@/lib/data/admin/reviews';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { ReviewActions } from './ReviewActions';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

const actionBadgeColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  flagged: 'bg-yellow-100 text-yellow-800',
};

export default async function ReviewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as 'pending' | 'moderated') || 'pending';
  const page = parseInt(params.page || '1');

  const { reviews, total, totalPages } = await getReviews({
    status,
    page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Review Moderation</h1>
          <p className="text-muted-foreground">
            Review and moderate user reviews
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {total} reviews
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form className="flex gap-4">
            <Select name="status" defaultValue={status}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="moderated">Already Moderated</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Filter</Button>
          </form>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {status === 'pending'
                ? 'No reviews pending moderation'
                : 'No moderated reviews found'}
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.parent.avatarUrl || undefined} />
                        <AvatarFallback>
                          {review.parent.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.parent.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          reviewed {review.teacher.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {review.moderation && (
                        <Badge
                          variant="secondary"
                          className={actionBadgeColors[review.moderation.action]}
                        >
                          {review.moderation.action}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  {review.comment && (
                    <p className="text-sm bg-muted/50 rounded p-3">
                      {review.comment}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>
                        Booking: {format(review.booking.bookingDate, 'MMM d, yyyy')}
                      </span>
                      <span>
                        {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    {!review.moderation && (
                      <ReviewActions reviewId={review.id} />
                    )}
                    {review.moderation && (
                      <span className="text-xs">
                        Moderated by {review.moderation.moderatedBy.fullName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link
                    href={`/admin/reviews?${new URLSearchParams({
                      status,
                      page: String(page - 1),
                    })}`}
                  >
                    Previous
                  </Link>
                </Button>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Button variant="outline" asChild>
                  <Link
                    href={`/admin/reviews?${new URLSearchParams({
                      status,
                      page: String(page + 1),
                    })}`}
                  >
                    Next
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
