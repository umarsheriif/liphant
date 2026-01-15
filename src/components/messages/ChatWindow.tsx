'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  sender: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

interface ChatWindowProps {
  conversationId: string;
  messages: Message[];
  currentUserId: string;
  otherUser: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    teacherProfile?: {
      isVerified: boolean;
    } | null;
  };
  sendMessageAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

export function ChatWindow({
  conversationId,
  messages,
  currentUserId,
  otherUser,
  sendMessageAction,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const formData = new FormData();
    formData.append('conversationId', conversationId);
    formData.append('content', newMessage);

    const result = await sendMessageAction(formData);
    setSending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setNewMessage('');
    }
  };

  const otherUserInitials = otherUser.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b p-4">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.avatarUrl || undefined} />
            <AvatarFallback>{otherUserInitials}</AvatarFallback>
          </Avatar>
          {otherUser.teacherProfile?.isVerified && (
            <div className="absolute -bottom-1 -right-1 rounded-full bg-accent p-0.5">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        <div>
          <h2 className="font-semibold">{otherUser.fullName}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isMe = message.senderId === currentUserId;
              const showDate =
                index === 0 ||
                new Date(message.createdAt).toDateString() !==
                  new Date(messages[index - 1].createdAt).toDateString();

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="my-4 flex justify-center">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        {format(new Date(message.createdAt), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      'flex items-end gap-2',
                      isMe ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {!isMe && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {message.sender.fullName[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2',
                        isMe
                          ? 'rounded-br-sm bg-primary text-primary-foreground'
                          : 'rounded-bl-sm bg-muted'
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={cn(
                          'mt-1 text-xs',
                          isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}
                      >
                        {format(new Date(message.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || sending}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
