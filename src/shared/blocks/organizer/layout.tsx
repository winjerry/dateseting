'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, CalendarPlus, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { useAppContext } from '@/shared/contexts/app';
import { signOut } from '@/core/auth/client';

interface OrganizerLayoutProps {
  children: ReactNode;
}

export function OrganizerLayout({ children }: OrganizerLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAppContext();

  const handleSignOut = () =>
    signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
        },
      },
    });

  const navItems = [
    { href: '/my-events', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/my-events/create', label: 'Create Event', icon: CalendarPlus },
  ];

  const isActive = (href: string) => {
    if (href === '/my-events') {
      return pathname === '/my-events' || pathname === '/en/my-events';
    }
    return pathname.includes(href);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="font-bold text-lg hidden sm:inline">Date, Set, Match</span>
            </Link>

            {/* Center Nav */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm">
                {user?.name || user?.email || 'User'}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="ml-2 gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 Date, Set, Match. Organizer Portal.
          </p>
        </div>
      </footer>
    </div>
  );
}
