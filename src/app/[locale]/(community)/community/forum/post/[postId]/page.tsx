import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pin, Lock, Eye, MessageSquare, ArrowLeft, LogIn } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getPostById } from '@/lib/data/community';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { addComment } from './actions';

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default async function ForumPostPage({ params }: PageProps) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const { postId } = await params;
  const post = await getPostById(postId);

  if (!post) notFound();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/community/forum/${post.category.slug}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {post.category.name}
        </Link>
      </Button>

      {/* Post */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-2">
            {post.isPinned && (
              <Badge variant="default" className="flex items-center gap-1">
                <Pin className="h-3 w-3" />
                Pinned
              </Badge>
            )}
            {post.isLocked && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl">{post.title}</CardTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author.avatarUrl || undefined} />
                <AvatarFallback>{getInitials(post.author.fullName)}</AvatarFallback>
              </Avatar>
              <span>{post.author.fullName}</span>
            </div>
            <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.viewCount} views
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {post.content.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {post.comments.length} Comments
        </h2>

        {post.comments.length > 0 && (
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatarUrl || undefined} />
                      <AvatarFallback>{getInitials(comment.author.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{comment.author.fullName}</span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Comment Form */}
        {!post.isLocked && (
          <Card>
            <CardContent className="p-4">
              {isLoggedIn ? (
                <form action={addComment}>
                  <input type="hidden" name="postId" value={post.id} />
                  <Textarea
                    name="content"
                    placeholder="Write a comment..."
                    className="mb-3"
                    rows={3}
                    required
                  />
                  <Button type="submit">Post Comment</Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-3">Login to join the discussion</p>
                  <Button asChild>
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login to Comment
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
