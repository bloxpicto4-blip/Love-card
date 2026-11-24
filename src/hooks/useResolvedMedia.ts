import { useEffect, useState } from 'react';
import { getMediaBlob } from '../utils/mediaDb';

const blobUrlCache = new Map<string, string>();

export async function resolveMediaKey(mediaKey?: string, fallback?: string): Promise<string> {
  if (!mediaKey) return fallback || '';
  const cached = blobUrlCache.get(mediaKey);
  if (cached) return cached;
  try {
    const blob = await getMediaBlob(mediaKey);
    if (blob) {
      const url = URL.createObjectURL(blob);
      blobUrlCache.set(mediaKey, url);
      return url;
    }
  } catch (err) {
    console.error('Error resolving media blob:', err);
  }
  return fallback || '';
}

export function useResolvedMedia(mediaKey?: string, fallbackSrc?: string): string {
  const [url, setUrl] = useState<string>(() => {
    if (mediaKey && blobUrlCache.has(mediaKey)) {
      return blobUrlCache.get(mediaKey)!;
    }
    return fallbackSrc || '';
  });

  useEffect(() => {
    let active = true;
    if (!mediaKey) {
      setUrl(fallbackSrc || '');
      return;
    }
    const cached = blobUrlCache.get(mediaKey);
    if (cached) {
      setUrl(cached);
      return;
    }
    resolveMediaKey(mediaKey, fallbackSrc).then((resolved) => {
      if (active) setUrl(resolved);
    });
    return () => {
      active = false;
    };
  }, [mediaKey, fallbackSrc]);

  return url;
}
