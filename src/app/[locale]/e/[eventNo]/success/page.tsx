'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CalendarCheck,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Heart,
  Loader2,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';

export default function RegistrationSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const eventNo = params.eventNo as string;

  const [event, setEvent] = useState<any>(null);
  const [icebreakers, setIcebreakers] = useState<any>({ icebreakers: [], deeper: [] });
  const [loading, setLoading] = useState(true);
  const [openIcebreaker, setOpenIcebreaker] = useState(true);
  const [openDeeper, setOpenDeeper] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/events/public?eventNo=${eventNo}`);
        const data = await res.json();
        if (data.success) {
          setEvent(data.event);
          setIcebreakers(data.icebreakers || { icebreakers: [], deeper: [] });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventNo]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

  const handleAddToCalendar = () => {
    if (!event) return;

    const startDate = new Date(`${event.eventDate.split('T')[0]}T${event.eventTime}`);
    const endDate = event.eventEndTime
      ? new Date(`${event.eventDate.split('T')[0]}T${event.eventEndTime}`)
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatTime = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${formatTime(startDate)}/${formatTime(endDate)}&details=${encodeURIComponent(`Join us for ${event.name}!`)}&location=${encodeURIComponent(event.location)}`;

    window.open(googleCalendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Event not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canStartMatching = event.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-primary/5 px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        <Card className="overflow-hidden text-center shadow-xl">
          <div className="h-3 bg-gradient-to-r from-green-400 via-primary to-accent" />
          <CardHeader className="pb-4 pt-8">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">You&apos;re In!</CardTitle>
            <p className="mt-2 text-muted-foreground">
              Registration confirmed. We&apos;ll see you at the event.
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pb-8">
            <div className="rounded-xl border bg-gradient-to-r from-primary/5 to-accent/5 p-5 text-left">
              <p className="font-semibold text-lg">{event.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(event.eventDate)} at {event.eventTime}
              </p>
              <p className="text-sm text-muted-foreground">{event.location}</p>
            </div>

            <div className="text-left">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                What&apos;s next?
              </p>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Check your email for confirmation.</li>
                <li>Add the event to your calendar.</li>
                <li>Save the conversation starters below.</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Button
                className="w-full gap-2"
                disabled={!canStartMatching}
                onClick={() => router.push(`/e/${eventNo}/choices`)}
              >
                <Heart className="h-4 w-4" />
                {canStartMatching ? 'Start Matching' : 'Matching opens after the event'}
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={handleAddToCalendar}>
                <CalendarCheck className="h-4 w-4" />
                Add to Calendar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Conversation Starters
              </CardTitle>
              <Badge variant="outline">Save these</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Collapsible open={openIcebreaker} onOpenChange={setOpenIcebreaker}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between rounded-lg bg-blue-50 p-4">
                  <span className="font-semibold">Icebreaker Questions</span>
                  {openIcebreaker ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-1 pt-3">
                <ul className="space-y-3 text-sm">
                  {icebreakers.icebreakers?.length ? (
                    icebreakers.icebreakers.map((q: any, idx: number) => (
                      <li key={q.id || idx} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                          {idx + 1}
                        </span>
                        <span>{q.question}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground italic">No icebreaker questions available yet.</li>
                  )}
                </ul>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openDeeper} onOpenChange={setOpenDeeper}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between rounded-lg bg-purple-50 p-4">
                  <span className="font-semibold">Getting to Know You</span>
                  {openDeeper ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-1 pt-3">
                <ul className="space-y-3 text-sm">
                  {icebreakers.deeper?.length ? (
                    icebreakers.deeper.map((q: any, idx: number) => (
                      <li key={q.id || idx} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                          {idx + 1}
                        </span>
                        <span>{q.question}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground italic">No deeper questions available yet.</li>
                  )}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
