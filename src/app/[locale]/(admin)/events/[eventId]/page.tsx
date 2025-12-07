'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Calendar, MapPin, Users, Clock, Heart, QrCode, 
  Copy, Check, Mail, Settings, ChevronRight, CheckCircle, 
  ArrowLeft, Send, Download, Share2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Progress } from '@/shared/components/ui/progress';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { toast } from 'sonner';

// 模拟活动数据
const MOCK_EVENT = {
  id: '1',
  eventNo: 'EVT-20231215-A1B2',
  name: 'Downtown Singles Mixer',
  description: 'Join us for an exciting evening of connections and conversations!',
  location: 'The Social Club, Downtown',
  eventDate: '2024-12-20T00:00:00Z',
  eventTime: '19:00',
  status: 'active',
  capacity: 100,
  currentParticipants: 45,
  eventType: 'standard',
  isMatchingCompleted: false,
};

// 模拟参与者数据
const MOCK_PARTICIPANTS = [
  { id: '1', name: 'Sarah Johnson', age: 28, email: 'sarah@example.com', interests: '["Travel", "Music", "Coffee"]', hasSubmittedChoices: true, registeredAt: '2024-12-10T10:00:00Z' },
  { id: '2', name: 'Michael Chen', age: 32, email: 'michael@example.com', interests: '["Photography", "Hiking", "Food"]', hasSubmittedChoices: true, registeredAt: '2024-12-11T14:30:00Z' },
  { id: '3', name: 'Emily Davis', age: 26, email: 'emily@example.com', interests: '["Art", "Dancing", "Movies"]', hasSubmittedChoices: false, registeredAt: '2024-12-12T09:15:00Z' },
  { id: '4', name: 'James Wilson', age: 30, email: 'james@example.com', interests: '["Sports", "Gaming", "Tech"]', hasSubmittedChoices: true, registeredAt: '2024-12-13T16:45:00Z' },
  { id: '5', name: 'Olivia Martinez', age: 27, email: 'olivia@example.com', interests: '["Reading", "Cooking", "Yoga"]', hasSubmittedChoices: false, registeredAt: '2024-12-14T11:20:00Z' },
];

const MOCK_STATS = {
  totalParticipants: 45,
  submittedChoices: 32,
  totalMatches: 0,
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const event = MOCK_EVENT;
  const participants = MOCK_PARTICIPANTS;
  const matchStats = MOCK_STATS;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; color: string }> = {
      draft: { variant: 'outline', label: 'Draft', color: 'text-muted-foreground' },
      paid: { variant: 'secondary', label: 'Paid', color: 'text-yellow-600' },
      active: { variant: 'default', label: 'Active', color: 'text-green-600' },
      completed: { variant: 'secondary', label: 'Completed', color: 'text-blue-600' },
      cancelled: { variant: 'destructive', label: 'Cancelled', color: 'text-red-600' },
    };
    const { variant, label } = config[status] || { variant: 'outline', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/e/${event.eventNo}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const calculateMatches = async () => {
    setCalculating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success('Matching completed! Found 12 matches.');
    setCalculating(false);
  };

  const percentFull = (event.currentParticipants / event.capacity) * 100;
  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/e/${event.eventNo}`;

  return (
    <div className="container py-8 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.push('/events')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{event.name}</h1>
            {getStatusBadge(event.status)}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-primary" />
              {formatDate(event.eventDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-primary" />
              {event.eventTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary" />
              {event.location}
            </span>
          </div>
        </div>
        <Button onClick={copyShareLink} className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          Share Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {event.currentParticipants} / {event.capacity}
            </div>
            <Progress value={percentFull} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(percentFull)}% capacity filled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Send className="h-4 w-4 text-green-500" />
              Choices Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {matchStats.submittedChoices} / {matchStats.totalParticipants}
            </div>
            <Progress 
              value={(matchStats.submittedChoices / matchStats.totalParticipants) * 100} 
              className="mt-2 h-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Participants who submitted choices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Matches Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{matchStats.totalMatches}</span>
            </div>
            {event.isMatchingCompleted ? (
              <Badge variant="secondary" className="mt-2">Completed</Badge>
            ) : (
              <Button 
                size="sm" 
                className="mt-2" 
                onClick={calculateMatches}
                disabled={calculating}
              >
                {calculating ? 'Calculating...' : 'Calculate Matches'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="participants" className="gap-2">
            <Users className="h-4 w-4" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="share" className="gap-2">
            <QrCode className="h-4 w-4" />
            Share
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Participants Tab */}
        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Registered Participants</CardTitle>
                  <CardDescription>
                    {participants.length} people registered for this event
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {p.age} years • {p.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {JSON.parse(p.interests).slice(0, 2).map((interest: string) => (
                          <Badge key={interest} variant="outline" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      {p.hasSubmittedChoices ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Submitted
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share Tab */}
        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Event</CardTitle>
              <CardDescription>
                Share this link or QR code with potential participants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Share Link */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm font-medium">Event Registration Link</p>
                <div className="flex gap-2">
                  <code className="flex-1 p-3 bg-background rounded-lg text-sm break-all border">
                    {shareLink}
                  </code>
                  <Button variant="outline" size="icon" className="shrink-0" onClick={copyShareLink}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Event Code */}
              <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Event Code</p>
                <p className="text-3xl font-mono font-bold text-primary">{event.eventNo}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Participants can use this code to find your event
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Send Invites
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download QR
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Event Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Event Status</p>
                  <p className="text-sm text-muted-foreground">
                    Control registration and event lifecycle
                  </p>
                </div>
                {getStatusBadge(event.status)}
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Event Package</p>
                  <p className="text-sm text-muted-foreground">
                    {event.eventType === 'standard' ? 'Standard - Up to 100 people' : 'Large - Up to 200 people'}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">{event.eventType}</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Post-Event Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Send choice selection emails to participants
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Emails
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
