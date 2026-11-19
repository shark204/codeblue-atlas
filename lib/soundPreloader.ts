// lib/soundPreloader.ts
const cache = new Map<string, HTMLAudioElement>();

export function preloadSound(url: string): HTMLAudioElement | undefined {
  if (typeof window === 'undefined') return;
  const existing = cache.get(url);
  if (existing) return existing;

  const audio = new Audio();
  audio.preload = 'auto';
  audio.loop = true;
  audio.src = url;
  audio.load();
  cache.set(url, audio);
  return audio;
}

export function getSound(url: string): HTMLAudioElement {
  return cache.get(url) ?? preloadSound(url)!;
}

export async function playSound(url: string, timeoutMs = 5000) {
  const audio = getSound(url);

  // لو الملف لسه بيحمل، نستنى لحد ما يجهز أو نعمل timeout
  if (audio.readyState < 3) {
    await Promise.race([
      new Promise<void>((resolve) =>
        audio.addEventListener('canplay', () => resolve(), { once: true })
      ),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Sound load timeout')), timeoutMs)
      ),
    ]);
  }
  await audio.play();
}