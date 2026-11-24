import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { User } from 'firebase/auth';
import {
  BookHeart,
  Cloud,
  Heart,
  Image,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Music,
  Palette,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { LoveMessage, MemoryPhoto, MusicTrack, SiteConfig } from '../types';
import { THEME_PRESETS } from '../data/defaultConfig';
import { saveMediaBlob } from '../utils/mediaDb';

export type SettingsTab = 'general' | 'messages' | 'memories' | 'music' | 'theme';

interface CustomizationPanelProps {
  isOpen: boolean;
  initialTab?: SettingsTab;
  config: SiteConfig;
  allTracks: MusicTrack[];
  user: User | null;
  isUploadingTrack: boolean;
  cloudError: string;
  onUpdateConfig: (updater: (prev: SiteConfig) => SiteConfig) => void;
  onUploadAudioFile: (file: File) => Promise<boolean>;
  onUpdateTrackMeta: (
    track: MusicTrack,
    patch: { title?: string; artist?: string }
  ) => Promise<void>;
  onDeleteTrack: (track: MusicTrack) => Promise<void>;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
  onClose: () => void;
  onLockNow: () => void;
  onResetDefaults: () => void;
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  isOpen,
  initialTab = 'general',
  config,
  allTracks,
  user,
  isUploadingTrack,
  cloudError,
  onUpdateConfig,
  onUploadAudioFile,
  onUpdateTrackMeta,
  onDeleteTrack,
  onSignInGoogle,
  onSignOutGoogle,
  onClose,
  onLockNow,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [confirmReset, setConfirmReset] = useState(false);

  // Sync tab when opened with a specific initialTab (e.g. from Love Counter date button)
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setConfirmReset(false);
    }
  }, [isOpen, initialTab]);

  // Upload handlers
  const handleAddMemoryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const mediaKey = `mem-img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await saveMediaBlob(mediaKey, file);
    const newMem: MemoryPhoto = {
      id: `mem-${Date.now()}`,
      src: '',
      mediaKey,
      caption: 'ذكرى جديدة جميلة',
      date: new Date().toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
    onUpdateConfig((prev) => ({
      ...prev,
      memories: [...prev.memories, newMem],
    }));
    e.target.value = '';
  };

  const handleAddMp3File = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUploadAudioFile(file);
    e.target.value = '';
  };

  const handleUploadTrackCover = async (
    trackId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const coverKey = `cover-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await saveMediaBlob(coverKey, file);
    onUpdateConfig((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId ? { ...t, coverMediaKey: coverKey } : t
      ),
    }));
    e.target.value = '';
  };

  const handleUploadCustomBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const bgKey = `bg-${Date.now()}`;
    await saveMediaBlob(bgKey, file);
    onUpdateConfig((prev) => ({
      ...prev,
      theme: { ...prev.theme, customBgMediaKey: bgKey, customBgUrl: '' },
    }));
    e.target.value = '';
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'عام والقفل', icon: <Heart className="w-4 h-4" /> },
    { id: 'messages', label: 'الرسائل', icon: <BookHeart className="w-4 h-4" /> },
    { id: 'memories', label: 'الصور', icon: <Image className="w-4 h-4" /> },
    { id: 'music', label: 'الأغاني', icon: <Music className="w-4 h-4" /> },
    { id: 'theme', label: 'الألوان', icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex justify-end"
        >
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl h-full bg-[#FFFDF9] shadow-2xl flex flex-col border-l"
            style={{
              borderColor: 'var(--border-hairline)',
              color: config.theme.textPrimary,
            }}
          >
            {/* Panel Header */}
            <div
              className="px-5 sm:px-7 py-4 border-b flex items-center justify-between gap-4 shrink-0"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div>
                <h2 className="font-serif-ar text-xl sm:text-2xl font-bold">
                  لوحة التحكم والتخصيص
                </h2>
                <p className="text-xs" style={{ color: config.theme.textMuted }}>
                  تُحفظ التغييرات تلقائياً وفورياً
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLockNow();
                  }}
                  className="px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap"
                  style={{
                    borderColor: 'var(--border-hairline)',
                    color: config.theme.accentColor,
                  }}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>قفل الشاشة</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="إغلاق لوحة التخصيص"
                  className="w-9 h-9 rounded-xl border flex items-center justify-center hover:bg-rose-50 transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="px-4 sm:px-7 py-2.5 border-b flex items-center gap-1.5 overflow-x-auto shrink-0"
              style={{
                backgroundColor: config.theme.bgCanvas,
                borderColor: 'var(--border-hairline)',
              }}
            >
              {tabs.map((t) => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer"
                    style={{
                      backgroundColor: active ? config.theme.accentColor : 'transparent',
                      color: active ? '#FFFFFF' : config.theme.textMuted,
                    }}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              {/* TAB 1: GENERAL & LOCK */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        اسم الشخص الأول
                      </label>
                      <input
                        type="text"
                        value={config.partnerOne}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({ ...p, partnerOne: e.target.value }))
                        }
                        className="w-full h-10 rounded-xl border px-3.5 text-sm bg-white"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        اسم الشخص الثاني
                      </label>
                      <input
                        type="text"
                        value={config.partnerTwo}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({ ...p, partnerTwo: e.target.value }))
                        }
                        className="w-full h-10 rounded-xl border px-3.5 text-sm bg-white"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">
                      تاريخ ووقت بداية العلاقة (لعداد الحب)
                    </label>
                    <input
                      type="datetime-local"
                      value={config.startDate}
                      onChange={(e) =>
                        onUpdateConfig((p) => ({ ...p, startDate: e.target.value }))
                      }
                      className="w-full h-10 rounded-xl border px-3.5 text-sm bg-white"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        كلمة مرور الدخول
                      </label>
                      <input
                        type="text"
                        value={config.password}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({ ...p, password: e.target.value }))
                        }
                        className="w-full h-10 rounded-xl border px-3.5 text-sm bg-white"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        تلميح كلمة المرور
                      </label>
                      <input
                        type="text"
                        value={config.passwordHint}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({ ...p, passwordHint: e.target.value }))
                        }
                        className="w-full h-10 rounded-xl border px-3.5 text-sm bg-white"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">
                      العبارة المكتوبة على الظرف
                    </label>
                    <input
                      type="text"
                      value={config.envelopeText}
                      onChange={(e) =>
                        onUpdateConfig((p) => ({ ...p, envelopeText: e.target.value }))
                      }
                      className="w-full h-10 rounded-xl border px-3.5 text-sm bg-white"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">
                      عنوان الرسالة المتحركة داخل الظرف
                    </label>
                    <input
                      type="text"
                      value={config.envelopeNoteTitle}
                      onChange={(e) =>
                        onUpdateConfig((p) => ({
                          ...p,
                          envelopeNoteTitle: e.target.value,
                        }))
                      }
                      className="w-full h-10 rounded-xl border px-3.5 text-sm bg-white"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">
                      نص الرسالة المتحركة داخل الظرف
                    </label>
                    <textarea
                      rows={3}
                      value={config.envelopeNoteBody}
                      onChange={(e) =>
                        onUpdateConfig((p) => ({
                          ...p,
                          envelopeNoteBody: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border p-3 text-sm bg-white"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    />
                  </div>

                  <div className="pt-2 border-t space-y-4" style={{ borderColor: 'var(--border-hairline)' }}>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        العنوان الرئيسي في الصفحة
                      </label>
                      <input
                        type="text"
                        value={config.heroTitle}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({ ...p, heroTitle: e.target.value }))
                        }
                        className="w-full h-10 rounded-xl border px-3.5 text-sm bg-white"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        النص التمهيدي أسفل العنوان
                      </label>
                      <textarea
                        rows={2}
                        value={config.heroSubtitle}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({
                            ...p,
                            heroSubtitle: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border p-3 text-sm bg-white"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t space-y-4" style={{ borderColor: 'var(--border-hairline)' }}>
                    <h3 className="font-serif-ar text-lg font-bold">الرسالة الأخيرة</h3>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        عنوان الرسالة الأخيرة
                      </label>
                      <input
                        type="text"
                        value={config.finalLetter.heading}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({
                            ...p,
                            finalLetter: { ...p.finalLetter, heading: e.target.value },
                          }))
                        }
                        className="w-full h-10 rounded-xl border px-3.5 text-sm bg-white"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        محتوى الرسالة الأخيرة
                      </label>
                      <textarea
                        rows={5}
                        value={config.finalLetter.body}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({
                            ...p,
                            finalLetter: { ...p.finalLetter, body: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border p-3 text-sm leading-relaxed bg-white"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1.5">
                          توقيع الرسالة الأخيرة
                        </label>
                        <input
                          type="text"
                          value={config.finalLetter.signature}
                          onChange={(e) =>
                            onUpdateConfig((p) => ({
                              ...p,
                              finalLetter: { ...p.finalLetter, signature: e.target.value },
                            }))
                          }
                          className="w-full h-10 rounded-xl border px-3.5 text-sm bg-white"
                          style={{ borderColor: 'var(--border-hairline)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5">
                          نص زر الذكريات
                        </label>
                        <input
                          type="text"
                          value={config.finalLetter.buttonText}
                          onChange={(e) =>
                            onUpdateConfig((p) => ({
                              ...p,
                              finalLetter: {
                                ...p.finalLetter,
                                buttonText: e.target.value,
                              },
                            }))
                          }
                          className="w-full h-10 rounded-xl border px-3.5 text-sm bg-white"
                          style={{ borderColor: 'var(--border-hairline)' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MESSAGES */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-ar text-lg font-bold">
                      رسائل اليوميات ({config.messages.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newMsg: LoveMessage = {
                          id: `msg-${Date.now()}`,
                          title: 'رسالة حب جديدة',
                          date: new Date().toLocaleDateString('ar-EG', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }),
                          body: 'اكتب كلماتك الرومانسية هنا...',
                          signature: `${config.partnerOne} ♥`,
                        };
                        onUpdateConfig((p) => ({
                          ...p,
                          messages: [...p.messages, newMsg],
                        }));
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium text-white flex items-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: config.theme.accentColor }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>رسالة جديدة</span>
                    </button>
                  </div>

                  {config.messages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      className="rounded-2xl p-4 border space-y-3 bg-white"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: config.theme.accentColor }}
                        >
                          الرسالة #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateConfig((p) => ({
                              ...p,
                              messages: p.messages.filter((m) => m.id !== msg.id),
                            }))
                          }
                          aria-label="حذف الرسالة"
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={msg.title}
                          onChange={(e) =>
                            onUpdateConfig((p) => ({
                              ...p,
                              messages: p.messages.map((m) =>
                                m.id === msg.id ? { ...m, title: e.target.value } : m
                              ),
                            }))
                          }
                          placeholder="العنوان"
                          className="h-9 rounded-lg border px-3 text-sm"
                          style={{ borderColor: 'var(--border-hairline)' }}
                        />
                        <input
                          type="text"
                          value={msg.date}
                          onChange={(e) =>
                            onUpdateConfig((p) => ({
                              ...p,
                              messages: p.messages.map((m) =>
                                m.id === msg.id ? { ...m, date: e.target.value } : m
                              ),
                            }))
                          }
                          placeholder="التاريخ"
                          className="h-9 rounded-lg border px-3 text-sm"
                          style={{ borderColor: 'var(--border-hairline)' }}
                        />
                      </div>
                      <textarea
                        rows={3}
                        value={msg.body}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({
                            ...p,
                            messages: p.messages.map((m) =>
                              m.id === msg.id ? { ...m, body: e.target.value } : m
                            ),
                          }))
                        }
                        className="w-full rounded-lg border p-3 text-sm"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      />
                      <input
                        type="text"
                        value={msg.signature}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({
                            ...p,
                            messages: p.messages.map((m) =>
                              m.id === msg.id ? { ...m, signature: e.target.value } : m
                            ),
                          }))
                        }
                        placeholder="التوقيع"
                        className="w-full h-9 rounded-lg border px-3 text-sm"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: MEMORIES */}
              {activeTab === 'memories' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-serif-ar text-lg font-bold">
                      صور الذكريات ({config.memories.length})
                    </h3>
                    <label
                      className="px-3.5 py-2 rounded-xl text-xs font-medium text-white flex items-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: config.theme.accentColor }}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة جديدة</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAddMemoryFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {config.memories.map((mem, idx) => (
                    <div
                      key={mem.id}
                      className="rounded-2xl p-4 border space-y-3 bg-white"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: config.theme.accentColor }}
                        >
                          صورة #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateConfig((p) => ({
                              ...p,
                              memories: p.memories.filter((m) => m.id !== mem.id),
                            }))
                          }
                          aria-label="حذف الصورة"
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={mem.caption}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({
                            ...p,
                            memories: p.memories.map((m) =>
                              m.id === mem.id ? { ...m, caption: e.target.value } : m
                            ),
                          }))
                        }
                        placeholder="التعليق أسفل الصورة"
                        className="w-full h-9 rounded-lg border px-3 text-sm"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={mem.date}
                          onChange={(e) =>
                            onUpdateConfig((p) => ({
                              ...p,
                              memories: p.memories.map((m) =>
                                m.id === mem.id ? { ...m, date: e.target.value } : m
                              ),
                            }))
                          }
                          placeholder="التاريخ"
                          className="h-9 rounded-lg border px-3 text-sm"
                          style={{ borderColor: 'var(--border-hairline)' }}
                        />
                        {!mem.mediaKey && (
                          <input
                            type="url"
                            value={mem.src}
                            onChange={(e) =>
                              onUpdateConfig((p) => ({
                                ...p,
                                memories: p.memories.map((m) =>
                                  m.id === mem.id ? { ...m, src: e.target.value } : m
                                ),
                              }))
                            }
                            placeholder="رابط الصورة"
                            className="h-9 rounded-lg border px-3 text-sm"
                            style={{ borderColor: 'var(--border-hairline)' }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: MUSIC */}
              {activeTab === 'music' && (
                <div className="space-y-4">
                  {/* Cloud Music Database Card */}
                  <div
                    className="rounded-2xl p-4 border space-y-3"
                    style={{
                      backgroundColor: config.theme.bgCanvas,
                      borderColor: 'var(--border-hairline)',
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Cloud
                          className="w-5 h-5"
                          style={{ color: config.theme.accentColor }}
                        />
                        <div>
                          <p className="text-sm font-bold">
                            قاعدة بيانات الموسيقى السحابية
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: config.theme.textMuted }}
                          >
                            {user
                              ? `متصل بالحساب: ${user.displayName || user.email}`
                              : 'سجّل الدخول بحساب Google لحفظ ملفات MP3 في قاعدة البيانات السحابية'}
                          </p>
                        </div>
                      </div>

                      {user ? (
                        <button
                          type="button"
                          onClick={onSignOutGoogle}
                          className="px-3 py-1.5 rounded-xl border text-xs font-medium bg-white flex items-center gap-1.5 hover:bg-rose-50 cursor-pointer"
                          style={{ borderColor: 'var(--border-hairline)' }}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>تسجيل خروج</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={onSignInGoogle}
                          className="px-3.5 py-2 rounded-xl text-xs font-medium text-white flex items-center gap-1.5 cursor-pointer"
                          style={{ backgroundColor: config.theme.accentColor }}
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>دخول Google لحفظ الأغاني</span>
                        </button>
                      )}
                    </div>

                    {cloudError && (
                      <p className="text-xs text-rose-700 bg-rose-50 rounded-xl px-3 py-2">
                        {cloudError}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-serif-ar text-lg font-bold">
                      الأغاني ({allTracks.length})
                    </h3>
                    <label
                      className="px-3.5 py-2 rounded-xl text-xs font-medium text-white flex items-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: config.theme.accentColor }}
                    >
                      {isUploadingTrack ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isUploadingTrack ? 'جاري الرفع للحفظ...' : 'رفع ملف MP3'}
                      </span>
                      <input
                        type="file"
                        accept="audio/mp3,audio/mpeg,audio/*"
                        disabled={isUploadingTrack}
                        onChange={handleAddMp3File}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {allTracks.map((trk, idx) => (
                    <div
                      key={trk.id}
                      className="rounded-2xl p-4 border space-y-3 bg-white"
                      style={{ borderColor: 'var(--border-hairline)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-semibold flex items-center gap-1.5"
                          style={{ color: config.theme.accentColor }}
                        >
                          <span>أغنية #{idx + 1}</span>
                          {trk.isCloud && (
                            <span className="text-[11px] font-normal opacity-80">
                              · محفوظة في قاعدة البيانات
                            </span>
                          )}
                        </span>
                        {allTracks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => void onDeleteTrack(trk)}
                            aria-label="حذف الأغنية"
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={trk.title}
                          onChange={(e) =>
                            void onUpdateTrackMeta(trk, { title: e.target.value })
                          }
                          placeholder="اسم الأغنية"
                          className="h-9 rounded-lg border px-3 text-sm"
                          style={{ borderColor: 'var(--border-hairline)' }}
                        />
                        <input
                          type="text"
                          value={trk.artist}
                          onChange={(e) =>
                            void onUpdateTrackMeta(trk, { artist: e.target.value })
                          }
                          placeholder="اسم الفنان أو الإهداء"
                          className="h-9 rounded-lg border px-3 text-sm"
                          style={{ borderColor: 'var(--border-hairline)' }}
                        />
                      </div>

                      {!trk.isCloud && (
                        <div className="flex items-center justify-between pt-1">
                          <label
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border cursor-pointer hover:bg-rose-50"
                            style={{
                              borderColor: 'var(--border-hairline)',
                              color: config.theme.accentColor,
                            }}
                          >
                            تغيير صورة غلاف الأغنية
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUploadTrackCover(trk.id, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: THEME & BACKGROUNDS */}
              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif-ar text-lg font-bold mb-3">
                      باقات الألوان الرومانسية
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {THEME_PRESETS.map((preset) => {
                        const selected = config.theme.presetId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              onUpdateConfig((p) => ({
                                ...p,
                                theme: {
                                  ...p.theme,
                                  presetId: preset.id,
                                  bgCanvas: preset.bgCanvas,
                                  bgSecondary: preset.bgSecondary,
                                  bgSurface: preset.bgSurface,
                                  accentColor: preset.accentColor,
                                  accentSoft: preset.accentSoft,
                                  textPrimary: preset.textPrimary,
                                  textMuted: preset.textMuted,
                                },
                              }))
                            }
                            className="p-3.5 rounded-2xl border text-right flex items-center justify-between transition-all cursor-pointer"
                            style={{
                              backgroundColor: preset.bgCanvas,
                              borderColor: selected
                                ? preset.accentColor
                                : 'var(--border-hairline)',
                              boxShadow: selected
                                ? `0 0 0 2px ${preset.accentColor}`
                                : 'none',
                            }}
                          >
                            <span
                              className="text-sm font-medium"
                              style={{ color: preset.textPrimary }}
                            >
                              {preset.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-5 h-5 rounded-full border border-white/60"
                                style={{ backgroundColor: preset.accentColor }}
                              />
                              <span
                                className="w-5 h-5 rounded-full border border-black/10"
                                style={{ backgroundColor: preset.bgSecondary }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Pickers */}
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        لون الخلفية
                      </label>
                      <input
                        type="color"
                        value={config.theme.bgCanvas}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({
                            ...p,
                            theme: {
                              ...p.theme,
                              presetId: 'custom',
                              bgCanvas: e.target.value,
                            },
                          }))
                        }
                        className="w-full h-10 rounded-xl cursor-pointer border p-1 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        اللون الرئيسي
                      </label>
                      <input
                        type="color"
                        value={config.theme.accentColor}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({
                            ...p,
                            theme: {
                              ...p.theme,
                              presetId: 'custom',
                              accentColor: e.target.value,
                            },
                          }))
                        }
                        className="w-full h-10 rounded-xl cursor-pointer border p-1 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5">
                        لون البطاقات
                      </label>
                      <input
                        type="color"
                        value={config.theme.bgSurface}
                        onChange={(e) =>
                          onUpdateConfig((p) => ({
                            ...p,
                            theme: {
                              ...p.theme,
                              presetId: 'custom',
                              bgSurface: e.target.value,
                            },
                          }))
                        }
                        className="w-full h-10 rounded-xl cursor-pointer border p-1 bg-white"
                      />
                    </div>
                  </div>

                  {/* Decorations Toggle */}
                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
                    <div>
                      <p className="text-sm font-medium">القلوب والفراشات والورود</p>
                      <p className="text-xs" style={{ color: config.theme.textMuted }}>
                        إظهار الزخارف المتحركة اللطيفة في الخلفية
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig((p) => ({
                          ...p,
                          theme: {
                            ...p.theme,
                            showDecorations: !p.theme.showDecorations,
                          },
                        }))
                      }
                      className="px-4 py-2 rounded-xl text-xs font-medium text-white cursor-pointer"
                      style={{
                        backgroundColor: config.theme.showDecorations
                          ? config.theme.accentColor
                          : '#9E8C92',
                      }}
                    >
                      {config.theme.showDecorations ? 'مفعّلة' : 'متوقفة'}
                    </button>
                  </div>

                  {/* Custom Background Image */}
                  <div className="pt-3 border-t space-y-3" style={{ borderColor: 'var(--border-hairline)' }}>
                    <p className="text-sm font-medium">صورة خلفية مخصصة (اختياري)</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <label
                        className="px-4 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer bg-white"
                        style={{
                          borderColor: 'var(--border-hairline)',
                          color: config.theme.accentColor,
                        }}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع صورة خلفية</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadCustomBg}
                          className="hidden"
                        />
                      </label>
                      {(config.theme.customBgMediaKey || config.theme.customBgUrl) && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateConfig((p) => ({
                              ...p,
                              theme: {
                                ...p.theme,
                                customBgMediaKey: undefined,
                                customBgUrl: undefined,
                              },
                            }))
                          }
                          className="px-3.5 py-2 rounded-xl border text-xs font-medium text-rose-700 bg-rose-50 cursor-pointer"
                        >
                          إزالة صورة الخلفية
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reset to Defaults */}
                  <div className="pt-5 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-hairline)' }}>
                    {!confirmReset ? (
                      <button
                        type="button"
                        onClick={() => setConfirmReset(true)}
                        className="px-4 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 text-rose-700 hover:bg-rose-50 cursor-pointer"
                        style={{ borderColor: 'rgba(200,83,114,0.3)' }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>إعادة الإعدادات الافتراضية</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-rose-700 font-medium">
                          هل أنت متأكد؟
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onResetDefaults();
                            setConfirmReset(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium cursor-pointer"
                        >
                          نعم، إعادة التعيين
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmReset(false)}
                          className="px-3 py-1.5 rounded-lg border text-xs cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
