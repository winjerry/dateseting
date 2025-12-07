'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, ChevronDown, ChevronUp, Heart, Camera, Sparkles, Share2, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { Badge } from '@/shared/components/ui/badge';

// 模拟活动数据
const MOCK_EVENT = {
  name: 'Downtown Singles Mixer',
  eventDate: '2024-12-20T00:00:00Z',
  eventTime: '19:00',
  location: 'The Social Club, 123 Main Street, Downtown',
};

// 模拟破冰问题数据
const MOCK_ICEBREAKERS = {
  icebreakers: [
    { id: '1', question: "What's your favorite way to spend a weekend?" },
    { id: '2', question: "If you could travel anywhere right now, where would you go?" },
    { id: '3', question: "What's the last show you binge-watched?" },
    { id: '4', question: "Are you a morning person or a night owl?" },
    { id: '5', question: "What's your hidden talent?" },
  ],
  deeper: [
    { id: '6', question: "What are you most passionate about in life?" },
    { id: '7', question: "Where do you see yourself in 5 years?" },
    { id: '8', question: "What makes you laugh the hardest?" },
    { id: '9', question: "What's the most meaningful thing on your bucket list?" },
    { id: '10', question: "What's most important to you in a relationship?" },
  ],
};

export default function RegistrationSuccessPage() {
  const params = useParams();
  const eventNo = params.eventNo as string;

  const [openIcebreaker, setOpenIcebreaker] = useState(true);
  const [openDeeper, setOpenDeeper] = useState(true);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-primary/5 dark:from-green-900/20 dark:via-background dark:to-primary/10 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Success Animation Card */}
        <Card className="overflow-hidden text-center border-0 shadow-xl">
          {/* Confetti-like gradient top */}
          <div className="h-3 bg-gradient-to-r from-green-400 via-primary to-accent" />
          
          <CardHeader className="pb-4 pt-8">
            {/* Animated success icon */}
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 flex items-center justify-center mb-4 shadow-lg animate-pulse">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-primary bg-clip-text text-transparent">
              You&apos;re In! 🎉
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Registration confirmed. See you at the event!
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4 pb-8">
            {/* Event Summary */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-5 text-left border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{MOCK_EVENT.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(MOCK_EVENT.eventDate)} at {MOCK_EVENT.eventTime}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {MOCK_EVENT.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="text-left">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                What&apos;s Next?
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 pl-5">
                <li>📧 Check your email for confirmation</li>
                <li>📅 Add event to your calendar</li>
                <li>💡 Review the conversation starters below!</li>
              </ol>
            </div>

            {/* Add to Calendar Button */}
            <Button variant="outline" className="w-full gap-2">
              <Share2 className="h-4 w-4" />
              Add to Calendar
            </Button>
          </CardContent>
        </Card>

        {/* Conversation Starters Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Conversation Starters
              </CardTitle>
              <Badge variant="outline" className="text-xs gap-1">
                <Camera className="h-3 w-3" />
                Screenshot this!
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Use these questions to break the ice at the event
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Icebreaker Questions */}
            <Collapsible open={openIcebreaker} onOpenChange={setOpenIcebreaker}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-lg"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    🧊 Icebreaker Questions
                  </span>
                  {openIcebreaker ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 px-1">
                <ul className="space-y-3">
                  {MOCK_ICEBREAKERS.icebreakers.map((q, idx) => (
                    <li key={q.id} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-medium text-xs">
                        {idx + 1}
                      </span>
                      <span>{q.question}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>

            {/* Deeper Questions */}
            <Collapsible open={openDeeper} onOpenChange={setOpenDeeper}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50 rounded-lg"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    💭 Getting to Know You
                  </span>
                  {openDeeper ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 px-1">
                <ul className="space-y-3">
                  {MOCK_ICEBREAKERS.deeper.map((q, idx) => (
                    <li key={q.id} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 font-medium text-xs">
                        {idx + 1}
                      </span>
                      <span>{q.question}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Pro Tip Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-5 pb-5">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Pro Tip 💡</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Take a screenshot of these questions so you have them ready during the event. 
                  Being prepared makes a great first impression!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
