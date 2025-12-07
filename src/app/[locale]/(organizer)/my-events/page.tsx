'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Users, Heart, TrendingUp, Plus, Eye, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';

// 模拟数据
const MOCK_EVENTS = [
  {
    id: '1',
    eventNo: 'EVT-20231215-A1B2',
    name: 'Downtown Singles Mixer',
    eventDate: '2024-12-20T00:00:00Z',
    eventTime: '19:00',
    location: 'The Social Club, Downtown',
    status: 'active',
    capacity: 100,
    currentParticipants: 45,
  },
  {
    id: '2',
    eventNo: 'EVT-20231210-C3D4',
    name: 'Tech Industry Speed Dating',
    eventDate: '2024-12-25T00:00:00Z',
    eventTime: '18:30',
    location: 'Innovation Hub, Tech Park',
    status: 'paid',
    capacity: 100,
    currentParticipants: 23,
  },
  {
    id: '3',
    eventNo: 'EVT-20231201-E5F6',
    name: 'Winter Romance Night',
    eventDate: '2024-12-08T00:00:00Z',
    eventTime: '20:00',
    location: 'Rooftop Lounge',
    status: 'completed',
    capacity: 200,
    currentParticipants: 156,
  },
];

const MOCK_STATS = {
  totalEvents: 3,
  activeEvents: 1,
  completedEvents: 1,
  totalParticipants: 224,
};

export default function MyEventsDashboard() {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      draft: { variant: 'outline', label: 'Draft' },
      paid: { variant: 'secondary', label: 'Paid' },
      active: { variant: 'default', label: 'Active' },
      completed: { variant: 'secondary', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const { variant, label } = config[status] || { variant: 'outline', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const copyShareLink = (eventNo: string) => {
    const link = `${window.location.origin}/e/${eventNo}`;
    navigator.clipboard.writeText(link);
    setCopiedId(eventNo);
    toast.success('Link copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            My Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your speed dating events
          </p>
        </div>
        <Button 
          onClick={() => router.push('/my-events/create')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarPlus className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Events created</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.activeEvents}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.completedEvents}</div>
            <p className="text-xs text-muted-foreground">Events finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>View and manage all your speed dating events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_EVENTS.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{event.name}</h3>
                    {getStatusBadge(event.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.eventDate)} at {event.eventTime} • {event.location}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.currentParticipants} / {event.capacity}
                    </span>
                    <span className="text-muted-foreground">
                      Code: <code className="bg-muted px-1 rounded">{event.eventNo}</code>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/my-events/${event.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyShareLink(event.eventNo)}
                  >
                    {copiedId === event.eventNo ? (
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    Share
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
