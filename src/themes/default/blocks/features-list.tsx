'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { SmartIcon } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Features as FeaturesType } from '@/shared/types/blocks/landing';

export function FeaturesList({
  features,
  className,
}: {
  features: FeaturesType;
  className?: string;
}) {
  return (
    // Prevent horizontal scrolling
    <section className={`relative overflow-x-hidden py-16 md:py-24 ${className}`}>
      <div className="absolute left-0 top-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-pink-100/50 via-transparent to-transparent dark:from-pink-900/10 pointer-events-none" />
      <div className="container overflow-x-hidden relative z-10">
        <div className="flex flex-wrap items-center gap-8 pb-12 md:gap-24">
          <ScrollAnimation direction="left">
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto w-full max-w-[500px] flex-shrink-0 md:mx-0 relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl opacity-50 rounded-[3rem] -z-10" />
              <Image
                src={features.image?.src ?? ''}
                alt={features.image?.alt ?? ''}
                width={500}
                height={300}
                className="h-auto w-full rounded-2xl object-cover shadow-2xl shadow-pink-500/10 border border-white/20"
                // Limit max image width & responsive width
                style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
              />
            </motion.div>
          </ScrollAnimation>
          <div className="w-full min-w-0 flex-1">
            <ScrollAnimation delay={0.1}>
              <h2 className="text-foreground text-4xl font-bold tracking-tight text-balance break-words md:text-5xl">
                {features.title}
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.2}>
              <p className="text-muted-foreground my-6 text-balance break-words text-lg">
                {features.description}
              </p>
            </ScrollAnimation>

            {features.buttons && features.buttons.length > 0 && (
              <ScrollAnimation delay={0.3}>
                <div className="flex flex-wrap items-center justify-start gap-4 mt-8">
                  {features.buttons?.map((button, idx) => (
                    <motion.div key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        asChild
                        variant={button.variant || 'default'}
                        size={button.size || 'lg'}
                        className={cn(
                          button.variant === 'default'
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25 border-0 rounded-full px-6"
                            : "rounded-full px-6 border-pink-200 hover:bg-pink-50 dark:border-pink-900/50 dark:hover:bg-pink-900/20"
                        )}
                      >
                        <Link
                          href={button.url ?? ''}
                          target={button.target ?? '_self'}
                          className="flex items-center gap-2"
                        >
                          {button.icon && (
                            <SmartIcon name={button.icon as string} size={20} className="text-current" />
                          )}
                          <span>{button.title}</span>
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </ScrollAnimation>
            )}
          </div>
        </div>

        <ScrollAnimation delay={0.1}>
          <div className="relative grid min-w-0 grid-cols-1 gap-4 pt-12 break-words sm:grid-cols-2 lg:grid-cols-4">
            {features.items?.map((item, idx) => (
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="group min-w-0 space-y-4 break-words p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-pink-100 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100 dark:bg-zinc-900/50 dark:border-zinc-800 dark:hover:border-pink-500/30 dark:hover:shadow-none transition-all cursor-default" 
                key={idx}
              >
                <div className="flex min-w-0 flex-col gap-4">
                  {item.icon && (
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-pink-50 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300 dark:bg-zinc-800 dark:text-pink-400 dark:group-hover:bg-pink-600 dark:group-hover:text-white">
                      <SmartIcon name={item.icon as string} size={24} />
                    </div>
                  )}
                  <h3 className="min-w-0 text-lg font-bold break-words text-foreground">
                    {item.title}
                  </h3>
                </div>
                <p className="text-muted-foreground min-w-0 text-sm leading-relaxed break-words">
                  {item.description ?? ''}
                </p>
              </motion.div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
