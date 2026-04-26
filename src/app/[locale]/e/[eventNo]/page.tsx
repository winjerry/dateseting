'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Clock, Heart, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';

export default function PublicEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventNo = params.eventNo as string;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventNo) {
      fetch(`/api/events/public?eventNo=${eventNo}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.event) {
            setEvent(data.event);
          } else {
            setError(data.error || 'Event not found');
          }
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load event');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [eventNo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center py-10 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold">Event Not Found</h2>
            <p className="text-muted-foreground">{error || "The event you're looking for doesn't exist or has been removed."}</p>
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const spotsLeft = event.capacity - event.currentParticipants;
  const percentFull = (event.currentParticipants / event.capacity) * 100;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="relative max-w-lg mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-background/90 px-4 py-2 rounded-full shadow-lg mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Speed Dating Event</span>
          </div>
          
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl mb-6">
            <Heart className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3">{event.name}</h1>
          <p className="text-muted-foreground">{event.description}</p>
        </div>
      </div>

      {/* Event Details Card */}
      <div className="max-w-lg mx-auto px-4 -mt-4 pb-8 space-y-4">
        <Card className="shadow-xl border-t-4 border-t-primary">
          <CardContent className="pt-6 space-y-6">
            {/* Event Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{formatDate(event.eventDate)}</p>
                  <p className="text-sm text-muted-foreground">Save the date!</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{event.eventTime}</p>
                  <p className="text-sm text-muted-foreground">Doors open 30 min early</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{event.location}</p>
                  <p className="text-sm text-muted-foreground">Easy parking available</p>
                </div>
              </div>
            </div>

            {/* Capacity Progress */}
            <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4 text-primary" />
                  {event.currentParticipants} registered
                </span>
                <span className="text-sm font-semibold text-primary">
                  {spotsLeft} spots left!
                </span>
              </div>
              <Progress value={percentFull} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {Math.round(percentFull)}% of spots filled
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              {event.isFull ? (
                <Button disabled className="w-full h-14 text-lg" size="lg">
                  Event Full
                </Button>
              ) : event.isAcceptingRegistrations ? (
                <Button 
                  className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" 
                  size="lg"
                  onClick={() => router.push(`/e/${eventNo}/register`)}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Register Now - It&apos;s Free!
                </Button>
              ) : (
                <Button disabled className="w-full h-14 text-lg" size="lg">
                  Registration Closed
                </Button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex justify-center gap-4 pt-2">
              <Badge variant="outline" className="text-xs py-1">
                ✓ Privacy Protected
              </Badge>
              <Badge variant="outline" className="text-xs py-1">
                ✓ Safe & Secure
              </Badge>
            </div>

            <div className="pt-2 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Already registered?{' '}
                <button 
                  onClick={() => router.push(`/e/${eventNo}/login`)}
                  className="text-primary font-medium hover:underline focus:outline-none"
                >
                  Click here to join
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-medium">Register</p>
                  <p className="text-sm text-muted-foreground">Quick signup, takes 2 minutes</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="font-medium">Attend Event</p>
                  <p className="text-sm text-muted-foreground">Meet & chat with other participants</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="font-medium">Submit Choices</p>
                  <p className="text-sm text-muted-foreground">Select who you&apos;d like to connect with</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center shrink-0">4</span>
                <div>
                  <p className="font-medium">Get Matched!</p>
                  <p className="text-sm text-muted-foreground">Mutual matches get each other&apos;s contact</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
