'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { ImageUploader, ImageUploaderValue } from '@/shared/blocks/common/image-uploader';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const INTEREST_OPTIONS = [
  'Travel',
  'Music',
  'Movies',
  'Reading',
  'Sports',
  'Cooking',
  'Photography',
  'Art',
  'Gaming',
  'Fitness',
  'Dancing',
  'Food',
  'Nature',
  'Technology',
  'Fashion',
  'Pets',
  'Coffee',
  'Wine',
];

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const eventNo = params.eventNo as string;

  const [loading, setLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [photoItems, setPhotoItems] = useState<ImageUploaderValue[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    email: '',
    phone: '',
    interests: [] as string[],
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/public?eventNo=${eventNo}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load event');
        }
        setEvent(data.event);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load event');
      } finally {
        setEventLoading(false);
      }
    };

    fetchEvent();
  }, [eventNo]);

  const uploadedPhotoUrl = useMemo(
    () => photoItems.find((item) => item.status === 'uploaded' && item.url)?.url,
    [photoItems]
  );

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((item) => item !== interest)
        : prev.interests.length < 6
          ? [...prev.interests, interest]
          : prev.interests,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.interests.length < 2) {
      toast.error('Please select at least 2 interests');
      return;
    }


    setLoading(true);

    try {
      const res = await fetch('/api/participants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventNo,
          name: formData.name.trim(),
          age: Number(formData.age),
          gender: formData.gender,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          interests: formData.interests,
          photoUrl: uploadedPhotoUrl,
          source: 'link',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.participant?.choiceToken) {
        localStorage.setItem(`participant_token_${eventNo}`, data.participant.choiceToken);
        localStorage.setItem(`participant_id_${eventNo}`, data.participant.id);
      }

      toast.success('Registration successful');
      router.push(`/e/${eventNo}/success`);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  if (eventLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Event not found</CardTitle>
            <CardDescription>Please go back and try the event link again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 py-8 px-4">
      <div className="mx-auto max-w-lg">
        <Button variant="ghost" className="mb-4" onClick={() => router.push(`/e/${eventNo}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Button>

        <Card className="overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-primary to-accent p-6 text-center text-white">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <Heart className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold">Join the Event</h1>
            <p className="mt-1 text-sm text-white/80">{event.name}</p>
            <p className="mt-1 text-xs text-white/70">
              {formatDate(event.eventDate)} at {event.eventTime}
            </p>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Selfie <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <ImageUploader
                  emptyHint="Upload one clear selfie"
                  title="Selfie"
                  maxImages={1}
                  onChange={setPhotoItems}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Your age"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['male', 'female', 'other'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`rounded-md border px-3 py-2 text-sm capitalize ${
                        formData.gender === option
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-input'
                      }`}
                      onClick={() => setFormData({ ...formData, gender: option })}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Optional phone number"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Interests *</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.interests.length}/6 selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => {
                    const selected = formData.interests.includes(interest);
                    return (
                      <Badge
                        key={interest}
                        variant={selected ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-1"
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
