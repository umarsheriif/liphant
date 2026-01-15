import Link from 'next/link';
import { LanguageSwitcher, Header, Footer } from '@/components/layout';
import { Logo } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Calendar,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  Users,
  LogIn,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { auth, signOut } from '@/lib/auth';

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  // If not logged in, show public layout
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-6">{children}</div>
        </main>
        <Footer />
      </div>
    );
  }

  // Logged in user gets dashboard-style layout
  const user = {
    name: session.user.name || 'User',
    email: session.user.email || '',
    role: session.user.role,
    avatar: session.user.image,
  };

  const navItems = [
    { href: '/community', icon: Home, label: 'Overview' },
    { href: '/community/events', icon: Calendar, label: 'Events' },
    { href: '/community/forum', icon: MessageSquare, label: 'Forum' },
  ];

  const dashboardLink = user.role === 'teacher'
    ? '/teacher/dashboard'
    : user.role === 'center_admin'
    ? '/center/dashboard'
    : '/parent/dashboard';

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-background md:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center">
              <Logo variant="header" size="md" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            <div className="mb-2">
              <Link
                href={dashboardLink}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Home className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>
            <div className="border-t pt-2">
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                Community
              </p>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center border-b px-6">
                  <Link href="/" className="flex items-center">
                    <Logo variant="header" size="md" />
                  </Link>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                  <Link
                    href={dashboardLink}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Home className="h-4 w-4" />
                    Back to Dashboard
                  </Link>
                  <div className="border-t pt-2 mt-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden md:block" />

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardLink}>
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form
                    action={async () => {
                      'use server';
                      await signOut({ redirectTo: '/login' });
                    }}
                  >
                    <button type="submit" className="flex w-full items-center text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-muted/30 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
