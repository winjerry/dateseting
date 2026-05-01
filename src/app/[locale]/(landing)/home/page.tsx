'use client';

import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from '@/core/i18n/navigation';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCircle,
  Send,
  Shield,
  Sparkles,
  Star,
  User,
  Users,
  Instagram,
  Twitter,
  Linkedin,
  BarChart3,
  X
} from 'lucide-react';

import { signOut } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { LocaleSelector, ThemeToggler } from '@/shared/blocks/common';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { envConfigs } from '@/config';
import { Input } from '@/shared/components/ui/input';
import { useAppContext } from '@/shared/contexts/app';
import { toast } from 'sonner';

const TESTIMONIALS = [
  {
    name: 'Jessica M.',
    title: 'Community Manager, NYC',
    quote: 'Pairivo made our mixer effortless. The matches were spot on and our guests loved it!',
    avatar: 'https://i.pravatar.cc/150?img=47'
  },
  {
    name: 'David L.',
    title: 'Event Organizer, Austin',
    quote: 'We\'ve tried other platforms, but Pairivo\'s matching quality is incredible. Worth every penny.',
    avatar: 'https://i.pravatar.cc/150?img=11'
  },
  {
    name: 'Sophie K.',
    title: 'Founder, LA',
    quote: 'Super easy to set up and the results were amazing. 80% of our guests got at least one match!',
    avatar: 'https://i.pravatar.cc/150?img=43'
  },
  {
    name: 'Marcus T.',
    title: 'Speed Dating Host, London',
    quote: 'The automated matching saved me hours of manual work. The attendees were blown away by the speed.',
    avatar: 'https://i.pravatar.cc/150?img=33'
  },
  {
    name: 'Elena R.',
    title: 'Corporate Events, Chicago',
    quote: 'Used Pairivo for a corporate networking event. The feedback was overwhelmingly positive.',
    avatar: 'https://i.pravatar.cc/150?img=5'
  }
];

const EXTENDED_TESTIMONIALS = [...TESTIMONIALS, ...TESTIMONIALS.slice(0, 2)];

export default function HomePage() {
  const router = useRouter();
  const { user } = useAppContext();
  const [email, setEmail] = useState('');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setTimeout(() => {
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearTimeout(timer);
  }, [testimonialIndex, isHovered]);

  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@pairivo.com';

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
        },
      },
    });
    router.push('/');
  };

  const handleHostEvent = () => {
    if (user) {
      router.push('/my-events/create');
      return;
    }
    router.push('/sign-in');
  };

  const handleJoinWaitlist = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const normalizedEmail = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isValidEmail) {
      toast.error('Please enter a valid email address.');
      return;
    }

    const subject = encodeURIComponent('Pairivo Waitlist');
    const body = encodeURIComponent(
      `Please add me to the waitlist.\n\nEmail: ${normalizedEmail}`
    );
    toast.success('Opening your email app to join the waitlist.');
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#060411] text-slate-100 font-sans selection:bg-pink-500/30">
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#060411]/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Pairivo Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-white tracking-tight">
              Pairivo
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 group">
                    Resources 
                    <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" />
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-[#0b081a] border-white/10 text-slate-200">
                  <DropdownMenuItem onClick={() => router.push('/posts')} className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                    Blog
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/faq')} className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                    FAQ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/about')} className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                    About Us
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-4 ml-4">
              {user ? (
                <>
                  <Link href="/my-events">
                    <Button variant="ghost" className="gap-2 text-slate-200 hover:text-white hover:bg-white/10">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden sm:inline">My Events</span>
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white/10">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image || ''} alt={user.name || ''} />
                          <AvatarFallback>
                            {(user.name || user.email || 'U').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm leading-none font-medium">
                            {user.name}
                          </p>
                          <p className="text-muted-foreground text-xs leading-none">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => router.push('/sign-in')} className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full px-6 border border-white/10 font-medium">
                    Log in
                  </Button>
                  <Button onClick={handleHostEvent} className="rounded-full px-6 bg-gradient-to-r from-pink-500 to-indigo-500 border-0 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:opacity-90 font-bold tracking-wide">
                    Create an Event
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-visible pt-16 lg:pt-20 pb-16 bg-[#060411]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-900/10 via-[#060411] to-[#060411] pointer-events-none" />
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-pink-600/20 blur-[150px] pointer-events-none" />
        <div className="absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />

        <div className="relative mx-auto grid max-w-[1500px] lg:items-start items-center gap-8 px-8 lg:grid-cols-[55%_45%] xl:gap-8 xl:px-12">
          {/* Left Text */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 lg:pr-4"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-transparent px-4 py-1.5 text-sm text-pink-500 backdrop-blur-md mb-6 font-medium">
              <Shield className="h-4 w-4" />
              <span>Private • Curated • Meaningful</span>
            </div>

            <h1 className="text-3xl leading-[1.1] font-bold md:text-5xl lg:text-[3rem] xl:text-[3.5rem] tracking-tighter text-white drop-shadow-lg mb-8 whitespace-nowrap">
              You create the event.<br/>
              We handle the <span className="text-pink-500 drop-shadow-[0_0_25px_rgba(236,72,153,0.5)]">matches.</span>
            </h1>

            <p className="max-w-xl text-lg text-slate-300 mb-10 leading-relaxed font-medium">
              Pairivo helps event hosts run private dating experiences with ease — from invitations to matches. You bring people together, we take care of the rest.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row mb-16">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="h-14 gap-2 rounded-full px-8 text-lg bg-gradient-to-r from-pink-500 to-indigo-500 hover:opacity-90 shadow-[0_0_30px_rgba(236,72,153,0.5)] border-0 transition-all text-white font-bold"
                  onClick={handleHostEvent}
                >
                  Create Your Event
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full px-8 text-lg border-white/20 text-white bg-transparent hover:bg-white/5 font-bold transition-all gap-3"
                  onClick={() => router.push('/faq')}
                >
                  See How It Works
                  <div className="flex items-center justify-center w-6 h-6 rounded-full">
                    <div className="ml-1 w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent"></div>
                  </div>
                </Button>
              </motion.div>
            </div>

            <div className="flex flex-wrap items-center gap-6 xl:gap-8 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-transparent text-amber-500 border border-amber-500/40"><Calendar className="w-5 h-5" strokeWidth={1.5} /></div>
                <div className="flex flex-col">
                  <p className="text-[15px] font-bold text-white leading-tight mb-1">Invite Only</p>
                  <p className="text-[13px] text-slate-400 font-medium leading-none">Private & secure</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-transparent text-amber-500 border border-amber-500/40"><Sparkles className="w-5 h-5" strokeWidth={1.5} /></div>
                <div className="flex flex-col">
                  <p className="text-[15px] font-bold text-white leading-tight mb-1">Smart Matching</p>
                  <p className="text-[13px] text-slate-400 font-medium leading-none">AI-powered</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-transparent text-amber-500 border border-amber-500/40"><Mail className="w-5 h-5" strokeWidth={1.5} /></div>
                <div className="flex flex-col">
                  <p className="text-[15px] font-bold text-white leading-tight mb-1">Results by Email</p>
                  <p className="text-[13px] text-slate-400 font-medium leading-none">After your event</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right 3D Visual */}
          <div className="relative hidden lg:block perspective-[1400px] z-10 h-full min-h-[700px] mt-0 -ml-[40px] -left-[80px] lg:scale-[1.05] xl:scale-[1.15] origin-top" style={{ transformStyle: 'preserve-3d' }}>
            {/* === TRUE 3D ORBIT RING === */}
            <div 
              className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
              style={{
                left: '45%',
                top: '25%',
                transform: 'translate(-35%, -50%) translateZ(-150px) rotateX(70deg) rotateY(155deg) rotateZ(-5deg)',
                border: '2px solid rgba(236,72,153,0.3)',
                boxShadow: '0 0 40px rgba(236,72,153,0.4), inset 0 0 40px rgba(236,72,153,0.4)',
                transformStyle: 'preserve-3d'
              }}
            >
               {/* Asymmetrical glow for depth/lighting */}
               <div className="absolute inset-0 rounded-full border-t-[3px] border-r-[3px] border-pink-400/80 blur-[2px]"></div>
               <div className="absolute inset-0 rounded-full border-t-[4px] border-r-[4px] border-indigo-400/50 blur-[8px]"></div>

               {/* Glowing stars on the ring, counter-rotated to always face the camera */}
               <div className="absolute bottom-[10%] left-[20%] w-[6px] h-[6px] bg-white rounded-full shadow-[0_0_30px_10px_rgba(236,72,153,0.9)]" style={{ transform: 'rotateX(-70deg) rotateY(-15deg)' }}></div>
               <div className="absolute top-[20%] right-[10%] w-[4px] h-[4px] bg-white rounded-full shadow-[0_0_20px_5px_rgba(255,255,255,1)]" style={{ transform: 'rotateX(-70deg) rotateY(-15deg)' }}></div>
            </div>

            {/* Background glowing orbs directly behind the card to create the tinted gradient background effect */}
            <div className="absolute right-[200px] top-[100px] w-[350px] h-[350px] bg-pink-600/30 rounded-full blur-[100px] pointer-events-none" style={{ transform: 'translateZ(-50px)' }}></div>
            <div className="absolute right-[50px] top-[250px] w-[350px] h-[350px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" style={{ transform: 'translateZ(-50px)' }}></div>

            {/* 3D Dashboard Mockup - LEFT side tilts INTO screen */}
            <motion.div 
              initial={{ opacity: 0, rotateY: -30, rotateX: 5, z: -50, x: 50 }}
              animate={{ opacity: 1, rotateY: -35, rotateX: -5, z: 0, x: -10, y: [0, -10, 0] }}
              transition={{ y: { duration: 6, repeat: Infinity, ease: 'easeInOut' }, default: { duration: 1.2, ease: "easeOut" } }}
              className="absolute right-[50px] top-[20px] w-[560px] rounded-[1.5rem] bg-gradient-to-br from-[#1C152A] via-[#100E1C] to-[#0A0812] p-9 backdrop-blur-xl"
              style={{ 
                transformStyle: 'preserve-3d',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 60px 120px -20px rgba(0,0,0,0.95), 0 0 80px -10px rgba(120,80,180,0.15), inset 0 1px 0 rgba(255,255,255,0.08)'
              }}
            >
              <div className="absolute right-8 top-8 w-1.5 h-1.5 rotate-45 bg-pink-500 rounded-sm shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>

              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-[1.6rem] font-bold text-white flex items-center tracking-tight">Spring Mixer <Badge className="ml-4 bg-[#1B4D36] text-[#4ADE80] hover:bg-[#1B4D36] border-transparent px-2.5 py-0.5 rounded-full shadow-none font-medium text-xs">● Live</Badge></h3>
                  <p className="text-sm text-slate-400 mt-2">Mar 24, 2024 • New York, NY</p>
                </div>
              </div>
              <div className="mb-10 grid grid-cols-3 gap-4">
                <div className="rounded-[1rem] bg-[#1C1A2E] border border-white/[0.06] p-5 text-center">
                  <p className="text-[2.2rem] leading-none font-semibold text-white mb-2">68</p>
                  <p className="text-[0.8rem] font-medium text-slate-300">Invited</p>
                </div>
                <div className="rounded-[1rem] bg-[#1C1A2E] border border-white/[0.06] p-5 text-center">
                  <p className="text-[2.2rem] leading-none font-semibold text-white mb-2">52</p>
                  <p className="text-[0.8rem] font-medium text-slate-300">Attended</p>
                </div>
                <div className="rounded-[1rem] bg-[#4D1B36] border border-pink-500/20 p-5 text-center">
                  <p className="text-[2.2rem] leading-none font-semibold text-white flex items-center justify-center gap-2 mb-2">24 <Heart className="w-5 h-5 text-pink-500" strokeWidth={2.5} /></p>
                  <p className="text-[0.8rem] font-medium text-pink-100">Mutual Matches</p>
                </div>
              </div>
              <div className="rounded-2xl bg-transparent mt-4">
                <p className="mb-5 text-[1rem] font-bold text-white">Matches found</p>
                <div className="flex items-center mb-8">
                  <div className="flex -space-x-3">
                    <Avatar className="h-16 w-16 border-2 border-[#100E1C] shadow-lg"><AvatarImage src="https://i.pravatar.cc/100?img=1" /></Avatar>
                    <Avatar className="h-16 w-16 border-2 border-[#100E1C] shadow-lg"><AvatarImage src="https://i.pravatar.cc/100?img=12" /></Avatar>
                    <Avatar className="h-16 w-16 border-2 border-[#100E1C] shadow-lg"><AvatarImage src="https://i.pravatar.cc/100?img=5" /></Avatar>
                    <Avatar className="h-16 w-16 border-2 border-[#100E1C] shadow-lg"><AvatarImage src="https://i.pravatar.cc/100?img=11" /></Avatar>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-slate-500 bg-transparent text-sm font-medium text-white ml-5">+20</div>
                </div>
                <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-slate-500" />
                  <p className="text-sm text-slate-400">Results will be emailed after the event</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Icons - placed in front in Z space */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} 
              className="absolute right-[0px] top-[30px] flex h-[70px] w-[70px] items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.6)] border border-white/20"
              style={{ z: 100 }}
            >
              <Send className="h-7 w-7 ml-1" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 15, 0], scale: [1, 1.05, 1] }} 
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} 
              className="absolute right-[-45px] top-[200px] flex h-[80px] w-[80px] items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-600 text-white shadow-[0_0_30px_rgba(236,72,153,0.6)] border border-white/20"
              style={{ z: 100 }}
            >
              <Heart className="h-9 w-9 fill-white text-white" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }} 
              className="absolute right-[10px] top-[370px] flex h-[65px] w-[65px] items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.6)] border border-white/20"
              style={{ z: 100 }}
            >
              <Mail className="h-7 w-7" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Why hosts love Pairivo (Bento Box) */}
      <section className="py-16 relative overflow-hidden bg-[#060411]">
        <div className="absolute right-0 top-0 -z-10 h-full w-[600px] bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-pink-900/10 via-[#060411] to-transparent pointer-events-none" />
        <div className="mx-auto max-w-[1500px] px-8">
          <div className="grid lg:grid-cols-[35%_65%] gap-16 items-center">
             {/* Left Text */}
             <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
             >
                <h2 className="mb-2 text-4xl font-extrabold md:text-5xl text-white tracking-tight">
                  Why hosts <span className="text-pink-500">love</span> Pairivo
                </h2>
                <svg width="120" height="20" viewBox="0 0 120 20" className="mb-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 15C15 5 30 15 45 5C60 15 75 5 90 15C105 5 115 10 118 12" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="max-w-md text-slate-300 text-lg mb-10 leading-relaxed font-medium">
                  Everything you need to create smooth, engaging, and memorable experiences for your guests.
                </p>
                <Button variant="outline" className="rounded-full px-8 py-6 border-white/20 text-white bg-transparent hover:bg-white/10 transition-all text-base font-bold" onClick={() => router.push('/about')}>
                  Explore Features <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
             </motion.div>
             
             {/* Bento Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
                {/* Large Card */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="row-span-2 rounded-[2rem] border border-white/5 border-t-white/20 border-l-white/20 bg-gradient-to-br from-[#1C1836] to-[#0B091A] p-10 relative overflow-hidden group hover:border-pink-500/30 transition-colors shadow-2xl"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-3 font-bold text-2xl text-white tracking-tight">Smart Matching</h3>
                    <p className="text-slate-400 font-medium leading-relaxed max-w-[250px]">
                      Our algorithm focuses on mutual interest to create meaningful connections.
                    </p>
                  </div>
                  <div className="absolute bottom-0 right-0 left-0 h-[250px] flex justify-center items-end opacity-90 group-hover:scale-105 transition-transform duration-700 pointer-events-none overflow-hidden rounded-b-[2rem]">
                    
                    {/* Glow behind the hearts */}
                    <div className="absolute bottom-[-20px] w-[150px] h-[150px] bg-purple-600/40 blur-[50px] rounded-full translate-x-[-40px]"></div>
                    <div className="absolute bottom-[-20px] w-[150px] h-[150px] bg-pink-600/40 blur-[50px] rounded-full translate-x-[40px]"></div>

                    {/* Orbits */}
                    <div className="absolute bottom-[40px] w-[280px] h-[100px] rounded-[100%] border border-white/20 rotate-[-10deg] shadow-[0_0_15px_rgba(255,255,255,0.05)]"></div>
                    <div className="absolute bottom-[20px] w-[320px] h-[120px] rounded-[100%] border border-pink-500/20 rotate-[5deg]"></div>

                    {/* Glowing dots on orbits */}
                    <div className="absolute bottom-[110px] left-[30%] w-2 h-2 bg-purple-300 rounded-full shadow-[0_0_10px_2px_rgba(168,85,247,0.8)]"></div>
                    <div className="absolute bottom-[40px] right-[25%] w-1.5 h-1.5 bg-pink-300 rounded-full shadow-[0_0_10px_2px_rgba(236,72,153,0.8)]"></div>
                    <div className="absolute bottom-[70px] right-[10%] w-2 h-2 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]"></div>

                    {/* Glowing Hearts SVG */}
                    <svg className="relative z-10 translate-y-[-20px]" width="180" height="140" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g filter="url(#glow)">
                          {/* Purple Heart */}
                          <path d="M90 110L85 105C55 78 35 60 35 42C35 24 48 10 66 10C75 10 84 14 90 22C96 14 105 10 114 10C132 10 145 24 145 42C145 60 125 78 95 105L90 110Z" stroke="#A855F7" strokeWidth="4" fill="rgba(168, 85, 247, 0.4)"/>
                          {/* Pink Heart */}
                          <path d="M120 120L115 115C85 88 65 70 65 52C65 34 78 20 96 20C105 20 114 24 120 32C126 24 135 20 144 20C162 20 175 34 175 52C175 70 155 88 125 115L120 120Z" stroke="#EC4899" strokeWidth="4" fill="rgba(236, 72, 153, 0.4)"/>
                        </g>
                        <defs>
                          <filter id="glow" x="0" y="-20" width="250" height="180" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                            <feGaussianBlur stdDeviation="4" result="effect1_foregroundBlur"/>
                            <feComposite in="SourceGraphic" in2="effect1_foregroundBlur" operator="over"/>
                          </filter>
                        </defs>
                    </svg>
                  </div>
                </motion.div>
                {/* Small Card 1 */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="rounded-[2rem] border border-white/5 border-t-white/20 border-l-white/20 bg-gradient-to-br from-[#1C1836] to-[#0B091A] p-8 flex flex-col justify-center hover:border-white/20 transition-colors shadow-2xl"
                >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <Shield className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-xl text-white tracking-tight leading-tight">Private & Secure</h3>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">Your guests' data is safe and confidential. We never share or sell information.</p>
                </motion.div>
                {/* Small Card 2 */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="rounded-[2rem] border border-white/5 border-t-white/20 border-l-white/20 bg-gradient-to-br from-[#1C1836] to-[#0B091A] p-8 flex flex-col justify-center hover:border-white/20 transition-colors shadow-2xl"
                >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Mail className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-xl text-white tracking-tight leading-tight">Results Delivered</h3>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">Matches are revealed to all participants after the event via email.</p>
                </motion.div>
             </div>
          </div>
        </div>
      </section>

      {/* 4. Real events. Real connections. */}
      <section className="py-16 relative overflow-hidden bg-[#060411]">
        <div className="mx-auto max-w-[1500px] px-8">
           <div className="grid lg:grid-cols-[55%_45%] gap-16 items-center">
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="relative rounded-[2.5rem] overflow-hidden aspect-[16/10] border border-white/10 shadow-2xl group"
             >
               <img src="/imgs/real-events-banner.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Real event gathering" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
               <div className="absolute bottom-8 left-8 right-8 lg:right-auto rounded-2xl bg-[#1A1625]/80 backdrop-blur-md p-5 flex items-center gap-5 border border-white/10 shadow-xl">
                 <div className="bg-white/10 p-3 rounded-xl border border-white/20"><Calendar className="w-6 h-6 text-white"/></div>
                 <div>
                   <p className="font-bold text-white text-lg leading-tight mb-1">Brooklyn Social</p>
                   <p className="text-xs text-slate-300 font-medium tracking-wide">May 3, 2024 • 120 Attendees</p>
                 </div>
               </div>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
             >
               <h2 className="text-4xl md:text-[3.5rem] leading-[1.1] font-extrabold text-white mb-6 tracking-tight">
                  Real events.<br/><span className="text-pink-500">Real connections.</span>
               </h2>
               <p className="text-lg text-slate-400 font-medium mb-16 max-w-md leading-relaxed">
                  Join hundreds of hosts who have created unforgettable experiences with Pairivo.
               </p>
               <div className="flex items-center gap-8 divide-x divide-white/10">
                 <div className="flex flex-col gap-2 pl-0">
                    <Users className="w-6 h-6 text-pink-500 mb-2" />
                    <p className="text-3xl lg:text-4xl font-bold text-pink-500">10,000+</p>
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">Participants Matched</p>
                 </div>
                 <div className="flex flex-col gap-2 pl-8">
                    <Heart className="w-6 h-6 text-rose-500 mb-2" />
                    <p className="text-3xl lg:text-4xl font-bold text-white">85%</p>
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">Match Satisfaction</p>
                 </div>
                 <div className="flex flex-col gap-2 pl-8">
                    <Calendar className="w-6 h-6 text-purple-500 mb-2" />
                    <p className="text-3xl lg:text-4xl font-bold text-white">500+</p>
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">Events Hosted</p>
                 </div>
                 <div className="flex flex-col gap-2 pl-8">
                    <Star className="w-6 h-6 text-indigo-400 mb-2" />
                    <p className="text-3xl lg:text-4xl font-bold text-indigo-400">4.9/5</p>
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">Host Rating</p>
                 </div>
               </div>
             </motion.div>
           </div>
        </div>
      </section>

      {/* 5. How Pairivo works */}
      <section id="how-it-works" className="bg-[#060411] py-16">
        <div className="mx-auto max-w-[1500px] px-8">
          <div className="mb-24 text-center">
            <h2 className="text-4xl font-extrabold md:text-[3.5rem] text-white tracking-tight">
              How <span className="text-pink-500">Pairivo</span> works
            </h2>
          </div>

          <div className="relative">
            {/* Connecting dashed line */}
            <div className="absolute top-[48px] left-[12%] right-[12%] hidden md:block h-[2px] border-t-2 border-dashed border-pink-500/30 z-0"></div>

            <div className="grid gap-12 md:gap-4 md:grid-cols-4 relative z-10">
              {[
                {
                  icon: Calendar,
                  title: 'Create Your Event',
                  desc: 'Set up your event, add details, and invite your guests.',
                  color: 'from-pink-500 to-rose-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] text-pink-500',
                  delay: 0
                },
                {
                  icon: Users,
                  title: 'Guests Join',
                  desc: 'Invitees sign up and participate in the event.',
                  color: 'from-purple-500 to-indigo-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] text-purple-500',
                  delay: 0.1
                },
                {
                  icon: Heart,
                  title: 'We Find Matches',
                  desc: 'Our system finds mutual interest between participants.',
                  color: 'from-rose-500 to-red-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] text-rose-500',
                  delay: 0.2
                },
                {
                  icon: MessageCircle,
                  title: 'Results by Email',
                  desc: 'Matches are revealed after the event via email.',
                  color: 'from-blue-500 to-cyan-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] text-blue-500',
                  delay: 0.3
                },
              ].map((step, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: step.delay }}
                  className="relative text-center group"
                >
                  <div className="relative mx-auto mb-8 h-24 w-24">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-10`}></div>
                    <div className={`relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#1C1836] to-[#0B091A] border border-white/5 border-t-white/20 border-l-white/20 transition-transform duration-300 group-hover:scale-105 group-hover:border-white/30`}>
                      <step.icon className={`h-10 w-10 ${step.color.split(' ').pop()}`} />
                    </div>
                    {/* Badge on top left */}
                    <div className="absolute top-0 left-0 -ml-2 -mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-sm font-bold text-white shadow-lg z-20 border-[3px] border-[#060411]">
                      {idx + 1}
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white tracking-tight">{step.title}</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[220px] mx-auto">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Loved by event hosts (Testimonials) */}
      <section className="bg-[#060411] py-16 relative overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] pointer-events-none rounded-full"></div>
        <div className="mx-auto max-w-[1500px] px-8 text-center relative z-10">
            <h2 className="text-4xl font-extrabold md:text-[3.5rem] text-white tracking-tight mb-20">
              Loved by <span className="text-purple-500">event hosts</span>
            </h2>

            <div 
               className="relative w-full max-w-[1300px] mx-auto flex items-center justify-center"
               onMouseEnter={() => setIsHovered(true)}
               onMouseLeave={() => setIsHovered(false)}
            >
               <button 
                 onClick={() => setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                 className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/10 transition-colors absolute left-0 z-20"
               >
                 <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
               </button>

               <div className="overflow-hidden w-full max-w-6xl mx-auto px-4 lg:px-0 py-4">
                 <motion.div 
                   className="flex gap-8 w-full"
                   animate={{ x: `calc(-${testimonialIndex} * (33.3333% + 0.6666rem))` }}
                   transition={{ type: "spring", stiffness: 200, damping: 25 }}
                 >
                   {EXTENDED_TESTIMONIALS.map((t, i) => (
                      <div 
                        key={i} 
                        className="w-full md:w-[calc(33.3333%-1.3333rem)] shrink-0 rounded-[2rem] border border-white/5 border-t-white/20 border-l-white/20 bg-gradient-to-br from-[#1C1836] to-[#0B091A] p-10 text-left flex flex-col h-full shadow-2xl relative group hover:border-white/20 transition-colors"
                      >
                         <div className="flex gap-1 mb-8">
                           {[1,2,3,4,5].map(s => <Star key={`${i}-${s}`} className="w-5 h-5 fill-pink-500 text-pink-500" />)}
                         </div>
                         <p className="text-white text-lg font-medium leading-relaxed mb-10 flex-grow">
                           "{t.quote}"
                         </p>
                         <div className="flex items-center gap-4 mt-auto">
                           <Avatar className="w-12 h-12 border border-white/10">
                              <AvatarImage src={t.avatar} />
                              <AvatarFallback className="bg-pink-500 text-white font-bold">{t.name[0]}</AvatarFallback>
                           </Avatar>
                           <div>
                             <p className="text-white font-bold tracking-tight">{t.name}</p>
                             <p className="text-slate-400 text-xs font-medium mt-0.5">{t.title}</p>
                           </div>
                         </div>
                      </div>
                   ))}
                 </motion.div>
               </div>

               <button 
                 onClick={() => setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length)}
                 className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/10 transition-colors absolute right-0 z-20"
               >
                 <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
               </button>
            </div>
            
            {/* Pagination dots */}
            <div className="flex justify-center gap-2 mt-12">
               {TESTIMONIALS.map((_, i) => (
                 <button 
                   key={i}
                   onClick={() => setTestimonialIndex(i)}
                   className={`w-2 h-2 rounded-full transition-all duration-300 ${i === testimonialIndex ? 'bg-pink-500 w-6' : 'bg-white/20 hover:bg-white/40'}`}
                   aria-label={`Go to slide ${i + 1}`}
                 />
               ))}
            </div>
        </div>
      </section>

      {/* 7. Pricing */}
      <section id="pricing" className="bg-[#060411] py-16">
        <div className="mx-auto max-w-[1500px] px-8 text-center">
            <h2 className="text-4xl font-extrabold md:text-[3.5rem] text-white tracking-tight mb-4">
              Simple <span className="text-pink-500">pricing</span> per event
            </h2>
            <p className="text-lg text-slate-300 font-medium mb-20">Pay once. No subscriptions. No hidden fees.</p>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-end">
               {/* Tier 1 */}
               <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[2.5rem] border border-white/5 border-t-white/20 border-l-white/20 bg-gradient-to-br from-[#1C1836] to-[#0B091A] p-10 text-left h-[500px] flex flex-col relative overflow-hidden shadow-2xl">
                 <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20"><Users className="w-7 h-7 text-pink-500"/></div>
                   <div>
                     <p className="text-white font-bold text-lg mb-1">Up to 100 Guests</p>
                     <p className="text-4xl font-bold text-white flex items-end gap-2">$30 <span className="text-sm font-medium text-slate-400 mb-1">/ event</span></p>
                   </div>
                 </div>
                 <div className="w-full h-px bg-white/5 mb-8"></div>
                 <ul className="space-y-5 mb-10 flex-grow">
                   <li className="flex items-center gap-4 text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-pink-500 shrink-0"/> Invite & manage participants</li>
                   <li className="flex items-center gap-4 text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-pink-500 shrink-0"/> Smart matching system</li>
                   <li className="flex items-center gap-4 text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-pink-500 shrink-0"/> Results delivered by email</li>
                 </ul>
                 <Button onClick={handleHostEvent} variant="outline" className="w-full rounded-full py-6 text-white border-white/20 bg-transparent hover:bg-white/10 text-base font-bold transition-all">Create an Event</Button>
               </motion.div>

               {/* Tier 2 Most Popular */}
               <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="rounded-[2.5rem] border-[2.5px] border-pink-500 bg-[#120F22] p-10 text-left h-[540px] flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(236,72,153,0.15)] z-10">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-indigo-500 text-white text-[11px] uppercase tracking-wider font-bold px-6 py-1.5 rounded-b-xl shadow-lg">Most Popular</div>
                 <div className="flex items-center gap-4 mb-8 mt-4">
                   <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center border border-pink-500/30"><Users className="w-7 h-7 text-pink-400"/></div>
                   <div>
                     <p className="text-white font-bold text-lg mb-1">Up to 200 Guests</p>
                     <p className="text-5xl font-bold text-white flex items-end gap-2">$50 <span className="text-sm font-medium text-slate-400 mb-2">/ event</span></p>
                   </div>
                 </div>
                 <div className="w-full h-px bg-white/5 mb-8"></div>
                 <ul className="space-y-5 mb-10 flex-grow">
                   <li className="flex items-center gap-4 text-white font-medium"><CheckCircle className="w-5 h-5 text-pink-500 shrink-0"/> Everything in 100 plan</li>
                   <li className="flex items-center gap-4 text-white font-medium"><CheckCircle className="w-5 h-5 text-pink-500 shrink-0"/> Optimized for larger groups</li>
                   <li className="flex items-center gap-4 text-white font-medium"><CheckCircle className="w-5 h-5 text-pink-500 shrink-0"/> Faster processing</li>
                 </ul>
                 <Button onClick={handleHostEvent} className="w-full rounded-full py-6 text-white bg-gradient-to-r from-pink-500 to-indigo-500 hover:opacity-90 border-0 text-base font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)]">Create an Event</Button>
               </motion.div>

               {/* Tier 3 */}
               <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="rounded-[2.5rem] border border-white/5 border-t-white/20 border-l-white/20 bg-gradient-to-br from-[#1C1836] to-[#0B091A] p-10 text-left h-[500px] flex flex-col relative overflow-hidden shadow-2xl">
                 <div className="flex items-center gap-4 mb-6">
                   <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><BarChart3 className="w-7 h-7 text-blue-500"/></div>
                   <div>
                     <p className="text-white font-bold text-lg mb-1">From $0.30</p>
                     <p className="text-sm font-bold text-slate-300">per participant</p>
                   </div>
                 </div>
                 <p className="text-slate-400 font-medium mb-12">Less than the cost of<br/>a drink per guest 🍸</p>
                 <div className="w-full h-px bg-white/5 mb-8 mt-auto"></div>
                 <ul className="space-y-5 mb-6">
                   <li className="flex items-center gap-4 text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-blue-500 shrink-0"/> Pay only when your event runs</li>
                   <li className="flex items-center gap-4 text-slate-400 font-medium"><X className="w-5 h-5 text-slate-600 shrink-0"/> Cancel anytime</li>
                 </ul>
               </motion.div>
            </div>
        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <section className="bg-[#060411] py-16 pb-32">
        <div className="mx-auto max-w-[1500px] px-8">
           <div className="relative rounded-[3rem] bg-gradient-to-r from-[#20153D] to-[#3B1A3A] p-16 md:p-20 overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-2xl border border-white/5">
              {/* Background Decoration */}
              <div className="absolute right-[-100px] bottom-[-100px] opacity-30 pointer-events-none">
                 <Heart className="w-[400px] h-[400px] text-pink-500 stroke-[0.5] fill-transparent transform rotate-12" />
                 <Heart className="absolute top-[100px] right-[100px] w-[200px] h-[200px] text-purple-400 stroke-[1] fill-transparent transform -rotate-12" />
              </div>

              <div className="relative z-10 max-w-xl">
                 <h2 className="text-4xl md:text-[3.5rem] leading-[1.1] font-bold text-white tracking-tight mb-6">
                   Ready to host your next<br/><span className="text-pink-500">unforgettable</span> event?
                 </h2>
                 <p className="text-lg text-pink-100/70 font-medium leading-relaxed">
                   Join event hosts who trust Pairivo to create meaningful connections that last.
                 </p>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-12 md:mt-0">
                 <Button className="rounded-full px-10 py-7 text-lg bg-gradient-to-r from-pink-500 to-indigo-500 border-0 text-white shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:opacity-90 font-bold" onClick={handleHostEvent}>
                   Create Your Event <ArrowRight className="ml-2 w-5 h-5"/>
                 </Button>
                 <Button onClick={() => router.push('/contact')} variant="outline" className="rounded-full px-10 py-7 text-lg border-white/20 text-white bg-transparent hover:bg-white/10 transition-all font-bold">
                   Talk to Sales
                 </Button>
              </div>
           </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-[#060411] py-16 border-t border-white/5">
        <div className="mx-auto max-w-[1500px] px-8">
          <div className="grid gap-12 md:grid-cols-5">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="Pairivo Logo" className="w-10 h-10 object-contain" />
                <span className="text-2xl font-bold text-white tracking-tight">Pairivo</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-[250px] font-medium">
                Made for speed-dating
              </p>
            </div>
            
            <div>
              <h4 className="mb-6 font-bold text-white">Product</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><a href="#how-it-works" className="hover:text-pink-400 transition-colors">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-pink-400 transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-6 font-bold text-white">Help Center</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><Link href="/faq" className="hover:text-pink-400 transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-pink-400 transition-colors">Contact Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-6 font-bold text-white">Company</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><Link href="/about" className="hover:text-pink-400 transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-pink-400 transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 font-bold text-white">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><Link href="/terms-of-service" className="hover:text-pink-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-pink-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/refund-policy" className="hover:text-pink-400 transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-20 flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8">
            <div className="text-sm text-slate-500 font-medium mb-4 md:mb-0">
              © {new Date().getFullYear()} Pairivo. All rights reserved.
              {envConfigs.business_address && (
                <p className="mt-2 text-xs text-slate-600">
                  {envConfigs.business_address}
                </p>
              )}
            </div>
            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex gap-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-pink-500 transition-all"><Twitter className="w-4 h-4"/></a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-pink-500 transition-all"><Linkedin className="w-4 h-4"/></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-pink-500 transition-all"><Instagram className="w-4 h-4"/></a>
              </div>
              <div className="flex items-center gap-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                {/* Visa */}
                <svg viewBox="0 0 48 48" className="h-5 w-auto fill-current text-white/80">
                  <path d="M34.7 15.2c-2.3 0-4.1 1.2-5.1 2.9l-5.6 13.5h4.1l.8-2.3h5l.5 2.3h3.6l-3.3-16.4zm-4.3 11.2l1.9-5.3 1.1 5.3h-3zM15 15.2h-3.9L8.2 27.5l-.3-1.5c-.5-2.2-2.1-4.6-4.3-5.8l3.6 11.4h4.3l6.4-16.4h-2.9zM21.5 15.2l-3.2 16.4h3.9l3.2-16.4z"/>
                </svg>
                {/* Mastercard */}
                <svg viewBox="0 0 48 48" className="h-7 w-auto fill-current text-white/80">
                  <circle cx="18" cy="24" r="12" fillOpacity="0.8"/>
                  <circle cx="30" cy="24" r="12" fillOpacity="0.8"/>
                </svg>
                {/* PayPal */}
                <svg viewBox="0 0 24 24" className="h-5 w-auto fill-current text-white/80">
                  <path d="M20.067 8.178c-.552 2.766-2.26 4.316-5.125 4.316h-1.011c-.496 0-.909.351-.989.843l-.707 4.417c-.032.196-.201.341-.399.341H9.155c-.26 0-.447-.238-.403-.496l1.691-10.569c.08-.492.502-.843.999-.843h3.948c1.378 0 2.455.334 3.149 1.009.619.601.896 1.432.728 2.382z"/>
                </svg>
                {/* Stripe */}
                <div className="text-[10px] font-black tracking-tighter text-white/60 border border-white/20 px-1 rounded uppercase">Stripe</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
