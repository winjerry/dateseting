'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Send, Clock, Sparkles, Heart, Loader2, Lock, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';

export default function LiveEventDashboard() {
  const params = useParams();
  const eventNo = params.eventNo as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState('00:00:00');
  const [choiceCountdown, setChoiceCountdown] = useState('');
  const [choiceLocked, setChoiceLocked] = useState(false);
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

  // Choice Deadline 倒计时
  useEffect(() => {
    if (!event?.choiceDeadline) return;

    const deadline = new Date(event.choiceDeadline);

    const updateDeadlineCountdown = () => {
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setChoiceCountdown('');
        setChoiceLocked(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const rh = hours % 24;
        setChoiceCountdown(`${days}d ${rh}h ${minutes.toString().padStart(2, '0')}m`);
      } else {
        setChoiceCountdown(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    };

    // 如果活动已经是 matched 状态，直接锁定
    if (event.status === 'matched') {
      setChoiceLocked(true);
      return;
    }

    const timer = setInterval(updateDeadlineCountdown, 1000);
    updateDeadlineCountdown();
    return () => clearInterval(timer);
  }, [event]);

  const [timerLabel, setTimerLabel] = useState('');
  const [eventPhase, setEventPhase] = useState<'before' | 'live' | 'ended'>('before');

  // Timer logic
  useEffect(() => {
    if (!event) return;

    const startTime = new Date(`${event.eventDate.split('T')[0]}T${event.eventTime}`);
    let endTime: Date;
    if (event.eventEndTime) {
      endTime = new Date(`${event.eventDate.split('T')[0]}T${event.eventEndTime}`);
    } else {
      endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
    }

    const formatDiff = (diff: number) => {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const updateTimer = () => {
      const now = new Date();

      if (now < startTime) {
        // 活动还未开始 → 显示倒计时
        setEventPhase('before');
        setTimerLabel('Starts in');
        setTimeElapsed(formatDiff(startTime.getTime() - now.getTime()));
      } else if (now >= startTime && now <= endTime) {
        // 活动进行中 → 显示已用时间
        setEventPhase('live');
        setTimerLabel('Time Elapsed');
        setTimeElapsed(formatDiff(now.getTime() - startTime.getTime()));
      } else {
        // 活动已结束 → 停止计时，显示总时长
        setEventPhase('ended');
        setTimerLabel('Event Ended');
        setTimeElapsed(formatDiff(endTime.getTime() - startTime.getTime()));
        // 停止计时器
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
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
              <Heart className={`h-8 w-8 text-primary fill-primary ${eventPhase === 'live' ? 'animate-pulse' : ''}`} />
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
            <div className={`text-sm uppercase tracking-widest mb-1 ${
              eventPhase === 'before' ? 'text-yellow-400' :
              eventPhase === 'ended' ? 'text-red-400' : 'text-white/50'
            }`}>
              {timerLabel || 'Time Elapsed'}
            </div>
            <div className={`text-5xl font-mono font-bold tabular-nums mb-2 ${
              eventPhase === 'before' ? 'text-yellow-400' :
              eventPhase === 'ended' ? 'text-red-400' : 'text-primary'
            }`}>
              {timeElapsed}
            </div>
            {eventPhase === 'ended' ? (
              <div className="flex items-center justify-end gap-2 text-red-400/80">
                <Clock className="h-4 w-4" />
                <span>Total duration</span>
              </div>
            ) : event.eventEndTime && (
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
            {/* Choice Deadline Card — 活动结束后显示 */}
            {(eventPhase === 'ended' || event.status === 'matched') && event.choiceDeadline && (
              <Card className={`border backdrop-blur-xl ${
                choiceLocked || event.status === 'matched'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    {choiceLocked || event.status === 'matched' ? (
                      <Lock className="h-8 w-8 text-red-400" />
                    ) : (
                      <CalendarClock className="h-8 w-8 text-amber-400" />
                    )}
                    <span className={choiceLocked || event.status === 'matched' ? 'text-red-300' : 'text-amber-300'}>
                      {event.status === 'matched' ? 'Choices Locked' : 'Choice Window'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {event.status === 'matched' ? (
                    <div className="flex items-center gap-3">
                      <Lock className="h-6 w-6 text-red-400" />
                      <span className="text-2xl text-red-300">Matching completed — selections locked</span>
                    </div>
                  ) : choiceLocked ? (
                    <div className="flex items-center gap-3">
                      <Lock className="h-6 w-6 text-red-400" />
                      <span className="text-2xl text-red-300">Deadline passed — selections locked</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-6xl font-mono font-bold text-amber-300 tabular-nums mb-2">
                        {choiceCountdown}
                      </div>
                      <p className="text-white/50 text-lg">
                        Deadline: {new Date(event.choiceDeadline).toLocaleString()}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
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
