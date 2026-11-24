import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ImagePlus,
  Maximize2,
  Share2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { MemoryPhoto, SiteConfig } from '../types';
import { useResolvedMedia } from '../hooks/useResolvedMedia';
import { saveMediaBlob } from '../utils/mediaDb';

interface MemoriesGallerySectionProps {
  config: SiteConfig;
  onAddMemory: (memory: Omit<MemoryPhoto, 'id'>) => void;
  onDeleteMemory: (id: string) => void;
}

interface MemoryCardProps {
  memory: MemoryPhoto;
  index: number;
  config: SiteConfig;
  onOpenLightbox: (index: number) => void;
  onDelete: (id: string) => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  index,
  config,
  onOpenLightbox,
  onDelete,
}) => {
  const resolvedSrc = useResolvedMedia(memory.mediaKey, memory.src);
  const [imgError, setImgError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopySiteLink = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#memories`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadImage = async () => {
    if (!resolvedSrc || downloading) return;
    setDownloading(true);
    const safeName = (memory.caption || `memory-${index + 1}`)
      .slice(0, 36)
      .replace(/[\\/:*?"<>|]/g, '')
      .trim() || `memory-${index + 1}`;

    try {
      const response = await fetch(resolvedSrc);
      const blob = await response.blob();
      const ext = blob.type.includes('png')
        ? 'png'
        : blob.type.includes('webp')
        ? 'webp'
        : 'jpg';
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${safeName}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      const a = document.createElement('a');
      a.href = resolvedSrc;
      a.download = `${safeName}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-3xl p-4 sm:p-5 border shadow-[0_18px_48px_rgba(62,36,44,0.08)] transition-transform duration-500 hover:-translate-y-1"
      style={{
        backgroundColor: config.theme.bgSurface,
        borderColor: 'var(--border-hairline)',
      }}
    >
      {/* Photo Frame */}
      <div
        onClick={() => onOpenLightbox(index)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onOpenLightbox(index);
        }}
        aria-label={`عرض الصورة بحجم كامل: ${memory.caption}`}
        className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden cursor-pointer bg-rose-50/40"
      >
        {!imgError && resolvedSrc ? (
          <img
            src={resolvedSrc}
            alt={memory.caption || 'ذكرى رومانسية'}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
            style={{
              background: `linear-gradient(135deg, ${config.theme.bgSecondary}, ${config.theme.accentSoft})`,
            }}
          >
            <Camera
              className="w-10 h-10 mb-2 opacity-60"
              style={{ color: config.theme.accentColor }}
            />
            <p className="text-sm font-medium" style={{ color: config.theme.textPrimary }}>
              {memory.caption || 'صورة ذكرى'}
            </p>
          </div>
        )}

        {/* Subtle Hover Expand Affordance */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
          <span className="text-xs text-white font-medium flex items-center gap-1.5 drop-shadow-sm">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>اضغط للتكبير</span>
          </span>
        </div>
      </div>

      {/* Caption, Date & Actions Below Photo */}
      <div className="pt-4 px-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="font-serif-ar text-lg sm:text-xl leading-relaxed"
              style={{ color: config.theme.textPrimary }}
            >
              {memory.caption}
            </p>
            {memory.date && (
              <p className="text-xs mt-1" style={{ color: config.theme.textMuted }}>
                {memory.date}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShareOpen((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all hover:brightness-95 cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: shareOpen
                  ? config.theme.accentSoft
                  : config.theme.bgCanvas,
                borderColor: 'var(--border-hairline)',
                color: config.theme.accentColor,
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة الذكرى</span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(memory.id)}
              title="حذف الصورة"
              aria-label="حذف الصورة"
              className="p-2 rounded-xl opacity-55 hover:opacity-100 hover:bg-rose-50 transition-all shrink-0 cursor-pointer"
              style={{ color: config.theme.textMuted }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Share Memory Action Bar */}
        <AnimatePresence>
          {shareOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-3 border flex flex-wrap items-center justify-between gap-2"
              style={{
                backgroundColor: config.theme.bgCanvas,
                borderColor: 'var(--border-hairline)',
              }}
            >
              <button
                type="button"
                onClick={handleCopySiteLink}
                className="flex-1 min-w-[140px] px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 bg-white hover:brightness-95 transition-all cursor-pointer whitespace-nowrap"
                style={{
                  borderColor: 'var(--border-hairline)',
                  color: copied ? '#15803d' : config.theme.textPrimary,
                }}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تم نسخ رابط الموقع</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" style={{ color: config.theme.accentColor }} />
                    <span>نسخ رابط الموقع</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={!resolvedSrc || downloading}
                className="flex-1 min-w-[140px] px-3.5 py-2 rounded-xl text-xs font-medium text-white flex items-center justify-center gap-1.5 hover:brightness-105 disabled:opacity-45 transition-all cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: config.theme.accentColor }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? 'جاري التحميل...' : 'تحميل الصورة مباشرة'}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
};

const LightboxImage: React.FC<{ memory: MemoryPhoto }> = ({ memory }) => {
  const resolvedSrc = useResolvedMedia(memory.mediaKey, memory.src);
  if (!resolvedSrc) {
    return (
      <div className="w-80 h-60 rounded-2xl bg-white/10 flex items-center justify-center text-white/70 text-sm">
        جاري تحميل الصورة...
      </div>
    );
  }
  return (
    <img
      src={resolvedSrc}
      alt={memory.caption}
      referrerPolicy="no-referrer"
      className="max-h-[78vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
    />
  );
};

export const MemoriesGallerySection: React.FC<MemoriesGallerySectionProps> = ({
  config,
  onAddMemory,
  onDeleteMemory,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const [caption, setCaption] = useState('');
  const [dateText, setDateText] = useState(() =>
    new Date().toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const memories = config.memories;

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIdx((prev) =>
          prev === null ? null : (prev + 1) % memories.length
        );
      }
      if (e.key === 'ArrowRight') {
        setLightboxIdx((prev) =>
          prev === null ? null : (prev - 1 + memories.length) % memories.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIdx, memories.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUrlInput('');
    const objUrl = URL.createObjectURL(file);
    setPreviewUrl(objUrl);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !urlInput.trim()) return;
    setIsSaving(true);
    try {
      let mediaKey: string | undefined;
      let src = urlInput.trim();
      if (selectedFile) {
        mediaKey = `mem-img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        await saveMediaBlob(mediaKey, selectedFile);
        src = '';
      }
      onAddMemory({
        src,
        mediaKey,
        caption: caption.trim() || 'لحظة جميلة من ذكرياتنا',
        date: dateText.trim() || 'اليوم',
      });
      setCaption('');
      setUrlInput('');
      setSelectedFile(null);
      setPreviewUrl('');
      setShowAddForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section id="memories" className="py-14 sm:py-20 px-4 sm:px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
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
              ألبوم صورنا الطولي
            </p>
            <h2
              className="font-serif-ar text-2xl sm:text-4xl font-bold"
              style={{ color: config.theme.textPrimary }}
            >
              معرض الذكريات
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white shadow-xs transition-all flex items-center gap-2 hover:brightness-105 cursor-pointer whitespace-nowrap shrink-0"
            style={{ backgroundColor: config.theme.accentColor }}
          >
            {showAddForm ? <X className="w-4 h-4" /> : <ImagePlus className="w-4 h-4" />}
            <span>{showAddForm ? 'إلغاء' : 'إضافة صورة جديدة'}</span>
          </button>
        </motion.div>

        {/* Add New Memory Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28 }}
              onSubmit={handleAddSubmit}
              className="mb-10 rounded-3xl p-6 sm:p-7 border shadow-sm space-y-4"
              style={{
                backgroundColor: config.theme.bgSurface,
                borderColor: 'var(--border-hairline)',
              }}
            >
              <h3
                className="font-serif-ar text-xl font-bold"
                style={{ color: config.theme.textPrimary }}
              >
                إضافة ذكرى جديدة للمعرض
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: config.theme.textMuted }}
                  >
                    اختر صورة من جهازك
                  </label>
                  <label
                    className="h-11 rounded-xl border border-dashed px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium cursor-pointer hover:brightness-95 transition-all"
                    style={{
                      backgroundColor: config.theme.bgCanvas,
                      borderColor: config.theme.accentColor,
                      color: config.theme.accentColor,
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    <span className="truncate">
                      {selectedFile ? selectedFile.name : 'رفع صورة (JPG, PNG, WEBP)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: config.theme.textMuted }}
                  >
                    أو أدخل رابط صورة مباشر
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setSelectedFile(null);
                      setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://..."
                    className="w-full h-11 rounded-xl border px-3.5 text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: 'var(--border-hairline)',
                      color: config.theme.textPrimary,
                    }}
                  />
                </div>
              </div>

              {previewUrl && (
                <div className="rounded-2xl overflow-hidden max-h-48 border border-rose-100">
                  <img
                    src={previewUrl}
                    alt="معاينة الصورة"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: config.theme.textMuted }}
                  >
                    التعليق أسفل الصورة
                  </label>
                  <input
                    type="text"
                    required
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="مثلاً: أجمل مساء قضيناه معاً"
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
                    التاريخ
                  </label>
                  <input
                    type="text"
                    value={dateText}
                    onChange={(e) => setDateText(e.target.value)}
                    className="w-full h-10 rounded-xl border px-3.5 text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: 'var(--border-hairline)',
                      color: config.theme.textPrimary,
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving || (!selectedFile && !urlInput.trim())}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-white shadow-xs disabled:opacity-45 hover:brightness-105 transition-all cursor-pointer"
                  style={{ backgroundColor: config.theme.accentColor }}
                >
                  {isSaving ? 'جاري الحفظ...' : 'إضافة للمعرض'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Vertical Large-Format Gallery */}
        {memories.length > 0 ? (
          <div className="flex flex-col gap-10 sm:gap-12">
            {memories.map((memory, idx) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                index={idx}
                config={config}
                onOpenLightbox={(i) => setLightboxIdx(i)}
                onDelete={onDeleteMemory}
              />
            ))}
          </div>
        ) : (
          <div
            className="rounded-3xl border p-12 text-center"
            style={{
              backgroundColor: config.theme.bgSurface,
              borderColor: 'var(--border-hairline)',
            }}
          >
            <p className="text-sm mb-4" style={{ color: config.theme.textMuted }}>
              معرض الصور فارغ حالياً. أضف أولى ذكرياتكما المصوّرة!
            </p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer"
              style={{ backgroundColor: config.theme.accentColor }}
            >
              إضافة صورة جديدة
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxIdx !== null && memories[lightboxIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightboxIdx(null)}
            className="fixed inset-0 z-50 bg-black/88 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          >
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              aria-label="إغلاق العرض المكبر"
              className="absolute top-4 left-4 sm:top-6 sm:left-6 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {memories.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx(
                      (lightboxIdx - 1 + memories.length) % memories.length
                    );
                  }}
                  aria-label="الصورة السابقة"
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx((lightboxIdx + 1) % memories.length);
                  }}
                  aria-label="الصورة التالية"
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </>
            )}

            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center max-w-4xl w-full"
            >
              <LightboxImage memory={memories[lightboxIdx]} />
              <div className="mt-4 text-center text-white px-4">
                <p className="font-serif-ar text-lg sm:text-xl">
                  {memories[lightboxIdx].caption}
                </p>
                {memories[lightboxIdx].date && (
                  <p className="text-xs text-white/70 mt-1">
                    {memories[lightboxIdx].date}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
