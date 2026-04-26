'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useRouter } from '@/core/i18n/navigation';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  User,
  Users,
  Zap,
} from 'lucide-react';

import { signOut } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { LocaleSelector, ThemeToggler } from '@/shared/blocks/common';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import { useAppContext } from '@/shared/contexts/app';
import { toast } from 'sonner';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAppContext();
  const [email, setEmail] = useState('');
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@pairivo.com';

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

  const handleHostEvent = () => {
    if (user) {
      router.push('/my-events/create');
      return;
    }
    router.push('/sign-in');
  };

  const handleJoinWaitlist = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const normalizedEmail = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isValidEmail) {
      toast.error('Please enter a valid email address.');
      return;
    }

    const subject = encodeURIComponent('Pairivo Waitlist');
    const body = encodeURIComponent(
      `Please add me to the waitlist.\n\nEmail: ${normalizedEmail}`
    );
    toast.success('Opening your email app to join the waitlist.');
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Heart className="h-5 w-5 fill-white text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
              Pairivo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggler />
            <LocaleSelector type="button" />
            {user ? (
              <>
                <Link href="/my-events">
                  <Button variant="ghost" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">My Events</span>
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || ''} alt={user.name || ''} />
                        <AvatarFallback>
                          {(user.name || user.email || 'U').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm leading-none font-medium">
                          {user.name}
                        </p>
                        <p className="text-muted-foreground text-xs leading-none">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button variant="ghost" onClick={() => router.push('/sign-in')}>
                Log in
              </Button>
            )}
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50" />
        <div className="absolute top-20 left-10 h-20 w-20 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-10 bottom-20 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
          <div className="space-y-8">
            <Badge
              variant="outline"
              className="gap-2 bg-white/50 px-4 py-2 text-sm backdrop-blur dark:bg-background/50"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Offline Dating Experience Platform
            </Badge>

            <h1 className="text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
              Run Better
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {' '}
                Speed Dating Events{' '}
              </span>
              with Pairivo
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground">
              Pairivo helps organizers create events, manage participants, collect
              choices, calculate matches, and send follow-up emails in one flow.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-14 gap-2 rounded-full px-8 text-lg shadow-lg transition-all hover:shadow-xl"
                onClick={() => router.push('/faq')}
              >
                Participant Guide
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-full px-8 text-lg"
                onClick={handleHostEvent}
              >
                Host an Event
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Organizer Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Automated Match Emails</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative mx-auto aspect-square w-full max-w-lg">
              <div className="absolute top-1/2 left-1/2 flex h-80 w-64 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-primary/90 to-accent/90 p-6 text-white shadow-2xl">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                  <Heart className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold">Run Events</h3>
                <p className="mt-2 text-center text-white/80">
                  Create, match, and notify participants in minutes
                </p>
              </div>

              <div className="absolute top-0 right-0 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-lg dark:bg-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <span className="font-medium">Matching Completed</span>
              </div>

              <div className="absolute bottom-10 left-0 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-lg dark:bg-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Participants Registered</p>
                  <p className="text-xs text-muted-foreground">Event dashboard live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">
              Simple Process
            </Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Simple steps from registration to match delivery
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                icon: Calendar,
                title: 'Create Event',
                desc: 'Set date, venue, and capacity in minutes.',
                color:
                  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
              },
              {
                icon: Users,
                title: 'Register Participants',
                desc: 'Share event link and collect participant profiles.',
                color:
                  'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
              },
              {
                icon: Heart,
                title: 'Collect Choices',
                desc: 'Participants submit post-event preferences.',
                color:
                  'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
              },
              {
                icon: MessageCircle,
                title: 'Send Matches',
                desc: 'Calculate mutual matches and send result emails.',
                color:
                  'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
              },
            ].map((step, idx) => (
              <div key={idx} className="relative text-center">
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${step.color}`}
                >
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-lg">
                  {idx + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
                {idx < 3 && (
                  <div className="absolute top-8 -right-4 hidden w-8 text-muted-foreground/30 md:block">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">
              Our Advantage
            </Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Pairivo</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Built for practical event operations and participant experience
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Heart,
                title: 'Real Connections',
                desc: 'Offline events that prioritize face-to-face interactions.',
                color: 'text-pink-500',
              },
              {
                icon: Shield,
                title: 'Data-Safe Workflow',
                desc: 'Only mutual matches receive contact info after event completion.',
                color: 'text-blue-500',
              },
              {
                icon: Zap,
                title: 'Fast Operations',
                desc: 'From registration to notifications, managed in one place.',
                color: 'text-yellow-500',
              },
              {
                icon: Clock,
                title: 'Clear Timeline',
                desc: 'Status-driven flow for registration, matching, and follow-up.',
                color: 'text-green-500',
              },
            ].map((feature, idx) => (
              <Card key={idx} className="border-0 shadow-lg transition-all hover:shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">
              Organizer Feedback
            </Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">What Hosts Say</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Feedback from teams running real events with Pairivo
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: 'NYC Host Team',
                quote:
                  'The check-in and participant management flow is much smoother than spreadsheets.',
                rating: 5,
              },
              {
                name: 'Berlin Organizer',
                quote:
                  'Automatic match emails saved us hours after every event.',
                rating: 5,
              },
              {
                name: 'London Community Lead',
                quote:
                  'Participants understood the process quickly and completion rate improved.',
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-4 text-muted-foreground">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
                      {testimonial.name
                        .split(' ')
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')}
                    </div>
                    <span className="font-medium">{testimonial.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-accent py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Heart className="mx-auto mb-6 h-16 w-16 opacity-80" />
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Run Your Next Event?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/80">
            Launch an event page, register participants, and send match results
            with a complete organizer workflow.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="h-14 rounded-full px-8 text-lg"
              onClick={() => router.push('/faq')}
            >
              Participant Guide
            </Button>
            <Button
              size="lg"
              className="h-14 rounded-full px-8 text-lg"
              onClick={handleHostEvent}
            >
              Host Your Own Event
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t bg-background py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Heart className="h-4 w-4 fill-white text-white" />
                </div>
                <span className="font-bold">Pairivo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                SaaS platform for speed-dating organizers to run better events.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="transition hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="transition hover:text-primary">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="transition hover:text-primary">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/faq" className="transition hover:text-primary">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="transition hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="transition hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="transition hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy" className="transition hover:text-primary">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Stay Updated</h4>
              <form className="flex gap-2" onSubmit={handleJoinWaitlist}>
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-full"
                />
                <Button className="rounded-full px-6" type="submit">
                  Join
                </Button>
              </form>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Pairivo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
