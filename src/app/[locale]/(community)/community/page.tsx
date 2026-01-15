import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, Users, ArrowRight, Plus, LogIn } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getEvents, getForumCategories } from '@/lib/data/community';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function CommunityPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const [{ events }, categories] = await Promise.all([
    getEvents({ status: 'upcoming', pageSize: 3 }),
    getForumCategories(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-muted-foreground">
            Connect with other families, attend events, and share experiences
          </p>
        </div>
        {!isLoggedIn && (
          <Button asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login to Participate
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Events Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            {isLoggedIn ? (
              <Button variant="outline" size="sm" asChild>
                <Link href="/community/events/create">
                  <Plus className="mr-1 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/login?redirect=/community/events/create">
                  <LogIn className="mr-1 h-4 w-4" />
                  Login to Create
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No upcoming events</p>
                {isLoggedIn ? (
                  <Button variant="link" asChild>
                    <Link href="/community/events/create">Create the first event</Link>
                  </Button>
                ) : (
                  <Button variant="link" asChild>
                    <Link href="/login">Login to create an event</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded bg-primary/10 text-primary">
                      <span className="text-xs font-medium">
                        {format(event.startDate, 'MMM')}
                      </span>
                      <span className="text-lg font-bold">
                        {format(event.startDate, 'd')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="capitalize">
                          {event.category.replace('_', ' ')}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.attendeeCount} attending
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="link" className="w-full" asChild>
                  <Link href="/community/events">
                    View all events <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Forum Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Discussion Forum
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No forum categories yet
              </p>
            ) : (
              <div className="space-y-3">
                {categories.slice(0, 5).map((category) => (
                  <Link
                    key={category.id}
                    href={`/community/forum/${category.slug}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {category._count.posts} posts
                    </Badge>
                  </Link>
                ))}
                <Button variant="link" className="w-full" asChild>
                  <Link href="/community/forum">
                    Browse all topics <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
