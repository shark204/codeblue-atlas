// components/screens/study-room/useAmbience.ts
'use client';
import { useState, useEffect, useRef } from 'react';
import { SOUNDS } from './studyRoomData';

function buildSound(ctx: AudioContext, id: string) {
  const len = ctx.sampleRate * 3;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (id === 'wind' || id === 'waves') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    else d[i] = w;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const filter = ctx.createBiquadFilter();
  const out = ctx.createGain(); out.gain.value = 0;

  if (id === 'waves') { filter.type = 'lowpass'; filter.frequency.value = 900; }
  else if (id === 'wind') { filter.type = 'lowpass'; filter.frequency.value = 480; }
  else { filter.type = 'lowpass'; filter.frequency.value = 1400; }

  src.connect(filter);

  if (id === 'waves') {
    const mod = ctx.createGain(); mod.gain.value = 0.6;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.11;
    const depth = ctx.createGain(); depth.gain.value = 0.45;
    lfo.connect(depth); depth.connect(mod.gain);
    filter.connect(mod); mod.connect(out); lfo.start();
  } else if (id === 'wind') {
    const mod = ctx.createGain(); mod.gain.value = 0.5;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
    const depth = ctx.createGain(); depth.gain.value = 0.42;
    lfo.connect(depth); depth.connect(mod.gain);
    filter.connect(mod); mod.connect(out); lfo.start();
  } else {
    filter.connect(out);
  }

  out.connect(ctx.destination);
  src.start();
  return out;
}

async function loadSoundFromUrl(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const arrayBuf = await res.arrayBuffer();
  return await ctx.decodeAudioData(arrayBuf);
}

export function useAmbience() {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodes = useRef<Record<string, { src: AudioBufferSourceNode | null; gain: GainNode }>>({});
  const buffers = useRef<Record<string, AudioBuffer>>({});
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  const ensureCtx = () => {
    // ✅ لو الـ Context مقفول أو مش موجود، بنعمل واحد جديد
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = new AC();
      // ✅ نمسح الـ nodes القديمة عشان كانت مربوطة بالـ Context القديم
      nodes.current = {};
    }
    
    // ✅ بنعمل resume بس لو الـ Context في وضع suspended
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    
    return ctxRef.current;
  };

  // ✅ 1. تحميل الأصوات في الخلفية أول ما الغرفة تفتح
  useEffect(() => {
    let isMounted = true;
    const loadAll = async () => {
      const ctx = ensureCtx();
      for (const sound of SOUNDS) {
        if (!sound.url || buffers.current[sound.id]) continue;
        try {
          const buf = await loadSoundFromUrl(ctx, sound.url);
          if (isMounted) {
            buffers.current[sound.id] = buf;
            console.log(`✅ Preloaded: ${sound.id}`);
          }
        } catch (err) {
          console.warn(`Preload failed for ${sound.id}`, err);
        }
      }
    };
    loadAll();
    return () => { isMounted = false; };
  }, []);

  const setLevel = async (id: string, v: number) => {
    const ctx = ensureCtx();
    const soundDef = SOUNDS.find((s) => s.id === id);
    if (!soundDef) return;

    if (soundDef.url) {
      if (!buffers.current[id] && v > 0) {
        if (loadingIds[id]) return;
        setLoadingIds((prev) => ({ ...prev, [id]: true }));
        try {
          const buf = await loadSoundFromUrl(ctx, soundDef.url!);
          buffers.current[id] = buf;
        } catch (err) {
          console.warn(`Failed to load sound ${id}:`, err);
          setLoadingIds((prev) => ({ ...prev, [id]: false }));
          return;
        }
        setLoadingIds((prev) => ({ ...prev, [id]: false }));
      }

      if (!nodes.current[id] && buffers.current[id]) {
        const src = ctx.createBufferSource();
        src.buffer = buffers.current[id];
        src.loop = true;
        const gain = ctx.createGain();
        gain.gain.value = 0;
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start();
        nodes.current[id] = { src, gain };
      }

      if (nodes.current[id]) {
        nodes.current[id].gain.gain.setTargetAtTime(v * 0.225, ctx.currentTime, 0.15);
      }
      setLevels((l) => ({ ...l, [id]: v }));
      return;
    }

    if (!nodes.current[id]) {
      const gainNode = buildSound(ctx, id);
      nodes.current[id] = { src: null, gain: gainNode };
    }
    nodes.current[id].gain.gain.setTargetAtTime(v * 0.225, ctx.currentTime, 0.15);
    setLevels((l) => ({ ...l, [id]: v }));
  };

  // ✅ 2. Cleanup (تنظيف) بطريقة آمنة
  useEffect(() => {
    const currentCtx = ctxRef.current;
    return () => {
      Object.values(nodes.current).forEach(({ src }) => {
        try { src?.stop(); } catch {}
      });
      if (currentCtx && currentCtx.state !== 'closed') {
        currentCtx.close().catch(() => {});
      }
      if (ctxRef.current === currentCtx) {
        ctxRef.current = null;
      }
    };
  }, []);

  return [levels, setLevel, loadingIds] as const;
}