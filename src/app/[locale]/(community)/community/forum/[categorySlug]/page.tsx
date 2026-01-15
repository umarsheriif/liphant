import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Pin, Eye, LogIn, ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getPostsByCategory } from '@/lib/data/community';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface PageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ForumCategoryPage({ params, searchParams }: PageProps) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const { categorySlug } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1');

  const result = await getPostsByCategory(categorySlug, page, 20);
  if (!result) notFound();

  const { category, posts, total, totalPages } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/community/forum">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
        </div>
        {isLoggedIn ? (
          <Button asChild>
            <Link href={`/community/forum/${categorySlug}/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login to Post
            </Link>
          </Button>
        )}
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
            <p className="mt-2 text-muted-foreground">
              Be the first to start a discussion!
            </p>
            {isLoggedIn ? (
              <Button className="mt-4" asChild>
                <Link href={`/community/forum/${categorySlug}/new`}>Create Post</Link>
              </Button>
            ) : (
              <Button className="mt-4" asChild>
                <Link href="/login">Login to Create Post</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{total} posts</p>
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/community/forum/post/${post.id}`}
                className="block"
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.isPinned && (
                            <Pin className="h-4 w-4 text-primary fill-primary" />
                          )}
                          <h3 className="font-semibold truncate">{post.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.content}
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>by {post.author.fullName}</span>
                          <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {post.commentCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link href={`/community/forum/${categorySlug}?page=${page - 1}`}>
                    Previous
                  </Link>
                </Button>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Button variant="outline" asChild>
                  <Link href={`/community/forum/${categorySlug}?page=${page + 1}`}>
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
