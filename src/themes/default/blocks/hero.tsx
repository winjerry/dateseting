'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Heart, Sparkles, Star } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { LazyImage, SmartIcon } from '@/shared/blocks/common';
import { AnimatedGridPattern } from '@/shared/components/ui/animated-grid-pattern';
import { Button } from '@/shared/components/ui/button';
import { Highlighter } from '@/shared/components/ui/highlighter';
import { cn } from '@/shared/lib/utils';
import { Hero as HeroType } from '@/shared/types/blocks/landing';

import { SocialAvatars } from './social-avatars';

const createFadeInVariant = (delay: number) => ({
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
  transition: {
    duration: 0.6,
    delay,
    ease: [0.22, 1, 0.36, 1] as const,
  },
});

const FloatingIcons = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-[10%] md:top-20 md:left-[15%] text-pink-500/40"
      >
        <Heart size={56} fill="currentColor" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-32 right-[5%] md:top-40 md:right-[15%] text-purple-500/30"
      >
        <Star size={42} fill="currentColor" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -25, 0], rotate: [0, -20, 20, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-10 left-[5%] md:bottom-20 md:left-[20%] text-rose-400/50"
      >
        <Sparkles size={48} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 30, 0], scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-20 right-[40%] md:bottom-32 md:right-[25%] text-orange-400/40"
      >
        <Heart size={36} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute bottom-40 left-[40%] text-red-400/30 hidden md:block"
      >
        <Heart size={64} fill="currentColor" />
      </motion.div>
    </div>
  );
};

export function Hero({
  hero,
  className,
}: {
  hero: HeroType;
  className?: string;
}) {
  const highlightText = hero.highlight_text ?? '';
  let texts = null;
  if (highlightText) {
    texts = hero.title?.split(highlightText, 2);
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-rose-500/5">
      <FloatingIcons />
      <section
        id={hero.id}
        className={`relative z-10 pt-24 pb-8 md:pt-36 md:pb-8 ${hero.className} ${className}`}
      >
        {hero.announcement && (
          <motion.div {...createFadeInVariant(0)}>
            <Link
              href={hero.announcement.url || ''}
              target={hero.announcement.target || '_self'}
              className="hover:bg-background/80 dark:hover:border-t-border bg-white/50 backdrop-blur-md group mx-auto mb-8 flex w-fit items-center gap-4 rounded-full border border-pink-200/50 p-1 pl-4 shadow-md shadow-pink-500/10 transition-colors duration-300 dark:bg-zinc-900/50 dark:border-pink-900/30"
            >
              <span className="text-foreground text-sm font-medium">
                {hero.announcement.title}
              </span>
              <span className="dark:border-background block h-4 w-0.5 border-l bg-pink-200 dark:bg-zinc-700"></span>

              <div className="bg-pink-100 dark:bg-zinc-800 group-hover:bg-pink-200 dark:group-hover:bg-zinc-700 size-6 overflow-hidden rounded-full duration-500">
                <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0 text-pink-600 dark:text-pink-400">
                  <span className="flex size-6">
                    <ArrowRight className="m-auto size-3" />
                  </span>
                  <span className="flex size-6">
                    <ArrowRight className="m-auto size-3" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <motion.div {...createFadeInVariant(0.15)}>
            {texts && texts.length > 0 ? (
              <h1 className="text-foreground text-5xl font-bold text-balance sm:mt-12 sm:text-7xl tracking-tight">
                {texts[0]}
                <Highlighter action="underline" color="#ec4899">
                  {highlightText}
                </Highlighter>
                {texts[1]}
              </h1>
            ) : (
              <h1 className="text-foreground text-5xl font-bold text-balance sm:mt-12 sm:text-7xl tracking-tight">
                {hero.title}
              </h1>
            )}
          </motion.div>

          <motion.p
            {...createFadeInVariant(0.3)}
            className="text-muted-foreground mt-8 mb-8 text-lg text-balance md:text-xl font-medium"
            dangerouslySetInnerHTML={{ __html: hero.description ?? '' }}
          />

          {hero.buttons && (
            <motion.div
              {...createFadeInVariant(0.45)}
              className="flex items-center justify-center gap-4"
            >
              {hero.buttons.map((button, idx) => (
                <motion.div key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    size={button.size || 'lg'}
                    variant={button.variant || 'default'}
                    className={cn(
                      "px-6 text-base rounded-full shadow-lg transition-all duration-300",
                      button.variant === 'default' 
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/25 border-0" 
                        : "border-pink-200 hover:bg-pink-50 dark:border-pink-900/50 dark:hover:bg-pink-900/20"
                    )}
                  >
                    <Link
                      href={button.url ?? ''}
                      target={button.target ?? '_self'}
                      className="flex items-center gap-2"
                    >
                      {button.icon && <SmartIcon name={button.icon as string} className="text-current" />}
                      <span>{button.title}</span>
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {hero.tip && (
            <motion.p
              {...createFadeInVariant(0.6)}
              className="text-muted-foreground/80 mt-6 block text-center text-sm font-medium"
              dangerouslySetInnerHTML={{ __html: hero.tip ?? '' }}
            />
          )}

          {hero.show_avatars && (
            <motion.div {...createFadeInVariant(0.75)} className="mt-8">
              <SocialAvatars tip={hero.avatars_tip || ''} />
            </motion.div>
          )}
        </div>
      </section>
      {hero.image && (
        <motion.section
          className="border-foreground/10 relative z-10 mt-8 border-y sm:mt-16"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.9,
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
        >
          <div className="relative mx-auto max-w-6xl border-x px-3">
            <div className="border-x bg-background/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl shadow-pink-500/10">
              <div
                aria-hidden
                className="absolute inset-0 h-full w-full bg-[repeating-linear-gradient(-45deg,var(--color-pink-500),var(--color-pink-500)_1px,transparent_1px,transparent_4px)] opacity-[0.03]"
              />
              <LazyImage
                className="border-border/25 relative z-2 hidden border dark:block transition-transform duration-700 hover:scale-[1.02]"
                src={hero.image_invert?.src || hero.image?.src || ''}
                alt={hero.image_invert?.alt || hero.image?.alt || ''}
              />
              <LazyImage
                className="border-border/25 relative z-2 border dark:hidden transition-transform duration-700 hover:scale-[1.02]"
                src={hero.image?.src || hero.image_invert?.src || ''}
                alt={hero.image?.alt || hero.image_invert?.alt || ''}
              />
            </div>
          </div>
        </motion.section>
      )}

      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.15}
        duration={3}
        repeatDelay={1}
        className={cn(
          '[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]',
          'inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 text-pink-500/20'
        )}
      />
    </div>
  );
}
