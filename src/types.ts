export interface LoveMessage {
  id: string;
  title: string;
  date: string;
  body: string;
  signature: string;
}

export interface MemoryPhoto {
  id: string;
  src: string;
  mediaKey?: string;
  caption: string;
  date: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  coverSrc: string;
  coverMediaKey?: string;
  audioSrc?: string;
  audioMediaKey?: string;
  synthPreset?: 'piano_waltz' | 'music_box';
  isCloud?: boolean;
  cloudTrackId?: string;
  cloudUserId?: string;
  mimeType?: string;
  chunkCount?: number;
}

export interface ThemePreset {
  id: string;
  name: string;
  bgCanvas: string;
  bgSecondary: string;
  bgSurface: string;
  accentColor: string;
  accentSoft: string;
  textPrimary: string;
  textMuted: string;
}

export interface ThemeConfig {
  presetId: string;
  bgCanvas: string;
  bgSecondary: string;
  bgSurface: string;
  accentColor: string;
  accentSoft: string;
  textPrimary: string;
  textMuted: string;
  showDecorations: boolean;
  customBgUrl?: string;
  customBgMediaKey?: string;
}

export interface SiteConfig {
  partnerOne: string;
  partnerTwo: string;
  heroTitle: string;
  heroSubtitle: string;
  password: string;
  passwordHint: string;
  envelopeText: string;
  envelopeNoteTitle: string;
  envelopeNoteBody: string;
  startDate: string; // ISO local datetime e.g. "2024-02-14T18:00"
  messages: LoveMessage[];
  memories: MemoryPhoto[];
  tracks: MusicTrack[];
  finalLetter: {
    heading: string;
    body: string;
    signature: string;
    buttonText: string;
  };
  theme: ThemeConfig;
}
