import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarHeart, Settings2 } from 'lucide-react';
import { SiteConfig } from '../types';

interface LoveCounterSectionProps {
  config: SiteConfig;
  onOpenDateSettings: () => void;
}

interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  yearsApprox: number;
  monthsRemaining: number;
}

function calculateDuration(startIso: string): DurationParts {
  const startMs = new Date(startIso).getTime();
  const nowMs = Date.now();
  const diffMs = Math.max(0, isNaN(startMs) ? 0 : nowMs - startMs);

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const yearsApprox = Math.floor(days / 365);
  const monthsRemaining = Math.floor((days % 365) / 30);

  return { days, hours, minutes, seconds, yearsApprox, monthsRemaining };
}

export const LoveCounterSection: React.FC<LoveCounterSectionProps> = ({
  config,
  onOpenDateSettings,
}) => {
  const [duration, setDuration] = useState<DurationParts>(() =>
    calculateDuration(config.startDate)
  );

  useEffect(() => {
    setDuration(calculateDuration(config.startDate));
    const timer = setInterval(() => {
      setDuration(calculateDuration(config.startDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [config.startDate]);

  const formattedStartDate = (() => {
    const d = new Date(config.startDate);
    if (isNaN(d.getTime())) return config.startDate;
    return d.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  })();

  const boxes = [
    { label: 'الأيام', value: duration.days.toLocaleString('en-US') },
    { label: 'الساعات', value: String(duration.hours).padStart(2, '0') },
    { label: 'الدقائق', value: String(duration.minutes).padStart(2, '0') },
    { label: 'الثواني', value: String(duration.seconds).padStart(2, '0') },
  ];

  return (
    <section id="love-counter" className="py-14 sm:py-20 px-4 sm:px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.65 }}
        className="max-w-4xl mx-auto text-center"
      >
        <p
          className="text-xs sm:text-sm font-medium mb-1.5"
          style={{ color: config.theme.accentColor }}
        >
          منذ لحظة لقائنا الأولى · {formattedStartDate}
        </p>
        <h2
          className="font-serif-ar text-2xl sm:text-4xl font-bold mb-3"
          style={{ color: config.theme.textPrimary }}
        >
          عداد حبّنا بكلّ ثانية
        </h2>

        {(duration.yearsApprox > 0 || duration.monthsRemaining > 0) && (
          <p className="text-sm mb-8" style={{ color: config.theme.textMuted }}>
            أي ما يعادل {duration.yearsApprox > 0 ? `${duration.yearsApprox} سنة` : ''}
            {duration.yearsApprox > 0 && duration.monthsRemaining > 0 ? ' و ' : ''}
            {duration.monthsRemaining > 0 ? `${duration.monthsRemaining} شهر` : ''} من السعادة معاً
          </p>
        )}

        {/* Translucent Rose-Pink Counter Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mt-6">
          {boxes.map((box, index) => (
            <motion.div
              key={box.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              className="rounded-3xl py-6 px-4 backdrop-blur-md border shadow-[0_12px_32px_rgba(200,83,114,0.1)] transition-transform duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: 'rgba(247, 219, 227, 0.52)',
                borderColor: 'rgba(200, 83, 114, 0.22)',
              }}
            >
              <div
                className="font-serif-latin text-4xl sm:text-5xl font-bold tabular-nums tracking-tight mb-2"
                style={{ color: config.theme.accentColor }}
                dir="ltr"
              >
                {box.value}
              </div>
              <div
                className="text-sm font-medium flex items-center justify-center gap-1.5"
                style={{ color: config.theme.textPrimary }}
              >
                <span>{box.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Adjust Date Button */}
        <div className="mt-7 flex justify-center">
          <button
            type="button"
            onClick={onOpenDateSettings}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium px-4 py-2 rounded-xl border transition-all hover:brightness-95 cursor-pointer"
            style={{
              backgroundColor: config.theme.bgSurface,
              borderColor: 'var(--border-hairline)',
              color: config.theme.textMuted,
            }}
          >
            <CalendarHeart className="w-4 h-4" style={{ color: config.theme.accentColor }} />
            <span>تعديل تاريخ بداية العلاقة</span>
            <Settings2 className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </motion.div>
    </section>
  );
};
