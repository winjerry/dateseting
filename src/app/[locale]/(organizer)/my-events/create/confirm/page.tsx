'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { EVENT_PRICES_USD, EventType } from '@/shared/constants/event-client';
import { Link } from '@/core/i18n/navigation';

export default function ConfirmEventDraftPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<any | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('event_draft');
      if (raw) {
        setDraft(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const proceedPayment = async () => {
    if (!draft) return;
    const res = await fetch('/api/events/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    const data = await res.json();
    if (res.ok && data?.data?.checkoutUrl) {
      window.location.href = data.data.checkoutUrl;
    }
  };

  if (!draft) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>No draft found</CardTitle>
            <CardDescription>Please go back to edit your event</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/my-events/create">
              <Button variant="outline">Back to Edit</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const priceCents = EVENT_PRICES_USD[draft.eventType as EventType];
  const priceUSD = ((priceCents || 0) / 100).toFixed(2);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-xl">Confirm Event Details</CardTitle>
          <CardDescription>Please review your event information before payment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Event Name</div>
              <div className="font-medium">{draft.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Location</div>
              <div className="font-medium">{draft.location}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Date</div>
              <div className="font-medium">{draft.eventDate}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Time</div>
              <div className="font-medium">{draft.eventTime}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Package</div>
              <div className="font-medium capitalize">{draft.eventType}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-muted-foreground">Description</div>
              <div className="font-medium whitespace-pre-wrap">{draft.description || '-'}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-lg font-semibold">${priceUSD} USD</div>
            </div>
            <div className="flex gap-3">
              <Button className="h-11 px-6" onClick={proceedPayment}>Proceed to Payment</Button>
              <Link href="/my-events/create">
                <Button variant="outline" className="h-11 px-6">Back to Edit</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
