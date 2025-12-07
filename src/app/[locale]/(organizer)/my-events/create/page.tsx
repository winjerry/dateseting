'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { toast } from 'sonner';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    eventDate: '',
    eventTime: '19:00',
    eventType: 'standard',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      toast.success('Event created successfully!');
      // Navigate to the newly created event's detail page
      if (data.event?.id) {
        router.push(`/my-events/${data.event.id}`);
      } else {
        router.push('/my-events');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <CalendarPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Create New Event</CardTitle>
              <CardDescription>Set up your speed dating event in minutes</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input id="name" placeholder="e.g., Speed Dating Night" value={formData.name} onChange={(e) => updateField('name', e.target.value)} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe your event..." value={formData.description} onChange={(e) => updateField('description', e.target.value)} rows={3} className="resize-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input id="location" placeholder="e.g., The Social Club, 123 Main St" value={formData.location} onChange={(e) => updateField('location', e.target.value)} required className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Date *</Label>
                <Input id="eventDate" type="date" value={formData.eventDate} onChange={(e) => updateField('eventDate', e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventTime">Time *</Label>
                <Input id="eventTime" type="time" value={formData.eventTime} onChange={(e) => updateField('eventTime', e.target.value)} required className="h-11" />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Event Package *</Label>
              <RadioGroup value={formData.eventType} onValueChange={(value) => updateField('eventType', value)} className="grid grid-cols-2 gap-4">
                <label htmlFor="standard" className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all ${formData.eventType === 'standard' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}>
                  <RadioGroupItem value="standard" id="standard" className="sr-only" />
                  {formData.eventType === 'standard' && <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">Selected</div>}
                  <span className="text-3xl font-bold text-primary">$49</span>
                  <span className="font-semibold mt-1">Standard</span>
                  <span className="text-sm text-muted-foreground">Up to 100 people</span>
                </label>
                <label htmlFor="large" className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all ${formData.eventType === 'large' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}>
                  <RadioGroupItem value="large" id="large" className="sr-only" />
                  {formData.eventType === 'large' && <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">Selected</div>}
                  <span className="text-3xl font-bold text-primary">$99</span>
                  <span className="font-semibold mt-1">Large</span>
                  <span className="text-sm text-muted-foreground">Up to 200 people</span>
                </label>
              </RadioGroup>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" className="flex-1 h-12 text-base font-semibold" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
