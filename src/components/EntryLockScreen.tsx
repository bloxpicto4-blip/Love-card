import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Heart, HelpCircle, LockKeyhole, Sparkles } from 'lucide-react';
import { SiteConfig } from '../types';

interface EntryLockScreenProps {
  config: SiteConfig;
  onUnlock: () => void;
}

const ENVELOPE_BURST_HEARTS = [
  { x: -95, y: -135, scale: 1.05, rotate: -18, delay: 0.05 },
  { x: -45, y: -165, scale: 0.85, rotate: -8, delay: 0.12 },
  { x: 0, y: -185, scale: 1.2, rotate: 4, delay: 0.08 },
  { x: 52, y: -160, scale: 0.9, rotate: 14, delay: 0.16 },
  { x: 100, y: -130, scale: 1.0, rotate: 22, delay: 0.1 },
  { x: -70, y: -105, scale: 0.75, rotate: -25, delay: 0.2 },
  { x: 75, y: -105, scale: 0.8, rotate: 18, delay: 0.22 },
];

const LOCK_AMBIENT_HEARTS = [
  { left: '12%', size: 18, delay: '0s', duration: '12s' },
  { left: '28%', size: 14, delay: '3s', duration: '14s' },
  { left: '50%', size: 20, delay: '1.5s', duration: '13s' },
  { left: '72%', size: 15, delay: '4.5s', duration: '15s' },
  { left: '88%', size: 18, delay: '2.2s', duration: '11.5s' },
];

export const EntryLockScreen: React.FC<EntryLockScreenProps> = ({ config, onUnlock }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleOpenEnvelope = () => {
    if (!isOpened) {
      setIsOpened(true);
    }
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedInput = passwordInput.trim().toLowerCase();
    const cleanedExpected = (config.password || 'love').trim().toLowerCase();

    if (cleanedInput === cleanedExpected) {
      setErrorMsg('');
      setIsUnlocking(true);
      setTimeout(() => {
        onUnlock();
      }, 650);
    } else {
      setErrorMsg('كلمة المرور غير صحيحة يا من أحبّ، حاول مجدداً أو افتح التلميح اللطيف 💕');
      setShakeKey((prev) => prev + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isUnlocking ? 0 : 1, scale: isUnlocking ? 1.04 : 1 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 py-10 overflow-hidden select-none"
      style={{
        background: `radial-gradient(circle at 50% 35%, ${config.theme.bgSurface} 0%, ${config.theme.bgCanvas} 55%, ${config.theme.bgSecondary} 100%)`,
      }}
    >
      {/* Subtle Ambient Corner Florals */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-45"
        style={{ backgroundColor: config.theme.accentSoft }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-40"
        style={{ backgroundColor: config.theme.accentSoft }}
      />

      {/* Ambient Floating Rising Hearts on Lock Screen */}
      {config.theme.showDecorations &&
        LOCK_AMBIENT_HEARTS.map((h, idx) => (
          <div
            key={idx}
            aria-hidden="true"
            className="pointer-events-none fixed -bottom-8 animate-heart-rise z-0"
            style={{
              left: h.left,
              animationDelay: h.delay,
              animationDuration: h.duration,
            }}
          >
            <Heart
              style={{
                width: h.size,
                height: h.size,
                color: config.theme.accentColor,
                fill: config.theme.accentSoft,
              }}
              className="opacity-65"
            />
          </div>
        ))}

      {/* Couple Names Header above envelope */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-8 text-center z-10"
      >
        <p
          className="text-sm tracking-wide mb-1"
          style={{ color: config.theme.textMuted }}
        >
          رسالة خاصة إلى
        </p>
        <h1
          className="font-serif-ar text-3xl sm:text-4xl font-bold"
          style={{ color: config.theme.textPrimary }}
        >
          {config.partnerOne} &amp; {config.partnerTwo}
        </h1>
      </motion.div>

      {/* Realistic Interactive Envelope Container */}
      <div className="relative z-10 w-full max-w-[430px] flex flex-col items-center">
        <div
          onClick={handleOpenEnvelope}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleOpenEnvelope();
          }}
          aria-label="اضغط لفتح ظرف رسالة الحب"
          className={`relative w-full max-w-[390px] transition-transform duration-500 ${
            !isOpened ? 'cursor-pointer hover:-translate-y-1.5' : ''
          }`}
          style={{ perspective: '1200px' }}
        >
          {/* Heart Burst Animation on Envelope Open */}
          <AnimatePresence>
            {isOpened &&
              ENVELOPE_BURST_HEARTS.map((h, i) => (
                <motion.div
                  key={`burst-${i}`}
                  initial={{ opacity: 0, x: 0, y: 20, scale: 0.3, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    x: h.x,
                    y: h.y,
                    scale: h.scale,
                    rotate: h.rotate,
                  }}
                  transition={{
                    duration: 1.55,
                    delay: h.delay,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 z-40"
                >
                  <Heart
                    className="w-6 h-6"
                    style={{
                      color: config.theme.accentColor,
                      fill: config.theme.accentColor,
                    }}
                  />
                </motion.div>
              ))}
          </AnimatePresence>

          {/* Animated Letter Rising Out of Envelope */}
          <AnimatePresence>
            {isOpened && (
              <motion.div
                initial={{ y: 70, opacity: 0, scale: 0.94 }}
                animate={{ y: -24, opacity: 1, scale: 1 }}
                transition={{ duration: 0.75, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 mx-auto w-[92%] rounded-2xl p-6 sm:p-7 shadow-[0_18px_45px_rgba(62,36,44,0.12)] border"
                style={{
                  backgroundColor: config.theme.bgSurface,
                  borderColor: 'rgba(200, 83, 114, 0.22)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="font-serif-ar text-lg font-bold"
                    style={{ color: config.theme.accentColor }}
                  >
                    {config.envelopeNoteTitle}
                  </span>
                  <Heart
                    className="w-5 h-5 animate-heart-beat shrink-0"
                    style={{ color: config.theme.accentColor, fill: config.theme.accentSoft }}
                  />
                </div>
                <p
                  className="text-sm sm:text-[15px] leading-relaxed mb-2 font-serif-ar"
                  style={{ color: config.theme.textPrimary }}
                >
                  {config.envelopeNoteBody}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Envelope Outer Body */}
          <div
            className="relative w-full h-[240px] sm:h-[260px] rounded-2xl shadow-[0_24px_55px_rgba(88,52,60,0.16)] overflow-hidden border transition-all duration-500"
            style={{
              backgroundColor: '#F5E7DA',
              borderColor: 'rgba(176, 128, 114, 0.3)',
              marginTop: isOpened ? '-24px' : '0px',
            }}
          >
            {/* Subtle Paper Texture Overlay */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(140,95,85,0.15) 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            />

            {/* Envelope Bottom & Side Fold Triangles (SVG for crisp realistic geometry) */}
            <svg
              viewBox="0 0 400 260"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {/* Left fold */}
              <polygon points="0,0 200,138 0,260" fill="#EFE0D1" />
              {/* Right fold */}
              <polygon points="400,0 200,138 400,260" fill="#ECDAC9" />
              {/* Bottom fold */}
              <polygon
                points="0,260 200,122 400,260"
                fill="#F7ECE1"
                stroke="rgba(165, 115, 105, 0.22)"
                strokeWidth="1.2"
              />
            </svg>

            {/* Top Flap (3D Rotating) */}
            <motion.div
              initial={false}
              animate={{ rotateX: isOpened ? 175 : 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                transformOrigin: 'top center',
                transformStyle: 'preserve-3d',
                zIndex: isOpened ? 5 : 30,
              }}
              className="absolute top-0 inset-x-0 h-[148px] pointer-events-none"
            >
              <svg viewBox="0 0 400 148" preserveAspectRatio="none" className="w-full h-full drop-shadow-sm">
                <polygon
                  points="0,0 400,0 200,142"
                  fill="#FBF2E9"
                  stroke="rgba(165, 115, 105, 0.25)"
                  strokeWidth="1.2"
                />
              </svg>
            </motion.div>

            {/* Wax Heart Seal + "I LOVE my everything ❤️" Text */}
            <div className="relative z-30 h-full flex flex-col items-center justify-between py-6 px-5 text-center">
              {/* Top wax seal button */}
              <motion.div
                animate={{
                  scale: isOpened ? 0.8 : 1,
                  opacity: isOpened ? 0.35 : 1,
                  y: isOpened ? -10 : 0,
                }}
                transition={{ duration: 0.45 }}
                className="mt-14 w-12 h-12 rounded-full flex items-center justify-center shadow-md border-2"
                style={{
                  backgroundColor: config.theme.accentColor,
                  borderColor: 'rgba(255,255,255,0.45)',
                }}
              >
                <Heart className="w-5 h-5 text-white fill-white" />
              </motion.div>

              {/* Required Envelope Text */}
              <div className="mt-auto pt-2">
                <p
                  dir="ltr"
                  className="font-serif-latin text-xl sm:text-2xl font-semibold tracking-wide drop-shadow-xs"
                  style={{ color: config.theme.textPrimary }}
                >
                  {config.envelopeText}
                </p>
                {!isOpened && (
                  <p
                    className="mt-1.5 text-xs font-medium flex items-center justify-center gap-1.5"
                    style={{ color: config.theme.accentColor }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>اضغط على الظرف لفتح الرسالة</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Protection Form */}
        <motion.div
          key={shakeKey}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className={`w-full max-w-[390px] mt-6 rounded-2xl p-5 sm:p-6 border shadow-sm backdrop-blur-md ${
            shakeKey > 0 ? 'animate-shake' : ''
          }`}
          style={{
            backgroundColor: 'rgba(255, 253, 249, 0.88)',
            borderColor: 'rgba(200, 83, 114, 0.18)',
          }}
        >
          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <label
                htmlFor="site-password-input"
                className="text-sm font-semibold flex items-center gap-2"
                style={{ color: config.theme.textPrimary }}
              >
                <LockKeyhole className="w-4 h-4" style={{ color: config.theme.accentColor }} />
                <span>كلمة المرور للدخول</span>
              </label>

              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="text-xs flex items-center gap-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 rounded px-1 py-0.5 cursor-pointer"
                style={{ color: config.theme.accentColor }}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>تلميح</span>
              </button>
            </div>

            {showHint && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs rounded-xl px-3 py-2"
                style={{
                  backgroundColor: config.theme.accentSoft,
                  color: config.theme.textPrimary,
                }}
              >
                التلميح: {config.passwordHint}
              </motion.p>
            )}

            <div className="relative">
              <input
                id="site-password-input"
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                dir="auto"
                placeholder="أدخل كلمة المرور هنا..."
                className="w-full h-11 rounded-xl border px-4 pl-11 text-sm focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: errorMsg ? '#D1435B' : 'rgba(162, 92, 112, 0.25)',
                  color: config.theme.textPrimary,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-70 hover:opacity-100 cursor-pointer"
                style={{ color: config.theme.textMuted }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="text-xs font-medium leading-relaxed rounded-xl px-3.5 py-2.5"
                style={{
                  backgroundColor: 'rgba(225, 75, 100, 0.1)',
                  color: '#A92642',
                }}
              >
                {errorMsg}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold text-sm text-white shadow-sm hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: config.theme.accentColor }}
            >
              <span dir="ltr" className="font-serif-latin text-base tracking-wide font-semibold">
                Unlock ❤️
              </span>
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};
