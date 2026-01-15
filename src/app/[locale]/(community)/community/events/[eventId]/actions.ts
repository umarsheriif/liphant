'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { RSVPStatus } from '@prisma/client';

export async function rsvpToEvent(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const eventId = formData.get('eventId') as string;
  const status = formData.get('status') as RSVPStatus;

  if (!eventId || !status) {
    throw new Error('Event ID and status are required');
  }

  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, maxAttendees: true, _count: { select: { attendees: true } } },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  // Check existing RSVP
  const existingRSVP = await prisma.eventAttendee.findUnique({
    where: {
      eventId_userId: { eventId, userId: session.user.id },
    },
  });

  if (existingRSVP) {
    // Update existing RSVP
    if (existingRSVP.status === status) {
      // Remove RSVP if clicking same status
      await prisma.eventAttendee.delete({
        where: { id: existingRSVP.id },
      });
    } else {
      // Update to new status
      await prisma.eventAttendee.update({
        where: { id: existingRSVP.id },
        data: { status },
      });
    }
  } else {
    // Check capacity for new "going" RSVPs
    if (status === 'going' && event.maxAttendees) {
      const goingCount = await prisma.eventAttendee.count({
        where: { eventId, status: 'going' },
      });
      if (goingCount >= event.maxAttendees) {
        throw new Error('Event is full');
      }
    }

    // Create new RSVP
    await prisma.eventAttendee.create({
      data: {
        eventId,
        userId: session.user.id,
        status,
      },
    });
  }

  revalidatePath(`/community/events/${eventId}`);
}
