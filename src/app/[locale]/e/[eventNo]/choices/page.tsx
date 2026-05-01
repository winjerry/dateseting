'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Loader2, CheckCircle, Send, ArrowLeft, Sparkles, LogOut, Lock, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';

const INTEREST_COLORS: Record<string, string> = {
  Travel: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  Music: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  Coffee: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  Photography: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
  Hiking: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  Food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  Art: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  Dancing: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
  Movies: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  Sports: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  Gaming: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
  Tech: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
  Reading: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  Cooking: 'bg-lime-100 text-lime-700 dark:bg-lime-900/50 dark:text-lime-300',
  Yoga: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300',
  Fitness: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
};

export default function ChoicesPage() {
  const params = useParams();
  const router = useRouter();
  const eventNo = params.eventNo as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; age: number; photoUrl: string | null } | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState<string | null>(null);
  const [choiceDeadline, setChoiceDeadline] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const fetchParticipants = async () => {
      const token = localStorage.getItem(`participant_token_${eventNo}`);
      
      if (!token) {
        toast.error('Session expired. Please register again.');
        router.push(`/e/${eventNo}/register`);
        return;
      }

      try {
        const res = await fetch(`/api/participants/choices?token=${token}`);
        const data = await res.json();

        if (res.status === 401) {
          // Token expired or invalid - clear and redirect to login
          localStorage.removeItem(`participant_token_${eventNo}`);
          localStorage.removeItem(`participant_id_${eventNo}`);
          toast.error('Session expired. Please log in again.');
          router.push(`/e/${eventNo}/login`);
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load participants');
        }

        if (data.currentUser) {
          setCurrentUser(data.currentUser);
        }
        setParticipants(data.participants);
        if (data.choices && Array.isArray(data.choices)) {
          setSelectedIds(data.choices);
        }
        if (data.hasSubmitted) {
          setSubmitted(true);
        }
        if (data.isLocked) {
          setIsLocked(true);
          setLockReason(data.lockReason);
        }
        if (data.choiceDeadline) {
          setChoiceDeadline(data.choiceDeadline);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        toast.error('Failed to load participants');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [eventNo, router]);

  // 倒计时计时器
  useEffect(() => {
    if (!choiceDeadline || isLocked) return;

    const updateCountdown = () => {
      const now = new Date();
      const deadline = new Date(choiceDeadline);
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('');
        setIsLocked(true);
        setLockReason('deadline');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        setCountdown(`${days}d ${remainingHours}h ${minutes.toString().padStart(2, '0')}m`);
      } else {
        setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(timer);
  }, [choiceDeadline, isLocked]);

  const toggleSelection = (id: string) => {
    if (isLocked) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one person');
      return;
    }
    
    setSubmitting(true);
    const token = localStorage.getItem(`participant_token_${eventNo}`);

    try {
      const res = await fetch('/api/participants/choices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          choices: selectedIds
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem(`participant_token_${eventNo}`);
        localStorage.removeItem(`participant_id_${eventNo}`);
        toast.error('Session expired. Please log in again.');
        router.push(`/e/${eventNo}/login`);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitted(true);
      toast.success('Your choices have been submitted!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    const isEarly = error.toLowerCase().includes('after the event ends');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10">
            {isEarly ? (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Almost Time!</h2>
                <p className="text-muted-foreground mb-6">Matching choices will open after the event ends. Please check back later.</p>
                <Button onClick={() => router.push(`/e/${eventNo}/success`)} className="w-full">View Event Details</Button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-2">Oops!</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4">
        <Card className="max-w-md w-full text-center shadow-xl border-0">
          <div className="h-2 bg-gradient-to-r from-green-400 to-primary" />
          <CardContent className="pt-10 pb-10">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Choices Submitted! 💕</h2>
            <p className="text-muted-foreground mb-6">
              Thank you! You&apos;ll receive an email with your matches soon.
              Fingers crossed! 🤞
            </p>
            
            <Button 
              variant="outline" 
              onClick={() => setSubmitted(false)}
              className="w-full mb-4"
            >
              Change My Choices
            </Button>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-left">
              <p className="font-medium">What happens next?</p>
              <p className="text-muted-foreground mt-1">
                We&apos;ll calculate mutual matches and send you an email with 
                the contact info of anyone who also selected you.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentUser && (
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src={currentUser.photoUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {currentUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Who caught your eye?
                </h1>
                {currentUser && (
                  <p className="text-xs text-muted-foreground">Logged in as <span className="font-medium text-foreground">{currentUser.name}</span></p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {selectedIds.length} selected
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Log out"
                onClick={() => {
                  localStorage.removeItem(`participant_token_${eventNo}`);
                  localStorage.removeItem(`participant_id_${eventNo}`);
                  toast.success('Logged out');
                  router.push(`/e/${eventNo}/login`);
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Locked Banner */}
      {isLocked && (
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="py-4">
              <div className="flex gap-3 items-center">
                <Lock className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {lockReason === 'matched' 
                    ? 'Matching has been completed. Choices are now locked.'
                    : 'The choice submission deadline has passed. Choices are now locked.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Countdown + Instructions */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {/* Countdown */}
        {countdown && !isLocked && (
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Choice deadline</span>
                </div>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{countdown}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!isLocked && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex gap-3">
                <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm">
                  <strong>How it works:</strong> Tap on the people you&apos;d like to get to know better. 
                  If they also select you, it&apos;s a match! You&apos;ll both receive each other&apos;s contact info.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Participants Grid */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {participants.map((p) => (
            <Card
              key={p.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedIds.includes(p.id)
                  ? 'ring-2 ring-primary bg-primary/5 shadow-lg scale-[1.02]'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => toggleSelection(p.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                      <AvatarImage src={p.photoUrl} />
                      <AvatarFallback 
                        className={`text-xl font-semibold ${
                          selectedIds.includes(p.id) 
                            ? 'bg-primary text-white' 
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {p.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedIds.includes(p.id) && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                        <Heart className="h-3.5 w-3.5 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{p.name}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {p.gender && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            p.gender === 'male' ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' :
                            p.gender === 'female' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                            'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400'
                          }`}>
                            {p.gender === 'male' ? 'M' : p.gender === 'female' ? 'F' : 'O'}
                          </span>
                        )}
                        <span>{p.age}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.interests.map((interest: string) => (
                        <span
                          key={interest}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            INTEREST_COLORS[interest] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Fixed Submit Button - hidden when locked */}
      {!isLocked && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm">
                <span className="font-semibold">{selectedIds.length}</span>
                <span className="text-muted-foreground"> {selectedIds.length === 1 ? 'person' : 'people'} selected</span>
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || selectedIds.length === 0}
                size="lg"
                className="gap-2 px-8 h-12 text-base font-semibold shadow-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Choices
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
