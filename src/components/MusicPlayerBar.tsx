import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { User } from 'firebase/auth';
import {
  Cloud,
  ListMusic,
  Loader2,
  LogIn,
  LogOut,
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { MusicTrack, SiteConfig } from '../types';
import { useResolvedMedia, resolveMediaKey } from '../hooks/useResolvedMedia';
import { getSynthTrackUrl } from '../utils/audioSynth';
import { resolveCloudTrackAudioUrl } from '../utils/musicCloudDb';

interface MusicPlayerBarProps {
  config: SiteConfig;
  tracks: MusicTrack[];
  user: User | null;
  isUploading: boolean;
  cloudError: string;
  onUploadAudioFile: (file: File) => Promise<boolean>;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
}

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const MusicPlayerBar: React.FC<MusicPlayerBarProps> = ({
  config,
  tracks,
  user,
  isUploading,
  cloudError,
  onUploadAudioFile,
  onSignInGoogle,
  onSignOutGoogle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [audioSrcUrl, setAudioSrcUrl] = useState('');
  const [isBufferingCloud, setIsBufferingCloud] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const safeIndex = tracks.length > 0 ? Math.min(currentIndex, tracks.length - 1) : 0;
  const currentTrack = tracks[safeIndex];

  const coverUrl = useResolvedMedia(
    currentTrack?.coverMediaKey,
    currentTrack?.coverSrc
  );

  // Resolve audio source (Firestore cloud chunks, IndexedDB blob, URL, or synthesized WAV)
  useEffect(() => {
    let active = true;
    async function loadAudioSource() {
      if (!currentTrack) {
        setAudioSrcUrl('');
        return;
      }
      if (currentTrack.isCloud && currentTrack.cloudTrackId && currentTrack.cloudUserId) {
        setIsBufferingCloud(true);
        try {
          const url = await resolveCloudTrackAudioUrl(
            currentTrack.cloudUserId,
            currentTrack.cloudTrackId,
            currentTrack.mimeType || 'audio/mpeg'
          );
          if (active) setAudioSrcUrl(url);
        } finally {
          if (active) setIsBufferingCloud(false);
        }
      } else if (currentTrack.audioMediaKey) {
        const resolved = await resolveMediaKey(
          currentTrack.audioMediaKey,
          currentTrack.audioSrc
        );
        if (active) setAudioSrcUrl(resolved);
      } else if (currentTrack.audioSrc) {
        if (active) setAudioSrcUrl(currentTrack.audioSrc);
      } else if (currentTrack.synthPreset) {
        const synthUrl = getSynthTrackUrl(currentTrack.synthPreset);
        if (active) setAudioSrcUrl(synthUrl);
      }
    }
    loadAudioSource();
    return () => {
      active = false;
    };
  }, [currentTrack]);

  // Auto-play when track switches while already playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrcUrl) return;
    audio.load();
    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [audioSrcUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrcUrl) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTime(0);
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  };

  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTime(0);
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleQuickUploadMp3 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await onUploadAudioFile(file);
    if (ok) {
      setCurrentIndex(tracks.length);
      setIsPlaying(true);
    }
    e.target.value = '';
  };

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <audio
        ref={audioRef}
        src={audioSrcUrl || undefined}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleNextTrack}
      />

      {/* Playlist Popover */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22 }}
            className="max-w-md mx-auto sm:mr-6 sm:ml-auto mb-2 mx-3 rounded-2xl border shadow-xl p-4 backdrop-blur-lg"
            style={{
              backgroundColor: 'rgba(255, 253, 249, 0.96)',
              borderColor: 'var(--border-hairline)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="font-serif-ar text-base font-bold"
                style={{ color: config.theme.textPrimary }}
              >
                قائمة أغانينا ({tracks.length})
              </span>
              <button
                type="button"
                onClick={() => setShowPlaylist(false)}
                aria-label="إغلاق القائمة"
                className="p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                style={{ color: config.theme.textMuted }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cloud Database Sync Status Bar */}
            <div
              className="mb-3 rounded-xl p-2.5 border flex items-center justify-between gap-2 text-xs"
              style={{
                backgroundColor: config.theme.bgCanvas,
                borderColor: 'var(--border-hairline)',
              }}
            >
              {user ? (
                <>
                  <div className="flex items-center gap-2 min-w-0">
                    <Cloud
                      className="w-4 h-4 shrink-0"
                      style={{ color: config.theme.accentColor }}
                    />
                    <span className="truncate font-medium">
                      متصل بقاعدة البيانات ({user.displayName || user.email})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onSignOutGoogle}
                    className="px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1 hover:bg-rose-50 shrink-0 cursor-pointer"
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    <LogOut className="w-3 h-3" />
                    <span>خروج</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 min-w-0">
                    <Cloud className="w-4 h-4 shrink-0 opacity-60" />
                    <span className="truncate" style={{ color: config.theme.textMuted }}>
                      سجّل لحفظ أغانيك في قاعدة البيانات السحابية
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onSignInGoogle}
                    className="px-2.5 py-1 rounded-lg text-white text-[11px] font-medium flex items-center gap-1 shrink-0 cursor-pointer"
                    style={{ backgroundColor: config.theme.accentColor }}
                  >
                    <LogIn className="w-3 h-3" />
                    <span>دخول Google</span>
                  </button>
                </>
              )}
            </div>

            {cloudError && (
              <p className="mb-2 text-[11px] text-rose-700 bg-rose-50 rounded-lg px-2.5 py-1.5">
                {cloudError}
              </p>
            )}

            <div className="max-h-52 overflow-y-auto space-y-1.5">
              {tracks.map((trk, idx) => {
                const active = idx === safeIndex;
                return (
                  <button
                    key={trk.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPlaying(true);
                    }}
                    className="w-full text-right px-3 py-2 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: active ? config.theme.accentSoft : 'transparent',
                      color: config.theme.textPrimary,
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{trk.title}</p>
                      <p className="text-xs truncate" style={{ color: config.theme.textMuted }}>
                        {trk.artist}
                        {trk.isCloud ? ' · محفوظة في قاعدة البيانات' : ''}
                      </p>
                    </div>
                    {active && (
                      <Music
                        className="w-4 h-4 shrink-0"
                        style={{ color: config.theme.accentColor }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Fixed Bottom Bar */}
      <div
        className="border-t backdrop-blur-lg shadow-[0_-8px_30px_rgba(62,36,44,0.08)]"
        style={{
          backgroundColor: 'rgba(255, 253, 249, 0.92)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-5">
          {/* Song Cover & Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:w-64">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-rose-100 shadow-xs">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover ${
                    isPlaying ? 'scale-105 transition-transform duration-700' : ''
                  }`}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: config.theme.accentSoft }}
                >
                  <Music className="w-5 h-5" style={{ color: config.theme.accentColor }} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p
                className="text-xs sm:text-sm font-semibold truncate"
                style={{ color: config.theme.textPrimary }}
              >
                {currentTrack.title}
              </p>
              <p
                className="text-[11px] sm:text-xs truncate"
                style={{ color: config.theme.textMuted }}
              >
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Center Controls + Progress Bar */}
          <div className="flex flex-col items-center gap-1 flex-none sm:flex-1 max-w-md">
            <div className="flex items-center gap-2 sm:gap-4" dir="ltr">
              <button
                type="button"
                onClick={handlePrevTrack}
                aria-label="الأغنية السابقة"
                className="p-2 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                style={{ color: config.theme.textPrimary }}
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                disabled={isBufferingCloud}
                aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-sm hover:brightness-105 active:scale-95 disabled:opacity-60 transition-all cursor-pointer"
                style={{ backgroundColor: config.theme.accentColor }}
              >
                {isBufferingCloud ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleNextTrack}
                aria-label="الأغنية التالية"
                className="p-2 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                style={{ color: config.theme.textPrimary }}
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center gap-2.5 w-full" dir="ltr">
              <span
                className="text-[11px] tabular-nums w-9 text-right"
                style={{ color: config.theme.textMuted }}
              >
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                aria-label="شريط تقدم الأغنية"
                className="romantic-range flex-1"
                style={{
                  background: `linear-gradient(to right, ${config.theme.accentColor} ${progressPct}%, rgba(200,83,114,0.2) ${progressPct}%)`,
                  borderRadius: '9999px',
                  height: '5px',
                }}
              />
              <span
                className="text-[11px] tabular-nums w-9"
                style={{ color: config.theme.textMuted }}
              >
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Actions: Upload MP3, Playlist, Mute */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <label
              title={user ? 'رفع MP3 وحفظه في قاعدة البيانات' : 'رفع ملف MP3'}
              className="h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:brightness-95 transition-all"
              style={{
                backgroundColor: config.theme.bgCanvas,
                borderColor: 'var(--border-hairline)',
                color: config.theme.accentColor,
              }}
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline whitespace-nowrap">
                {isUploading ? 'جاري الحفظ...' : 'رفع MP3'}
              </span>
              <input
                type="file"
                accept="audio/mp3,audio/mpeg,audio/*"
                disabled={isUploading}
                onChange={handleQuickUploadMp3}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowPlaylist((p) => !p)}
              aria-label="قائمة الأغاني"
              title="قائمة الأغاني"
              className="w-9 h-9 rounded-xl border flex items-center justify-center hover:brightness-95 transition-all cursor-pointer"
              style={{
                backgroundColor: showPlaylist
                  ? config.theme.accentSoft
                  : config.theme.bgCanvas,
                borderColor: 'var(--border-hairline)',
                color: config.theme.textPrimary,
              }}
            >
              <ListMusic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
              className="hidden sm:flex w-9 h-9 rounded-xl border items-center justify-center hover:brightness-95 transition-all cursor-pointer"
              style={{
                backgroundColor: config.theme.bgCanvas,
                borderColor: 'var(--border-hairline)',
                color: config.theme.textPrimary,
              }}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Compact Progress Strip */}
        <div className="sm:hidden px-3 pb-2 flex items-center gap-2" dir="ltr">
          <span
            className="text-[10px] tabular-nums"
            style={{ color: config.theme.textMuted }}
          >
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="شريط تقدم الأغنية"
            className="romantic-range flex-1"
            style={{
              background: `linear-gradient(to right, ${config.theme.accentColor} ${progressPct}%, rgba(200,83,114,0.2) ${progressPct}%)`,
              borderRadius: '9999px',
              height: '4px',
            }}
          />
          <span
            className="text-[10px] tabular-nums"
            style={{ color: config.theme.textMuted }}
          >
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};
