import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getConversationsForUser } from '@/lib/data/messages';
import { ConversationList } from '@/components/messages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MessagesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect('/login');

  const conversations = await getConversationsForUser(
    session.user.id,
    session.user.role as 'parent' | 'teacher'
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Conversation List */}
      <Card className="w-full max-w-md">
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

      {/* Empty State for Desktop */}
      <Card className="hidden flex-1 md:flex">
        <CardContent className="flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Select a conversation to view messages</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
