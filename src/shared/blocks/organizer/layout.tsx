'use client';

import { ReactNode } from 'react';
import { Link, useRouter } from '@/core/i18n/navigation';
import { usePathname } from 'next/navigation';
import { Heart, CalendarPlus, LayoutDashboard } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { useAppContext } from '@/shared/contexts/app';
import { signOut } from '@/core/auth/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';

interface OrganizerLayoutProps {
  children: ReactNode;
}

export function OrganizerLayout({ children }: OrganizerLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAppContext();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
        },
      },
    });
    router.push('/');
  };

  const navItems: { href: string; label: string; icon: any }[] = [
    { href: '/my-events', label: 'My Events', icon: LayoutDashboard },
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

            <div className="flex items-center gap-4">
                <Link href="/my-events/create">
                  <Button size="sm" className="gap-2">
                    <CalendarPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Create Event</span>
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-auto">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {(user?.name || user?.email || 'u').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name || user?.email || 'User'}</p>
                        {user?.email && (
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
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
