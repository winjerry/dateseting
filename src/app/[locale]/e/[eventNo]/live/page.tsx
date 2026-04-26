'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Send, Clock, Sparkles, Heart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';

export default function LiveEventDashboard() {
  const params = useParams();
  const eventNo = params.eventNo as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState('00:00:00');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch data
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/events/public?eventNo=${eventNo}`);
      const data = await res.json();
      if (data.success && data.event) {
        setEvent(data.event);
      }
    } catch (error) {
      console.error('Failed to fetch live data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [eventNo]);

  // Timer logic
  useEffect(() => {
    if (!event) return;

    const updateTimer = () => {
      const now = new Date();
      const startTime = new Date(`${event.eventDate.split('T')[0]}T${event.eventTime}`);
      
      let diff = now.getTime() - startTime.getTime();
      
      // If not started yet
      if (diff < 0) {
        diff = Math.abs(diff);
        // Show negative countdown? Or just "Starts in..."
        // For simplicity, let's just show absolute time
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeElapsed(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    timerRef.current = setInterval(updateTimer, 1000);
    updateTimer();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [event]);

  if (loading && !event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  if (!event) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Event not found</div>;
  }

  const joinLink = `${window.location.origin}/e/${eventNo}`;
  const percentFull = (event.currentParticipants / event.capacity) * 100;
  const percentSubmitted = event.currentParticipants > 0 
    ? (event.submittedChoicesCount / event.currentParticipants) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black to-black z-0 pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary fill-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{event.name}</h1>
              <p className="text-xl text-white/60 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                Speed Dating Live Dashboard
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/50 uppercase tracking-widest mb-1">Time Elapsed</div>
            <div className="text-5xl font-mono font-bold text-primary tabular-nums mb-2">
              {timeElapsed}
            </div>
            {event.eventEndTime && (
              <div className="flex items-center justify-end gap-2 text-white/60">
                <Clock className="h-4 w-4" />
                <span>Ends at {event.eventEndTime}</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: QR Code */}
          <div className="flex flex-col items-center justify-center space-y-8">
            <Card className="bg-white p-8 rounded-3xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.25)] border-0">
              <QRCodeSVG 
                value={joinLink}
                size={400}
                level="H"
                includeMargin={false}
              />
            </Card>
            <div className="text-center space-y-2">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Scan to Join
              </h2>
              <p className="text-2xl text-white/60">
                or visit <span className="text-primary font-mono">{joinLink.replace(/^https?:\/\//, '')}</span>
              </p>
            </div>
          </div>

          {/* Right Column: Stats */}
          <div className="grid gap-8">
            {/* Participants Card */}
            <Card className="bg-white/10 border-white/10 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl text-white/80 flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-400" />
                  Live Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-8xl font-bold text-white">{event.currentParticipants}</span>
                  <span className="text-3xl text-white/40">/ {event.capacity}</span>
                </div>
                <Progress value={percentFull} className="h-4 bg-white/10 [&>div]:bg-blue-500" />
              </CardContent>
            </Card>

            {/* Submitted Choices Card */}
            <Card className="bg-white/10 border-white/10 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl text-white/80 flex items-center gap-3">
                  <Send className="h-8 w-8 text-green-400" />
                  Choices Submitted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-8xl font-bold text-white">
                    {event.submittedChoicesCount || 0}
                  </span>
                  <span className="text-3xl text-white/40">people</span>
                </div>
                <Progress value={percentSubmitted} className="h-4 bg-white/10 [&>div]:bg-green-500" />
                <p className="text-white/40 mt-4 text-lg">
                  {Math.round(percentSubmitted)}% of participants have made their choices
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-white/30 text-sm">
          Powered by DateSet Speed Dating
        </footer>
      </div>
    </div>
  );
}
