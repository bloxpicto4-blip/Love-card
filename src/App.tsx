import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import {
  DEFAULT_CONFIG,
  loadSiteConfig,
  saveSiteConfig,
} from './data/defaultConfig';
import { LoveMessage, MemoryPhoto, MusicTrack, SiteConfig } from './types';
import { clearAllMediaBlobs, saveMediaBlob } from './utils/mediaDb';
import {
  deleteCloudTrack,
  subscribeToCloudTracks,
  updateCloudTrackMetadata,
  uploadCloudMusicTrack,
} from './utils/musicCloudDb';
import { useResolvedMedia } from './hooks/useResolvedMedia';
import { EntryLockScreen } from './components/EntryLockScreen';
import { FloatingDecorations } from './components/FloatingDecorations';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DiaryMessagesSection } from './components/DiaryMessagesSection';
import { LoveCounterSection } from './components/LoveCounterSection';
import { MemoriesGallerySection } from './components/MemoriesGallerySection';
import { FinalLetterSection } from './components/FinalLetterSection';
import { MusicPlayerBar } from './components/MusicPlayerBar';
import {
  CustomizationPanel,
  SettingsTab,
} from './components/CustomizationPanel';

export default function App() {
  const [config, setConfig] = useState<SiteConfig>(() => loadSiteConfig());
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('general');

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cloudTracks, setCloudTracks] = useState<MusicTrack[]>([]);
  const [cloudError, setCloudError] = useState<string>('');
  const [isUploadingTrack, setIsUploadingTrack] = useState(false);

  const resolvedCustomBg = useResolvedMedia(
    config.theme.customBgMediaKey,
    config.theme.customBgUrl
  );

  // Firebase Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (!currentUser) {
        setCloudTracks([]);
      }
    });
    return () => unsub();
  }, []);

  // Firestore real-time cloud tracks subscription
  useEffect(() => {
    if (!authReady || !user) return;
    setCloudError('');
    const unsub = subscribeToCloudTracks(
      user.uid,
      (tracks) => setCloudTracks(tracks),
      (err) => setCloudError(err.message)
    );
    return () => unsub();
  }, [authReady, user]);

  const allTracks = useMemo(
    () => [...config.tracks, ...cloudTracks],
    [config.tracks, cloudTracks]
  );

  // Sync CSS custom properties dynamically whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg-canvas', config.theme.bgCanvas);
    root.style.setProperty('--bg-secondary', config.theme.bgSecondary);
    root.style.setProperty('--bg-surface', config.theme.bgSurface);
    root.style.setProperty('--accent-color', config.theme.accentColor);
    root.style.setProperty('--accent-soft', config.theme.accentSoft);
    root.style.setProperty('--text-primary', config.theme.textPrimary);
    root.style.setProperty('--text-muted', config.theme.textMuted);
  }, [config.theme]);

  const updateConfig = (updater: (prev: SiteConfig) => SiteConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      saveSiteConfig(next);
      return next;
    });
  };

  const handleAddMessage = (msg: Omit<LoveMessage, 'id'>) => {
    updateConfig((prev) => ({
      ...prev,
      messages: [...prev.messages, { ...msg, id: `msg-${Date.now()}` }],
    }));
  };

  const handleDeleteMessage = (id: string) => {
    updateConfig((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== id),
    }));
  };

  const handleAddMemory = (memory: Omit<MemoryPhoto, 'id'>) => {
    updateConfig((prev) => ({
      ...prev,
      memories: [...prev.memories, { ...memory, id: `mem-${Date.now()}` }],
    }));
  };

  const handleDeleteMemory = (id: string) => {
    updateConfig((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== id),
    }));
  };

  const handleSignInGoogle = async () => {
    setCloudError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setCloudError(
        err instanceof Error ? err.message : 'تعذّر تسجيل الدخول بحساب Google.'
      );
    }
  };

  const handleSignOutGoogle = async () => {
    setCloudError('');
    await signOut(auth);
  };

  const handleUploadAudioFile = async (file: File): Promise<boolean> => {
    setCloudError('');
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '') || 'أغنية رومانسية';
    const artistLabel = `${config.partnerOne} & ${config.partnerTwo}`;

    if (user && user.emailVerified) {
      setIsUploadingTrack(true);
      try {
        await uploadCloudMusicTrack({
          userId: user.uid,
          file,
          title: cleanTitle,
          artist: artistLabel,
        });
        return true;
      } catch (err) {
        setCloudError(
          err instanceof Error
            ? err.message
            : 'تعذّر حفظ الأغنية في قاعدة البيانات السحابية.'
        );
        return false;
      } finally {
        setIsUploadingTrack(false);
      }
    } else {
      const audioKey = `mp3-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await saveMediaBlob(audioKey, file);
      updateConfig((prev) => ({
        ...prev,
        tracks: [
          ...prev.tracks,
          {
            id: `trk-${Date.now()}`,
            title: cleanTitle,
            artist: artistLabel,
            coverSrc: '/src/assets/images/album_cover_romance_1794524193410.jpg',
            audioMediaKey: audioKey,
          },
        ],
      }));
      return true;
    }
  };

  const handleDeleteTrack = async (track: MusicTrack) => {
    if (track.isCloud && track.cloudTrackId && user) {
      await deleteCloudTrack(user.uid, track.cloudTrackId);
    } else {
      updateConfig((prev) => ({
        ...prev,
        tracks: prev.tracks.filter((t) => t.id !== track.id),
      }));
    }
  };

  const handleUpdateTrackMeta = async (
    track: MusicTrack,
    patch: { title?: string; artist?: string }
  ) => {
    if (track.isCloud && track.cloudTrackId && user) {
      await updateCloudTrackMetadata({
        userId: user.uid,
        trackId: track.cloudTrackId,
        ...patch,
      });
    } else {
      updateConfig((prev) => ({
        ...prev,
        tracks: prev.tracks.map((t) =>
          t.id === track.id ? { ...t, ...patch } : t
        ),
      }));
    }
  };

  const handleResetDefaults = async () => {
    await clearAllMediaBlobs();
    setConfig(DEFAULT_CONFIG);
    saveSiteConfig(DEFAULT_CONFIG);
  };

  const openSettingsAt = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  return (
    <div
      className="min-h-screen relative transition-colors duration-500"
      style={{
        backgroundColor: config.theme.bgCanvas,
        color: config.theme.textPrimary,
      }}
    >
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <EntryLockScreen
            key="lock-screen"
            config={config}
            onUnlock={() => setIsUnlocked(true)}
          />
        ) : (
          <motion.div
            key="main-experience"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-screen"
            style={{
              backgroundImage: resolvedCustomBg
                ? `linear-gradient(rgba(255, 250, 246, 0.84), rgba(255, 250, 246, 0.9)), url(${resolvedCustomBg})`
                : `radial-gradient(circle at 15% 12%, ${config.theme.accentSoft}45 0%, transparent 45%), radial-gradient(circle at 85% 38%, ${config.theme.bgSecondary} 0%, transparent 50%)`,
              backgroundSize: 'cover',
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
            }}
          >
            {/* Floating Hearts, Butterflies & Roses */}
            <FloatingDecorations
              enabled={config.theme.showDecorations}
              accentColor={config.theme.accentColor}
            />

            {/* Top Navigation Bar */}
            <Navbar
              config={config}
              onOpenSettings={() => openSettingsAt('general')}
            />

            {/* Main Sections */}
            <main className="relative z-10">
              <HeroSection config={config} />

              <div
                className="max-w-4xl mx-auto h-px"
                style={{ backgroundColor: 'var(--border-hairline)' }}
              />

              <DiaryMessagesSection
                config={config}
                onAddMessage={handleAddMessage}
                onDeleteMessage={handleDeleteMessage}
              />

              <div
                className="max-w-4xl mx-auto h-px"
                style={{ backgroundColor: 'var(--border-hairline)' }}
              />

              <LoveCounterSection
                config={config}
                onOpenDateSettings={() => openSettingsAt('general')}
              />

              <div
                className="max-w-4xl mx-auto h-px"
                style={{ backgroundColor: 'var(--border-hairline)' }}
              />

              <MemoriesGallerySection
                config={config}
                onAddMemory={handleAddMemory}
                onDeleteMemory={handleDeleteMemory}
              />

              <div
                className="max-w-4xl mx-auto h-px"
                style={{ backgroundColor: 'var(--border-hairline)' }}
              />

              <FinalLetterSection config={config} />
            </main>

            {/* Fixed Bottom Persistent Music Player */}
            <MusicPlayerBar
              config={config}
              tracks={allTracks}
              user={user}
              isUploading={isUploadingTrack}
              cloudError={cloudError}
              onUploadAudioFile={handleUploadAudioFile}
              onSignInGoogle={handleSignInGoogle}
              onSignOutGoogle={handleSignOutGoogle}
            />

            {/* Full Control & Customization Panel */}
            <CustomizationPanel
              isOpen={settingsOpen}
              initialTab={settingsTab}
              config={config}
              allTracks={allTracks}
              user={user}
              isUploadingTrack={isUploadingTrack}
              cloudError={cloudError}
              onUpdateConfig={updateConfig}
              onUploadAudioFile={handleUploadAudioFile}
              onUpdateTrackMeta={handleUpdateTrackMeta}
              onDeleteTrack={handleDeleteTrack}
              onSignInGoogle={handleSignInGoogle}
              onSignOutGoogle={handleSignOutGoogle}
              onClose={() => setSettingsOpen(false)}
              onLockNow={() => setIsUnlocked(false)}
              onResetDefaults={handleResetDefaults}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
