import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookHeart, ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { LoveMessage, SiteConfig } from '../types';

interface DiaryMessagesSectionProps {
  config: SiteConfig;
  onAddMessage: (msg: Omit<LoveMessage, 'id'>) => void;
  onDeleteMessage: (id: string) => void;
}

export const DiaryMessagesSection: React.FC<DiaryMessagesSectionProps> = ({
  config,
  onAddMessage,
  onDeleteMessage,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(() =>
    new Date().toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );
  const [newBody, setNewBody] = useState('');
  const [newSignature, setNewSignature] = useState(`${config.partnerOne} ♥`);

  const messages = config.messages;
  const safeIndex = messages.length > 0 ? Math.min(currentIndex, messages.length - 1) : 0;
  const currentMessage = messages[safeIndex];

  const handleNext = () => {
    if (messages.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % messages.length);
  };

  const handlePrev = () => {
    if (messages.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;
    onAddMessage({
      title: newTitle.trim(),
      date: newDate.trim() || 'اليوم',
      body: newBody.trim(),
      signature: newSignature.trim() || `${config.partnerOne} ♥`,
    });
    setNewTitle('');
    setNewBody('');
    setShowAddForm(false);
    setDirection(1);
    setCurrentIndex(messages.length);
  };

  return (
    <section id="messages" className="py-14 sm:py-20 px-4 sm:px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <p
              className="text-xs sm:text-sm font-medium mb-1.5"
              style={{ color: config.theme.accentColor }}
            >
              صفحات من يومياتنا
            </p>
            <h2
              className="font-serif-ar text-2xl sm:text-4xl font-bold"
              style={{ color: config.theme.textPrimary }}
            >
              الرسائل والذكريات المكتوبة
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-2 hover:brightness-95 cursor-pointer whitespace-nowrap shrink-0"
            style={{
              backgroundColor: config.theme.bgSurface,
              borderColor: 'var(--border-hairline)',
              color: config.theme.accentColor,
            }}
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showAddForm ? 'إغلاق النموذج' : 'إضافة رسالة جديدة'}</span>
          </button>
        </motion.div>

        {/* Add New Message Drawer */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              onSubmit={handleSubmitNew}
              className="mb-8 rounded-2xl p-6 sm:p-7 border shadow-sm space-y-4"
              style={{
                backgroundColor: config.theme.bgSurface,
                borderColor: 'var(--border-hairline)',
              }}
            >
              <h3
                className="font-serif-ar text-xl font-bold"
                style={{ color: config.theme.textPrimary }}
              >
                اكتب صفحة جديدة في اليوميات
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: config.theme.textMuted }}
                  >
                    عنوان الرسالة
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثلاً: رسالة صباحية دافئة"
                    className="w-full h-10 rounded-xl border px-3.5 text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: 'var(--border-hairline)',
                      color: config.theme.textPrimary,
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: config.theme.textMuted }}
                  >
                    تاريخ الكتابة
                  </label>
                  <input
                    type="text"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="12 نوفمبر 2026"
                    className="w-full h-10 rounded-xl border px-3.5 text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: 'var(--border-hairline)',
                      color: config.theme.textPrimary,
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: config.theme.textMuted }}
                >
                  نص الرسالة
                </label>
                <textarea
                  required
                  rows={4}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="اكتب مشاعرك هنا..."
                  className="w-full rounded-xl border p-3.5 text-sm leading-relaxed focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: 'var(--border-hairline)',
                    color: config.theme.textPrimary,
                  }}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="sm:w-1/2">
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: config.theme.textMuted }}
                  >
                    التوقيع
                  </label>
                  <input
                    type="text"
                    value={newSignature}
                    onChange={(e) => setNewSignature(e.target.value)}
                    className="w-full h-10 rounded-xl border px-3.5 text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: 'var(--border-hairline)',
                      color: config.theme.textPrimary,
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-white shadow-xs hover:brightness-105 transition-all self-end cursor-pointer"
                  style={{ backgroundColor: config.theme.accentColor }}
                >
                  حفظ في اليوميات
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Diary Card */}
        {currentMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65 }}
            className="relative rounded-3xl border shadow-[0_20px_50px_rgba(74,46,53,0.08)] overflow-hidden"
            style={{
              backgroundColor: config.theme.bgSurface,
              borderColor: 'var(--border-hairline)',
            }}
          >
            {/* Subtle Diary Ribbon Strip at Top */}
            <div
              className="h-1.5 w-full opacity-75"
              style={{ backgroundColor: config.theme.accentColor }}
            />

            <div className="diary-paper p-7 sm:p-11 min-h-[320px] flex flex-col justify-between">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentMessage.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * 28 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {/* Clean Metadata Row (unboxed, typographic separator) */}
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className="flex items-center gap-2 text-xs sm:text-sm"
                      style={{ color: config.theme.textMuted }}
                    >
                      <BookHeart
                        className="w-4 h-4 shrink-0"
                        style={{ color: config.theme.accentColor }}
                      />
                      <span>{currentMessage.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        صفحة {safeIndex + 1} من {messages.length}
                      </span>
                    </div>

                    {messages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteMessage(currentMessage.id)}
                        title="حذف هذه الرسالة"
                        aria-label="حذف هذه الرسالة"
                        className="p-2 rounded-lg opacity-55 hover:opacity-100 hover:bg-rose-50 transition-all cursor-pointer"
                        style={{ color: config.theme.textMuted }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Message Title & Body */}
                  <div>
                    <h3
                      className="font-serif-ar text-2xl sm:text-3xl font-bold mb-4 leading-snug"
                      style={{ color: config.theme.textPrimary }}
                    >
                      {currentMessage.title}
                    </h3>
                    <p
                      className="font-serif-ar text-lg sm:text-xl leading-[2.05] whitespace-pre-line"
                      style={{ color: config.theme.textPrimary }}
                    >
                      {currentMessage.body}
                    </p>
                  </div>

                  {/* Signature */}
                  <div className="pt-2 flex justify-end">
                    <p
                      className="font-serif-ar text-lg font-bold italic"
                      style={{ color: config.theme.accentColor }}
                    >
                      — {currentMessage.signature}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Diary Navigation Footer with explicit "Next" button */}
              <div
                className="mt-8 pt-6 border-t flex items-center justify-between gap-4"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={messages.length <= 1}
                  className="px-4 py-2 rounded-xl text-sm font-medium border flex items-center gap-1.5 transition-all hover:brightness-95 disabled:opacity-40 cursor-pointer"
                  style={{
                    backgroundColor: config.theme.bgCanvas,
                    borderColor: 'var(--border-hairline)',
                    color: config.theme.textPrimary,
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                {/* Page Indicator Dots */}
                <div className="flex items-center gap-1.5">
                  {messages.map((m, idx) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setDirection(idx > safeIndex ? 1 : -1);
                        setCurrentIndex(idx);
                      }}
                      aria-label={`الانتقال إلى الرسالة ${idx + 1}`}
                      className="h-2 rounded-full transition-all cursor-pointer"
                      style={{
                        width: idx === safeIndex ? '20px' : '8px',
                        backgroundColor:
                          idx === safeIndex
                            ? config.theme.accentColor
                            : 'rgba(162, 92, 112, 0.25)',
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={messages.length <= 1}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white shadow-xs flex items-center gap-2 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-40 cursor-pointer"
                  style={{ backgroundColor: config.theme.accentColor }}
                >
                  <span dir="ltr" className="font-serif-latin text-base font-semibold tracking-wide">
                    Next
                  </span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div
            className="rounded-3xl border p-10 text-center"
            style={{
              backgroundColor: config.theme.bgSurface,
              borderColor: 'var(--border-hairline)',
            }}
          >
            <p className="text-sm mb-4" style={{ color: config.theme.textMuted }}>
              لا توجد رسائل بعد. أضف رسالتك الأولى الآن!
            </p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer"
              style={{ backgroundColor: config.theme.accentColor }}
            >
              إضافة رسالة جديدة
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
