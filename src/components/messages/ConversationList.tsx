'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    teacherProfile?: {
      isVerified: boolean;
    } | null;
  };
  lastMessage: {
    content: string;
    createdAt: Date;
    senderId: string;
  } | null;
  lastMessageAt: Date;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
}

export function ConversationList({ conversations, currentUserId }: ConversationListProps) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-muted-foreground">
        <div>
          <p className="mb-2">No conversations yet</p>
          <p className="text-sm">Start a conversation by messaging a teacher</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => {
        const isActive = pathname.includes(conversation.id);
        const initials = conversation.otherUser.fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        const isFromMe = conversation.lastMessage?.senderId === currentUserId;

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className={cn(
              'flex items-center gap-3 border-b p-4 transition-colors hover:bg-muted/50',
              isActive && 'bg-muted'
            )}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={conversation.otherUser.avatarUrl || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              {conversation.otherUser.teacherProfile?.isVerified && (
                <div className="absolute -bottom-1 -right-1 rounded-full bg-accent p-0.5">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-medium">{conversation.otherUser.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                </span>
              </div>
              {conversation.lastMessage && (
                <p className="truncate text-sm text-muted-foreground">
                  {isFromMe && <span className="text-muted-foreground/70">You: </span>}
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>
            {conversation.unreadCount > 0 && (
              <Badge className="h-5 w-5 rounded-full p-0 text-xs">
                {conversation.unreadCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </div>
  );
}
