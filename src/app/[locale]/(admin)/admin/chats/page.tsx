import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessagesSquare } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default async function ChatsPage() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { lastMessageAt: 'desc' },
    take: 50,
    include: {
      parent: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      teacher: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chat Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor conversations between parents and teachers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessagesSquare className="h-5 w-5" />
            Recent Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No conversations yet
            </p>
          ) : (
            <div className="space-y-4">
              {conversations.map((conv) => (
                <div key={conv.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarImage src={conv.parent.avatarUrl || undefined} />
                        <AvatarFallback>
                          {conv.parent.fullName.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarImage src={conv.teacher.avatarUrl || undefined} />
                        <AvatarFallback>
                          {conv.teacher.fullName.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="font-medium">
                        {conv.parent.fullName} & {conv.teacher.fullName}
                      </p>
                      {conv.messages[0] && (
                        <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {conv.messages[0].content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{conv._count.messages} messages</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(conv.lastMessageAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
