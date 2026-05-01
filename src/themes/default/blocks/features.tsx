'use client';

import { motion } from 'framer-motion';

import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Features as FeaturesType } from '@/shared/types/blocks/landing';

export function Features({
  features,
  className,
}: {
  features: FeaturesType;
  className?: string;
}) {
  return (
    <section
      id={features.id}
      className={cn('relative py-16 md:py-24 overflow-hidden', features.className, className)}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/30 to-transparent dark:via-pink-900/10 pointer-events-none" />
      <div className={`container relative space-y-8 md:space-y-16 z-10`}>
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center text-balance">
            <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight md:text-5xl">
              {features.title}
            </h2>
            <p className="text-muted-foreground mb-6 md:mb-12 lg:mb-16 md:text-lg">
              {features.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="relative mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.items?.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-md shadow-pink-100 border border-pink-100 transition-all hover:shadow-xl hover:shadow-pink-200 dark:bg-zinc-900/50 dark:border-pink-900/30 dark:shadow-none dark:hover:border-pink-500/30 dark:hover:bg-zinc-900/80"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-pink-900/20 dark:to-rose-900/20 pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-rose-500 group-hover:text-white transition-all duration-300 shadow-sm">
                    <SmartIcon name={item.icon as string} size={24} />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
