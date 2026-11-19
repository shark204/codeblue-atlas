'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export type Slide = {
  n: number;
  src: string;
  thumb: string;
  w: number;
  h: number;
  caption: string;
  section?: string;
  cover?: boolean;
};

export const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const BUCKET = 'lesson-slides';

export function useLessonSlides(
  moduleName?: string | null,
  lessonName?: string | null,
) {
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    setSlides([]);
    if (!moduleName || !lessonName) return;

    let cancelled = false;
    const folder = `${toSlug(moduleName)}/${toSlug(lessonName)}`;
    const url = (file: string) =>
      supabase.storage.from(BUCKET).getPublicUrl(`${folder}/${file}`).data.publicUrl;

    (async () => {
      try {
        const res = await fetch(url('manifest.json'), { cache: 'force-cache' });
        if (!res.ok) return;
        const json = (await res.json()) as { slides: Slide[] };
        if (cancelled) return;
        setSlides(
          json.slides.map((s) => ({
            ...s,
            src: url(s.src),
            thumb: url(s.thumb),
          })),
        );
      } catch {
        /* no slides for this lesson */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [moduleName, lessonName]);

  return slides;
}