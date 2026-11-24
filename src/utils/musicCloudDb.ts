import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { MusicTrack } from '../types';
import { getMediaBlob, saveMediaBlob } from './mediaDb';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Max 10MB audio file; split Base64 into ~550KB chunks (<750KB limit in firestore.rules)
export const MAX_CLOUD_AUDIO_BYTES = 10 * 1024 * 1024;
const BASE64_CHUNK_CHARS = 550000;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function subscribeToCloudTracks(
  userId: string,
  onTracks: (tracks: MusicTrack[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const tracksPath = `users/${userId}/tracks`;
  const q = query(
    collection(db, tracksPath),
    where('ownerId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Array<{ createdAtMs: number; track: MusicTrack }> = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createdAtMs =
          data.createdAt && typeof data.createdAt.toMillis === 'function'
            ? data.createdAt.toMillis()
            : 0;
        items.push({
          createdAtMs,
          track: {
            id: `cloud-${docSnap.id}`,
            cloudTrackId: docSnap.id,
            cloudUserId: userId,
            isCloud: true,
            title: String(data.title || 'أغنية محفوظة'),
            artist: String(data.artist || 'مكتبتنا السحابية'),
            coverSrc:
              String(data.coverSrc || '') ||
              '/src/assets/images/album_cover_romance_1794524193410.jpg',
            mimeType: String(data.mimeType || 'audio/mpeg'),
            chunkCount: Number(data.chunkCount || 0),
            synthPreset:
              data.synthPreset === 'piano_waltz' || data.synthPreset === 'music_box'
                ? data.synthPreset
                : undefined,
          },
        });
      });

      items.sort((a, b) => a.createdAtMs - b.createdAtMs);
      onTracks(items.map((x) => x.track));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, tracksPath);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function uploadCloudMusicTrack(params: {
  userId: string;
  file: File;
  title: string;
  artist: string;
  coverSrc?: string;
}): Promise<string> {
  const { userId, file, title, artist, coverSrc } = params;

  if (file.size > MAX_CLOUD_AUDIO_BYTES) {
    throw new Error('حجم الملف الصوتي يتجاوز الحد الأقصى المسموح به (10 ميجابايت).');
  }

  const cleanTitle = title.trim().slice(0, 160) || 'أغنية رومانسية';
  const cleanArtist = artist.trim().slice(0, 160) || 'مكتبتنا السحابية';
  const cleanCover =
    (coverSrc || '/src/assets/images/album_cover_romance_1794524193410.jpg').slice(
      0,
      512
    );
  const mimeType = (file.type || 'audio/mpeg').slice(0, 80);

  const buffer = await file.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);

  const chunks: string[] = [];
  for (let i = 0; i < base64.length; i += BASE64_CHUNK_CHARS) {
    chunks.push(base64.slice(i, i + BASE64_CHUNK_CHARS));
  }

  if (chunks.length > 25) {
    throw new Error('حجم البيانات المشفرة يتجاوز الحد الأقصى المسموح به في قاعدة البيانات.');
  }

  const trackId = `trk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const trackPath = `users/${userId}/tracks/${trackId}`;

  try {
    const batch = writeBatch(db);
    const trackRef = doc(db, trackPath);
    batch.set(trackRef, {
      ownerId: userId,
      title: cleanTitle,
      artist: cleanArtist,
      coverSrc: cleanCover,
      mimeType,
      fileSizeBytes: file.size,
      chunkCount: chunks.length,
      synthPreset: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    chunks.forEach((chunkData, index) => {
      const chunkRef = doc(db, `${trackPath}/chunks`, String(index));
      batch.set(chunkRef, {
        ownerId: userId,
        trackId,
        index,
        dataBase64: chunkData,
        createdAt: serverTimestamp(),
      });
    });

    await batch.commit();

    // Cache locally in IndexedDB for zero-latency immediate playback
    await saveMediaBlob(`cloud-audio-${trackId}`, file);
    return trackId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, trackPath);
  }
}

export async function resolveCloudTrackAudioUrl(
  userId: string,
  trackId: string,
  mimeType = 'audio/mpeg'
): Promise<string> {
  const cacheKey = `cloud-audio-${trackId}`;
  try {
    const localCached = await getMediaBlob(cacheKey);
    if (localCached) {
      return URL.createObjectURL(localCached);
    }
  } catch {
    // Proceed to fetch from Firestore
  }

  const chunksPath = `users/${userId}/tracks/${trackId}/chunks`;
  try {
    const q = query(
      collection(db, chunksPath),
      where('ownerId', '==', userId)
    );
    const snap = await getDocs(q);
    const ordered: Array<{ index: number; data: string }> = [];
    snap.forEach((d) => {
      const raw = d.data();
      ordered.push({
        index: Number(raw.index || 0),
        data: String(raw.dataBase64 || ''),
      });
    });
    ordered.sort((a, b) => a.index - b.index);
    const combinedBase64 = ordered.map((c) => c.data).join('');
    if (!combinedBase64) return '';

    const bytes = base64ToUint8Array(combinedBase64);
    const arrayBuffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: mimeType });
    await saveMediaBlob(cacheKey, blob);
    return URL.createObjectURL(blob);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, chunksPath);
  }
}

export async function updateCloudTrackMetadata(params: {
  userId: string;
  trackId: string;
  title?: string;
  artist?: string;
  coverSrc?: string;
}): Promise<void> {
  const { userId, trackId, title, artist, coverSrc } = params;
  const trackPath = `users/${userId}/tracks/${trackId}`;
  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (title !== undefined) updates.title = title.trim().slice(0, 160) || 'أغنية';
  if (artist !== undefined) updates.artist = artist.trim().slice(0, 160) || 'إهداء';
  if (coverSrc !== undefined) updates.coverSrc = coverSrc.slice(0, 512);

  try {
    await updateDoc(doc(db, trackPath), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, trackPath);
  }
}

export async function deleteCloudTrack(
  userId: string,
  trackId: string
): Promise<void> {
  const trackPath = `users/${userId}/tracks/${trackId}`;
  const chunksPath = `${trackPath}/chunks`;
  try {
    const q = query(
      collection(db, chunksPath),
      where('ownerId', '==', userId)
    );
    const chunksSnap = await getDocs(q);
    const batch = writeBatch(db);
    chunksSnap.forEach((chunkDoc) => {
      batch.delete(chunkDoc.ref);
    });
    batch.delete(doc(db, trackPath));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, trackPath);
  }
}
