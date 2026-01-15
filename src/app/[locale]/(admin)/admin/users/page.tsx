import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Search } from 'lucide-react';
import { getUsers } from '@/lib/data/admin/users';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { UserActions } from './UserActions';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    suspended?: string;
    page?: string;
  }>;
}

const roleBadgeColors: Record<string, string> = {
  parent: 'bg-blue-100 text-blue-800',
  teacher: 'bg-green-100 text-green-800',
  center_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
};

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || '';
  const role = params.role as 'parent' | 'teacher' | 'center_admin' | 'admin' | undefined;
  const suspended = params.suspended === 'true';
  const page = parseInt(params.page || '1');

  const { users, total, totalPages } = await getUsers({
    search: search || undefined,
    role: role || undefined,
    isSuspended: params.suspended ? suspended : undefined,
    page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage platform users and account status
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {total} users
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search by name or email..."
                defaultValue={search}
                className="pl-9"
              />
            </div>
            <Select name="role" defaultValue={role || 'all'}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="parent">Parents</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="center_admin">Centers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select name="suspended" defaultValue={params.suspended || 'all'}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="false">Active</SelectItem>
                <SelectItem value="true">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Filter</Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No users found matching your criteria
            </p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback>
                        {user.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.fullName}</p>
                        <Badge
                          variant="secondary"
                          className={roleBadgeColors[user.role]}
                        >
                          {user.role}
                        </Badge>
                        {user.isSuspended && (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p>
                        {user._count.bookingsAsParent + user._count.bookingsAsTeacher} bookings
                      </p>
                      <p className="text-muted-foreground">
                        {user._count.reviewsGiven + user._count.reviewsReceived} reviews
                      </p>
                    </div>
                    <UserActions
                      userId={user.id}
                      userName={user.fullName}
                      isSuspended={user.isSuspended}
                      isAdmin={user.role === 'admin'}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link
                    href={`/admin/users?${new URLSearchParams({
                      ...(search && { search }),
                      ...(role && { role }),
                      ...(params.suspended && { suspended: params.suspended }),
                      page: String(page - 1),
                    })}`}
                  >
                    Previous
                  </Link>
                </Button>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Button variant="outline" asChild>
                  <Link
                    href={`/admin/users?${new URLSearchParams({
                      ...(search && { search }),
                      ...(role && { role }),
                      ...(params.suspended && { suspended: params.suspended }),
                      page: String(page + 1),
                    })}`}
                  >
                    Next
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
