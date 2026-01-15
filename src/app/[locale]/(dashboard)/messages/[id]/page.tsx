import { setRequestLocale } from 'next-intl/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getConversationsForUser, getConversationById, markConversationAsRead } from '@/lib/data/messages';
import { ConversationList, ChatWindow } from '@/components/messages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { sendMessage } from '../actions';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect('/login');

  const [conversations, conversation] = await Promise.all([
    getConversationsForUser(session.user.id, session.user.role as 'parent' | 'teacher'),
    getConversationById(id, session.user.id),
  ]);

  if (!conversation) {
    notFound();
  }

  // Mark messages as read
  await markConversationAsRead(id, session.user.id);

  const otherUser =
    session.user.id === conversation.parentId
      ? conversation.teacher
      : conversation.parent;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Conversation List - Hidden on Mobile */}
      <Card className="hidden w-full max-w-md md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-5rem)] p-0">
          <ConversationList
            conversations={conversations}
            currentUserId={session.user.id}
          />
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="flex flex-1 flex-col">
        {/* Mobile Back Button */}
        <div className="border-b p-2 md:hidden">
          <Link href="/messages">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ChatWindow
            conversationId={id}
            messages={conversation.messages}
            currentUserId={session.user.id}
            otherUser={otherUser}
            sendMessageAction={sendMessage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
