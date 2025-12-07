'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Loader2, Camera, X, ArrowLeft, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { toast } from 'sonner';

const INTEREST_OPTIONS = [
  { label: '✈️ Travel', value: 'Travel' },
  { label: '🎵 Music', value: 'Music' },
  { label: '🎬 Movies', value: 'Movies' },
  { label: '📚 Reading', value: 'Reading' },
  { label: '⚽ Sports', value: 'Sports' },
  { label: '🍳 Cooking', value: 'Cooking' },
  { label: '📷 Photography', value: 'Photography' },
  { label: '🎨 Art', value: 'Art' },
  { label: '🎮 Gaming', value: 'Gaming' },
  { label: '💪 Fitness', value: 'Fitness' },
  { label: '💃 Dancing', value: 'Dancing' },
  { label: '🍕 Food', value: 'Food' },
  { label: '🌲 Nature', value: 'Nature' },
  { label: '💻 Technology', value: 'Technology' },
  { label: '👗 Fashion', value: 'Fashion' },
  { label: '🐕 Pets', value: 'Pets' },
  { label: '☕ Coffee', value: 'Coffee' },
  { label: '🍷 Wine', value: 'Wine' },
];

// 模拟活动数据
const MOCK_EVENT = {
  name: 'Downtown Singles Mixer',
  eventDate: '2024-12-20T00:00:00Z',
  eventTime: '19:00',
  location: 'The Social Club, Downtown',
};

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const eventNo = params.eventNo as string;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    interests: [] as string[],
  });

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
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

    // 模拟提交延迟
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success('Registration successful!');
    router.push(`/e/${eventNo}/success`);

    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push(`/e/${eventNo}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Event
        </Button>

        <Card className="overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-accent p-6 text-white text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
              <Heart className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold">Join the Event</h1>
            <p className="text-white/80 text-sm mt-1">
              {MOCK_EVENT.name}
            </p>
            <p className="text-white/60 text-xs mt-1">
              {formatDate(MOCK_EVENT.eventDate)} at {MOCK_EVENT.eventTime}
            </p>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Profile Preview */}
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  placeholder="Your age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll send match results to this email
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12"
                />
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Interests *</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.interests.length}/6 selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map(({ label, value }) => (
                    <Badge
                      key={value}
                      variant={formData.interests.includes(value) ? 'default' : 'outline'}
                      className={`cursor-pointer py-2 px-3 text-sm transition-all ${
                        formData.interests.includes(value) 
                          ? 'shadow-md scale-105' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => toggleInterest(value)}
                    >
                      {label}
                      {formData.interests.includes(value) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select 2-6 interests to help find great matches
                </p>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold shadow-lg" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5 mr-2" />
                    Complete Registration
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By registering, you agree to participate in this event.
                Your contact info is only shared with mutual matches.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
