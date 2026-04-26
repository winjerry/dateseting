'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { EVENT_PRICES_USD, EventType } from '@/shared/constants/event-client';
import { Link } from '@/core/i18n/navigation';
import { PaymentModal } from '@/shared/blocks/payment/payment-modal';
import { useAppContext } from '@/shared/contexts/app';
import { PricingItem } from '@/shared/types/blocks/pricing';

export default function ConfirmEventDraftPage() {
  const router = useRouter();
  const { isShowPaymentModal, setIsShowPaymentModal, configs } = useAppContext();
  const [draft, setDraft] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('event_draft');
      if (raw) {
        setDraft(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const proceedPayment = () => {
    if (!draft || loading) return;

    if (draft.eventId) {
      handleUpdateEvent();
      return;
    }
    
    // Check if payment selection is enabled
    if (configs.select_payment_enabled === 'true') {
      setIsShowPaymentModal(true);
    } else {
      // Use default provider
      handleCheckout(null, configs.default_payment_provider);
    }
  };

  const handleCheckout = async (item: PricingItem | null, provider?: string) => {
    setLoading(true);
    try {
      const payload = {
        ...draft,
        payment_provider: provider
      };

      const res = await fetch('/api/events/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || data.message || 'Payment initialization failed');
      }

      if (data.code !== 0) {
        throw new Error(data.message || 'Payment initialization failed');
      }

      if (data?.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Something went wrong');
      setLoading(false);
      setIsShowPaymentModal(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!draft?.eventId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${draft.eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          location: draft.location,
          eventDate: draft.eventDate,
          eventTime: draft.eventTime,
          eventEndTime: draft.eventEndTime,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update event');
      }

      sessionStorage.removeItem('event_draft');
      toast.success('Event updated');
      router.push(`/my-events/${draft.eventId}`);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
      setLoading(false);
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
  
  const backLink = draft?.eventId
    ? `/my-events/create?id=${draft.eventId}`
    : draft?.draftId
      ? `/my-events/create?draftId=${draft.draftId}`
      : '/my-events/create';
  
  // Construct a mock PricingItem for the modal
  const pricingItem: PricingItem = {
    title: `Event: ${draft.name}`,
    description: `Package: ${draft.eventType}`,
    amount: priceCents,
    currency: 'USD',
    interval: 'one-time',
    product_id: `event_${draft.eventType}`,
    product_name: `Event ${draft.eventType}`,
    price: `$${priceUSD}`,
    features: [],
    button: { title: 'Pay', url: '' }
  };

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
              <Button className="h-11 px-6" onClick={proceedPayment} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {draft.eventId ? 'Save Changes' : 'Proceed to Payment'}
              </Button>
              <Link href={backLink}>
                <Button variant="outline" className="h-11 px-6" disabled={loading}>Back to Edit</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {!draft.eventId && (
        <PaymentModal
          isLoading={loading}
          pricingItem={pricingItem}
          onCheckout={(item, provider) => handleCheckout(item, provider)}
        />
      )}
    </div>
  );
}
