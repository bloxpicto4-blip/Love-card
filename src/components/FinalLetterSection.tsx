import React from 'react';
import { motion } from 'motion/react';
import { Heart, Images } from 'lucide-react';
import { SiteConfig } from '../types';

interface FinalLetterSectionProps {
  config: SiteConfig;
}

const SURROUNDING_HEARTS = [
  { top: '-18px', right: '8%', size: 22, delay: '0s' },
  { top: '12%', right: '-14px', size: 18, delay: '1.1s' },
  { bottom: '18%', right: '-16px', size: 24, delay: '2.2s' },
  { top: '-14px', left: '10%', size: 20, delay: '0.7s' },
  { top: '22%', left: '-14px', size: 16, delay: '1.9s' },
  { bottom: '-16px', left: '14%', size: 22, delay: '1.4s' },
  { bottom: '-14px', right: '18%', size: 18, delay: '2.6s' },
];

export const FinalLetterSection: React.FC<FinalLetterSectionProps> = ({ config }) => {
  const [burstId, setBurstId] = React.useState(0);

  const scrollToMemories = () => {
    const el = document.getElementById('memories');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="final-letter"
      className="pt-14 pb-32 sm:pt-20 sm:pb-36 px-4 sm:px-6 relative z-10 overflow-hidden"
    >
      {/* Dreamy Soft Bottom Glow when reaching the end */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.55 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2 }}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-96 blur-3xl -z-10"
        style={{
          background: `radial-gradient(ellipse at center bottom, ${config.theme.accentSoft}, transparent 70%)`,
        }}
      />

      <div className="max-w-3xl mx-auto relative">
        {/* Animated Hearts Surrounding the Final Letter */}
        {SURROUNDING_HEARTS.map((h, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute z-20 animate-float-drift"
            style={{
              top: h.top,
              bottom: h.bottom,
              left: h.left,
              right: h.right,
              animationDelay: h.delay,
            }}
          >
            <Heart
              style={{
                width: h.size,
                height: h.size,
                color: config.theme.accentColor,
                fill: config.theme.accentSoft,
              }}
              className="opacity-85 drop-shadow-xs animate-heart-beat"
            />
          </div>
        ))}

        {/* Large Romantic Final Letter Card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[28px] p-8 sm:p-12 md:p-14 border shadow-[0_24px_65px_rgba(74,46,53,0.1)] text-center"
          style={{
            backgroundColor: config.theme.bgSurface,
            borderColor: 'rgba(200, 83, 114, 0.24)',
          }}
        >
          <div className="relative flex justify-center mb-6">
            {burstId > 0 &&
              [-64, -32, 0, 32, 64].map((offsetX, idx) => (
                <motion.div
                  key={`${burstId}-${idx}`}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: offsetX,
                    y: -75 - (idx % 2) * 28,
                    scale: 1,
                  }}
                  transition={{ duration: 1.15, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-none absolute top-2 z-30"
                >
                  <Heart
                    className="w-4 h-4"
                    style={{
                      color: config.theme.accentColor,
                      fill: config.theme.accentColor,
                    }}
                  />
                </motion.div>
              ))}
            <button
              type="button"
              onClick={() => setBurstId((b) => b + 1)}
              aria-label="إرسال قلوب حب"
              title="اضغط لإرسال قلوب"
              className="w-14 h-14 rounded-full flex items-center justify-center border hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              style={{
                backgroundColor: config.theme.accentSoft,
                borderColor: 'rgba(200, 83, 114, 0.25)',
              }}
            >
              <Heart
                className="w-6 h-6 animate-heart-beat"
                style={{
                  color: config.theme.accentColor,
                  fill: config.theme.accentColor,
                }}
              />
            </button>
          </div>

          <h2
            className="font-serif-ar text-2xl sm:text-4xl font-bold mb-6 leading-snug mx-auto max-w-xl"
            style={{ color: config.theme.textPrimary, textWrap: 'balance' }}
          >
            {config.finalLetter.heading}
          </h2>

          <p
            className="font-serif-ar text-lg sm:text-xl leading-[2.1] whitespace-pre-line max-w-2xl mx-auto mb-8"
            style={{ color: config.theme.textPrimary }}
          >
            {config.finalLetter.body}
          </p>

          <p
            className="font-serif-ar text-xl font-bold mb-10"
            style={{ color: config.theme.accentColor }}
          >
            {config.finalLetter.signature}
          </p>

          {/* Memories Button */}
          <button
            type="button"
            onClick={scrollToMemories}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-base font-medium text-white shadow-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
            style={{ backgroundColor: config.theme.accentColor }}
          >
            <Images className="w-4 h-4" />
            <span dir="ltr" className="font-serif-latin text-lg font-semibold tracking-wide">
              {config.finalLetter.buttonText || 'Memories'}
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};
