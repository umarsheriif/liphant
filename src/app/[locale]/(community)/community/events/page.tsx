import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, MapPin, Users, Plus, Search, LogIn } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getEvents } from '@/lib/data/community';
import Link from 'next/link';
import { format } from 'date-fns';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
}

const categoryLabels: Record<string, string> = {
  playdate: 'Playdate',
  support_group: 'Support Group',
  workshop: 'Workshop',
  social: 'Social Event',
};

export default async function EventsPage({ searchParams }: PageProps) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const params = await searchParams;
  const page = parseInt(params.page || '1');

  const { events, total, totalPages } = await getEvents({
    search: params.q,
    category: params.category as 'playdate' | 'support_group' | 'workshop' | 'social' | undefined,
    page,
    pageSize: 12,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community Events</h1>
          <p className="text-muted-foreground">
            Join playdates, support groups, and workshops
          </p>
        </div>
        {isLoggedIn ? (
          <Button asChild>
            <Link href="/community/events/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/login?redirect=/community/events/create">
              <LogIn className="mr-2 h-4 w-4" />
              Login to Create
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search events..."
                defaultValue={params.q}
                className="pl-9"
              />
            </div>
            <Select name="category" defaultValue={params.category || 'all'}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="playdate">Playdates</SelectItem>
                <SelectItem value="support_group">Support Groups</SelectItem>
                <SelectItem value="workshop">Workshops</SelectItem>
                <SelectItem value="social">Social Events</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No events found</h3>
            <p className="mt-2 text-muted-foreground">
              Be the first to create an event!
            </p>
            {isLoggedIn ? (
              <Button className="mt-4" asChild>
                <Link href="/community/events/create">Create Event</Link>
              </Button>
            ) : (
              <Button className="mt-4" asChild>
                <Link href="/login">Login to Create Event</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{total} events found</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 border-b p-4">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-xs font-medium uppercase">
                        {format(event.startDate, 'MMM')}
                      </span>
                      <span className="text-xl font-bold">
                        {format(event.startDate, 'd')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge variant="secondary" className="mb-1">
                        {categoryLabels[event.category] || event.category}
                      </Badge>
                      <h3 className="font-semibold truncate">{event.title}</h3>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">
                        {event.isOnline ? 'Online Event' : event.locationName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.attendeeCount} attending
                        {event.maxAttendees && ` / ${event.maxAttendees} max`}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                  <div className="border-t p-4">
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={`/community/events/${event.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link
                    href={`/community/events?${new URLSearchParams({
                      ...(params.q && { q: params.q }),
                      ...(params.category && { category: params.category }),
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
                    href={`/community/events?${new URLSearchParams({
                      ...(params.q && { q: params.q }),
                      ...(params.category && { category: params.category }),
                      page: String(page + 1),
                    })}`}
                  >
                    Next
                  </Link>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
