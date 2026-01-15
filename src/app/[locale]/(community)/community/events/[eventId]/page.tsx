import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  ArrowLeft,
  LogIn,
  Share2,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { getEventById, getUserRSVP } from '@/lib/data/community';
import Link from 'next/link';
import { format } from 'date-fns';
import { rsvpToEvent } from './actions';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

const categoryLabels: Record<string, string> = {
  playdate: 'Playdate',
  support_group: 'Support Group',
  workshop: 'Workshop',
  social: 'Social Event',
};

export default async function EventDetailPage({ params }: PageProps) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) notFound();

  const userRSVP = isLoggedIn ? await getUserRSVP(eventId, session.user.id) : null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const attendingCount = event.attendees.filter((a) => a.status === 'going').length;
  const maybeCount = event.attendees.filter((a) => a.status === 'maybe').length;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/community/events">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Events
        </Link>
      </Button>

      {/* Event Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <Badge variant="secondary" className="mb-2">
            {categoryLabels[event.category] || event.category}
          </Badge>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-muted-foreground">
            <span>Organized by</span>
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.organizer.avatarUrl || undefined} />
              <AvatarFallback>{getInitials(event.organizer.fullName)}</AvatarFallback>
            </Avatar>
            <span>{event.organizer.fullName}</span>
          </div>
        </div>

        {isLoggedIn ? (
          <div className="flex gap-2">
            <form action={rsvpToEvent}>
              <input type="hidden" name="eventId" value={event.id} />
              <input type="hidden" name="status" value="going" />
              <Button
                type="submit"
                variant={userRSVP?.status === 'going' ? 'default' : 'outline'}
              >
                Going
              </Button>
            </form>
            <form action={rsvpToEvent}>
              <input type="hidden" name="eventId" value={event.id} />
              <input type="hidden" name="status" value="maybe" />
              <Button
                type="submit"
                variant={userRSVP?.status === 'maybe' ? 'default' : 'outline'}
              >
                Maybe
              </Button>
            </form>
          </div>
        ) : (
          <Button asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login to RSVP
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About this Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {event.description.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendees ({attendingCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.attendees.length === 0 ? (
                <p className="text-muted-foreground">No one has RSVP&apos;d yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {event.attendees
                    .filter((a) => a.status === 'going')
                    .map((attendee) => (
                      <div key={attendee.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={attendee.user.avatarUrl || undefined} />
                          <AvatarFallback>{getInitials(attendee.user.fullName)}</AvatarFallback>
                        </Avatar>
                        <span>{attendee.user.fullName}</span>
                        <Badge variant="secondary">Going</Badge>
                      </div>
                    ))}
                  {maybeCount > 0 && (
                    <>
                      <p className="text-sm text-muted-foreground mt-4">
                        {maybeCount} {maybeCount === 1 ? 'person' : 'people'} interested
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Date & Time */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{format(event.startDate, 'EEEE, MMMM d, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {format(event.startDate, 'h:mm a')}
                    {event.endDate && ` - ${format(event.endDate, 'h:mm a')}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {event.isOnline ? (
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Online Event</p>
                    {event.onlineLink && isLoggedIn && userRSVP && (
                      <a
                        href={event.onlineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Join Meeting
                      </a>
                    )}
                    {event.onlineLink && (!isLoggedIn || !userRSVP) && (
                      <p className="text-sm text-muted-foreground">RSVP to get the link</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{event.locationName}</p>
                    {event.address && (
                      <p className="text-sm text-muted-foreground">{event.address}</p>
                    )}
                    {event.city && (
                      <p className="text-sm text-muted-foreground">
                        {event.city}
                        {event.district && `, ${event.district}`}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Capacity */}
          {event.maxAttendees && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {attendingCount} / {event.maxAttendees} spots filled
                    </p>
                    {attendingCount >= event.maxAttendees && (
                      <p className="text-sm text-destructive">Event is full</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
