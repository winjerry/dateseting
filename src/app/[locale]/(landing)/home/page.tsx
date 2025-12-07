'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Users, Sparkles, ArrowRight, CheckCircle, Calendar, MessageCircle, Star, Shield, Clock, Zap } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';

// 模拟即将到来的活动
const UPCOMING_EVENTS = [
  {
    id: '1',
    name: 'Downtown Singles Mixer',
    date: 'Dec 20, 2024',
    time: '7:00 PM',
    location: 'San Francisco, CA',
    spotsLeft: 55,
    image: '🌃',
  },
  {
    id: '2',
    name: 'Tech Industry Meet & Greet',
    date: 'Dec 28, 2024',
    time: '6:30 PM',
    location: 'Palo Alto, CA',
    spotsLeft: 32,
    image: '💻',
  },
  {
    id: '3',
    name: 'New Year Romance Night',
    date: 'Jan 5, 2025',
    time: '8:00 PM',
    location: 'Los Angeles, CA',
    spotsLeft: 78,
    image: '🎉',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Date, Set, Match
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push('/sign-in')}>
                Log in
              </Button>
              <Button onClick={() => router.push('/sign-up')} className="rounded-full px-6">
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <Badge variant="outline" className="text-sm py-2 px-4 gap-2 bg-white/50 dark:bg-background/50 backdrop-blur">
                <Sparkles className="h-4 w-4 text-primary" />
                Real Connections, Real People
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Find Your 
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Perfect Match </span>
                with Speed Dating Events
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                Tired of endless swiping? Our events bring real people together for real connections. 
                Meet like-minded singles in a fun, relaxed atmosphere.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full px-8 h-14 text-lg gap-2 shadow-lg hover:shadow-xl transition-all">
                  Find an Event Near You
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg">
                  Host an Event
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>500+ Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>10,000+ Matches</span>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Main card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-gradient-to-br from-primary/90 to-accent/90 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-white p-6">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <Heart className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold">Find Love</h3>
                  <p className="text-white/80 text-center mt-2">Connect with amazing people at our events</p>
                </div>
                
                {/* Floating cards */}
                <div className="absolute top-0 right-0 bg-white dark:bg-card rounded-2xl shadow-lg p-4 flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-medium">It&apos;s a Match!</span>
                </div>
                
                <div className="absolute bottom-10 left-0 bg-white dark:bg-card rounded-2xl shadow-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">45 people joined</p>
                    <p className="text-xs text-muted-foreground">Downtown Mixer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Simple Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple steps to find your perfect match
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Calendar, title: 'Find an Event', desc: 'Browse upcoming speed dating events in your area', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
              { icon: Users, title: 'Meet & Mingle', desc: 'Attend the event and chat with other singles', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
              { icon: Heart, title: 'Make Your Choices', desc: 'Select the people you\'d like to connect with', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
              { icon: MessageCircle, title: 'Get Matched!', desc: 'Mutual matches receive each other\'s contact info', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-2xl ${step.color} flex items-center justify-center mb-4`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold shadow-lg">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 text-muted-foreground/30">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Our Advantage</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We&apos;re dedicated to helping you make meaningful connections
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: 'Real Connections', desc: 'Meet real people face-to-face, not just swipe on profiles', color: 'text-pink-500' },
              { icon: Shield, title: 'Safe & Vetted', desc: 'All events are professionally organized in safe venues', color: 'text-blue-500' },
              { icon: Zap, title: 'Fun & Relaxed', desc: 'Enjoyable atmosphere designed to reduce first-date nerves', color: 'text-yellow-500' },
              { icon: Clock, title: 'Efficient Matching', desc: 'Our system ensures you meet compatible people quickly', color: 'text-green-500' },
            ].map((feature, idx) => (
              <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 mx-auto rounded-xl bg-muted flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <Badge variant="outline" className="mb-4">Events</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Upcoming Events</h2>
            </div>
            <Button variant="outline" className="rounded-full gap-2">
              View All Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {UPCOMING_EVENTS.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group">
                <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                  {event.image}
                </div>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {event.date} at {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {event.location}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {event.spotsLeft} spots left
                    </Badge>
                    <Button size="sm" className="rounded-full">Book Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Success Stories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Love Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from couples who found their match at our events
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah & Michael', quote: 'We met at a Downtown Mixer and instantly clicked. Three years later, we\'re engaged!', rating: 5 },
              { name: 'Emily & David', quote: 'The event was so fun and relaxed. I never expected to meet my soul mate there!', rating: 5 },
              { name: 'Jessica & Tom', quote: 'Best decision ever to attend. The matching system is brilliant - we had so much in common!', rating: 5 },
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                      {testimonial.name.split(' ')[0][0]}{testimonial.name.split(' ')[2][0]}
                    </div>
                    <span className="font-medium">{testimonial.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heart className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Match?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Join thousands of singles who have found love at our events. Your perfect match might be waiting at the next one!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="rounded-full px-8 h-14 text-lg">
              Browse Events
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-white text-white hover:bg-white/10">
              Host Your Own Event
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white fill-white" />
                </div>
                <span className="font-bold">Date, Set, Match</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Bringing real people together for real connections since 2020.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Stay Updated</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="Your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-full"
                />
                <Button className="rounded-full px-6">Join</Button>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 Date, Set, Match. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
