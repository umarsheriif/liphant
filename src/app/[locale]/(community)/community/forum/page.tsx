import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Brain, Puzzle, Heart, GraduationCap, MapPin, LogIn } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getForumCategories } from '@/lib/data/community';
import Link from 'next/link';

const categoryIcons: Record<string, React.ElementType> = {
  Brain: Brain,
  Puzzle: Puzzle,
  MessageSquare: MessageSquare,
  Heart: Heart,
  GraduationCap: GraduationCap,
  MapPin: MapPin,
};

export default async function ForumPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const categories = await getForumCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discussion Forum</h1>
          <p className="text-muted-foreground">
            Share experiences and get advice from other parents
          </p>
        </div>
        {!isLoggedIn && (
          <Button asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login to Post
            </Link>
          </Button>
        )}
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No categories yet</h3>
            <p className="mt-2 text-muted-foreground">
              Forum categories are being set up
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = categoryIcons[category.icon || 'MessageSquare'] || MessageSquare;
            return (
              <Link key={category.id} href={`/community/forum/${category.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {category.nameAr && (
                          <p className="text-sm text-muted-foreground">
                            {category.nameAr}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                    )}
                    <Badge variant="secondary">
                      {category._count.posts} posts
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
