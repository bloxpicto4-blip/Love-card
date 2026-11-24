import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { SiteConfig } from '../types';

interface NavbarProps {
  config: SiteConfig;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ config, onOpenSettings }) => {
  return (
    <header
      className="relative md:sticky md:top-0 z-30 border-b backdrop-blur-md transition-colors"
      style={{
        backgroundColor: 'rgba(255, 253, 249, 0.84)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand wordmark (single element) */}
        <a
          href="#top"
          className="font-serif-ar text-xl sm:text-2xl font-bold whitespace-nowrap shrink-0 tracking-tight transition-opacity hover:opacity-85"
          style={{ color: config.theme.textPrimary }}
        >
          {config.partnerOne} <span style={{ color: config.theme.accentColor }}>♥</span>{' '}
          {config.partnerTwo}
        </a>

        {/* Zone 2: Clean single-line nav links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
          style={{ color: config.theme.textMuted }}
        >
          <a
            href="#messages"
            className="hover:underline underline-offset-8 decoration-1 whitespace-nowrap shrink-0 transition-colors"
          >
            الرسائل
          </a>
          <a
            href="#love-counter"
            className="hover:underline underline-offset-8 decoration-1 whitespace-nowrap shrink-0 transition-colors"
          >
            عداد الحب
          </a>
          <a
            href="#memories"
            className="hover:underline underline-offset-8 decoration-1 whitespace-nowrap shrink-0 transition-colors"
          >
            معرض الصور
          </a>
          <a
            href="#final-letter"
            className="hover:underline underline-offset-8 decoration-1 whitespace-nowrap shrink-0 transition-colors"
          >
            الرسالة الأخيرة
          </a>
        </nav>

        {/* Zone 3: Single primary action button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white shadow-xs hover:brightness-105 active:scale-[0.98] transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            style={{ backgroundColor: config.theme.accentColor }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>تخصيص الموقع</span>
          </button>
        </div>
      </div>
    </header>
  );
};
