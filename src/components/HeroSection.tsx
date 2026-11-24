import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Heart } from 'lucide-react';
import { SiteConfig } from '../types';

interface HeroSectionProps {
  config: SiteConfig;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config }) => {
  const [heroBurst, setHeroBurst] = React.useState(0);

  return (
    <section
      id="top"
      className="relative pt-14 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 overflow-hidden"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Delicate floral / heart divider crest */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="relative inline-flex items-center gap-3 mb-6"
          style={{ color: config.theme.accentColor }}
        >
          {heroBurst > 0 &&
            [-48, -22, 0, 22, 48].map((offsetX, idx) => (
              <motion.div
                key={`${heroBurst}-${idx}`}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: offsetX,
                  y: -52 - (idx % 2) * 20,
                  scale: 1,
                }}
                transition={{ duration: 1.05, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 z-20"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
              </motion.div>
            ))}
          <span className="h-px w-10 sm:w-14 bg-current opacity-35" />
          <button
            type="button"
            onClick={() => setHeroBurst((b) => b + 1)}
            aria-label="إرسال قلوب"
            className="p-1 rounded-full hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          >
            <Heart className="w-5 h-5 animate-heart-beat fill-current opacity-90" />
          </button>
          <span className="h-px w-10 sm:w-14 bg-current opacity-35" />
        </motion.div>

        {/* Couple Names Kicker */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="text-sm sm:text-base font-medium mb-4 tracking-wide"
          style={{ color: config.theme.accentColor }}
        >
          حكاية {config.partnerOne} و{config.partnerTwo}
        </motion.p>

        {/* Romantic Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.16 }}
          className="font-serif-ar text-3xl sm:text-5xl md:text-[54px] font-bold leading-[1.3] mb-6 mx-auto max-w-3xl"
          style={{
            color: config.theme.textPrimary,
            textWrap: 'balance',
          }}
        >
          {config.heroTitle}
        </motion.h1>

        {/* Poetic Lead Copy */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.24 }}
          className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10"
          style={{ color: config.theme.textMuted }}
        >
          {config.heroSubtitle}
        </motion.p>

        {/* Single Focal Action */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
        >
          <a
            href="#messages"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm sm:text-base font-medium text-white shadow-sm hover:brightness-105 active:scale-[0.98] transition-all"
            style={{ backgroundColor: config.theme.accentColor }}
          >
            <span>تصفّح رسائلنا</span>
            <ArrowDown className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
