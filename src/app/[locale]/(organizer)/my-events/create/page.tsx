'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    eventDate: '',
    eventTime: '19:00',
    eventEndTime: '21:00',
    eventType: 'standard',
  });

  useEffect(() => {
    const id = searchParams.get('id');
    const draftId = searchParams.get('draftId');

    if (draftId) {
      const fetchDraft = async () => {
        try {
          setLoading(true);
          // Clear any stale session storage to avoid conflicts
          sessionStorage.removeItem('event_draft');
          
          const res = await fetch(`/api/events/draft?orderNo=${draftId}`);
          const data = await res.json();
          if (res.ok && data.draft) {
            const d = data.draft;
            
            // Handle date parsing safely
            let formattedDate = '';
            if (d.eventDate) {
              try {
                // If it's already YYYY-MM-DD, use it. If ISO, slice it.
                formattedDate = d.eventDate.includes('T') 
                  ? d.eventDate.slice(0, 10) 
                  : d.eventDate;
              } catch (e) {
                console.warn('Date parsing failed', e);
              }
            }

            setFormData({
              name: d.name || '',
              description: d.description || '',
              location: d.location || '',
              eventDate: formattedDate,
              eventTime: d.eventTime || '19:00',
              eventEndTime: d.eventEndTime || '21:00',
              eventType: d.eventType || 'standard',
            });
          } else {
            toast.error('Draft data is empty or not found');
          }
        } catch (error) {
          console.error('Failed to fetch draft', error);
          toast.error('Failed to load draft');
        } finally {
          setLoading(false);
        }
      };
      fetchDraft();
      return;
    }

    if (!id) {
      // If no ID, try to load draft from sessionStorage
      try {
        const draft = sessionStorage.getItem('event_draft');
        if (draft) {
          const parsed = JSON.parse(draft);
          setFormData(parsed);
        }
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
      return;
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (res.ok && data.event) {
          const e = data.event;
          setFormData({
            name: e.name || '',
            description: e.description || '',
            location: e.location || '',
            eventDate: e.eventDate ? new Date(e.eventDate).toISOString().slice(0, 10) : '',
            eventTime: e.eventTime || '19:00',
            eventEndTime: e.eventEndTime || '21:00',
            eventType: e.eventType || 'standard',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date and time
    const eventStart = new Date(`${formData.eventDate}T${formData.eventTime}`);
    const eventEnd = new Date(`${formData.eventDate}T${formData.eventEndTime}`);
    const now = new Date();
    
    if (eventStart < now) {
      toast.error('Event start time must be in the future');
      return;
    }

    if (eventEnd <= eventStart) {
      toast.error('Event end time must be after start time');
      return;
    }

    // Check if duration is within 24 hours
    const durationHours = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);
    if (durationHours > 24) {
      toast.error('Event duration cannot exceed 24 hours');
      return;
    }

    setLoading(true);

    try {
      const draftId = searchParams.get('draftId');
      
      // If editing a draft, update it in the database immediately
      if (draftId) {
        const res = await fetch('/api/events/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNo: draftId, ...formData }),
        });
        
        if (!res.ok) {
          throw new Error('Failed to update draft');
        }
      }

      sessionStorage.setItem(
        'event_draft',
        JSON.stringify({
          ...formData,
          draftId,
          eventId: searchParams.get('id') || undefined,
        })
      );
      router.push('/my-events/create/confirm');
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

  const isEditing = !!searchParams.get('id') || !!searchParams.get('draftId');

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
              <CardTitle className="text-xl">{isEditing ? 'Edit Event' : 'Create New Event'}</CardTitle>
              <CardDescription>{isEditing ? 'Update your event details' : 'Set up your speed dating event in minutes'}</CardDescription>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Date *</Label>
                <Input 
                  id="eventDate" 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.eventDate} 
                  onChange={(e) => updateField('eventDate', e.target.value)} 
                  required 
                  className="h-11" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventTime">Start Time *</Label>
                <Input id="eventTime" type="time" value={formData.eventTime} onChange={(e) => updateField('eventTime', e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventEndTime">End Time *</Label>
                <Input 
                  id="eventEndTime" 
                  type="time" 
                  min={formData.eventTime}
                  value={formData.eventEndTime} 
                  onChange={(e) => updateField('eventEndTime', e.target.value)} 
                  required 
                  className="h-11" 
                />
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
                {isEditing ? 'Update & Continue' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
