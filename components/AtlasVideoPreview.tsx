"use client";

import React, { useEffect, useRef, useState } from "react";
import type { AtlasPanelScientificEntry } from "@/lib/atlasScientificContent";
import { useSceneStore } from "@/stores/sceneStore";
import { useUIStore } from "@/stores/uiStore";
export const PREBAKED_STUDIO_SNAPSHOTS: Record<string, string> = {
  skeletal: "/atlas-thumbs/skeletal.webp",
  muscular: "/atlas-thumbs/muscular.webp",
  nervous: "/atlas-thumbs/nervous.webp",
  lymphatic: "/atlas-thumbs/lymphatic.webp",
  cardiovascular: "/atlas-thumbs/cardiovascular.webp",
  respiratory: "/atlas-thumbs/respiratory.webp",
  digestive: "/atlas-thumbs/digestive.webp",
  endocrine: "/atlas-thumbs/endocrine.webp",
  renal: "/atlas-thumbs/renal.webp",
  reproductive: "/atlas-thumbs/reproductive.webp",
  regional: "/atlas-thumbs/integumentary.webp",
  integumentary: "/atlas-thumbs/regional.webp",
  heart_sounds: "/atlas-thumbs/heart_sounds.webp",
  breath_sounds: "/atlas-thumbs/respiratory.webp",
};

const VIDEO_W = 360;
const VIDEO_H = 250;

export interface PanelVideoPreviewProps {
  panel: AtlasPanelScientificEntry;
  height?: number;
  className?: string;
}

/**
 * Animated medical video preview for `heart_sounds`, `breath_sounds`, and `scanner`.
 * - Pauses `requestAnimationFrame` when scrolled off-screen via `IntersectionObserver`
 * - Throttles canvas redraws to 30fps (`now - lastDraw >= 33ms`)
 * - Lazy-loads scanner ultrasound `<video>` (`preload="none"`) only when visible
 */
export function PanelMedicalVideoPreview({
  panel,
  height = 112,
  className = "",
}: PanelVideoPreviewProps) {
  const background = useSceneStore((s) => s.background);
  const siteTheme = useUIStore((s) => s.theme);
  const isLight = background === "light" || siteTheme === "light";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [organImg, setOrganImg] = useState<HTMLImageElement | null>(null);
  const [extVideoFailed, setExtVideoFailed] = useState(false);

  useEffect(() => {
    if (panel.id !== "heart_sounds" && panel.id !== "breath_sounds") return;
    const src = PREBAKED_STUDIO_SNAPSHOTS[panel.id];
    if (!src) return;
    let active = true;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (active) setOrganImg(img);
    };
    img.src = src;
    return () => {
      active = false;
    };
  }, [panel.id]);

  // Lazy play/pause for external scanner ultrasound video
  useEffect(() => {
    if (panel.id !== "scanner" || extVideoFailed) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(videoEl);
    return () => io.disconnect();
  }, [panel.id, panel.video_url, extVideoFailed]);

  useEffect(() => {
    if (panel.id === "scanner" && panel.video_url && !extVideoFailed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let visible = true;
    let lastDraw = 0;
    const startTime = performance.now();

    const drawFrame = (now: number) => {
      const elapsedSec = (now - startTime) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (panel.id === "scanner") {
        const cx = w * 0.5;
        const apexY = 14;
        const maxR = h - 24;
        const halfAng = 0.58;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, apexY);
        ctx.arc(cx, apexY, maxR, Math.PI * 0.5 - halfAng, Math.PI * 0.5 + halfAng);
        ctx.closePath();
        ctx.clip();

        const usGrad = ctx.createRadialGradient(cx, apexY, 8, cx, apexY, maxR);
        usGrad.addColorStop(0, "#1e293b");
        usGrad.addColorStop(0.55, "#0f172a");
        usGrad.addColorStop(1, "#020617");
        ctx.fillStyle = usGrad;
        ctx.fillRect(0, 0, w, h);

        const beat = Math.sin(elapsedSec * 7.2) * 0.08;
        ctx.strokeStyle = "rgba(226, 232, 240, 0.78)";
        ctx.lineWidth = 3.2;
        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.ellipse(
          cx - 16,
          apexY + maxR * 0.56,
          24 * (1 - beat),
          38 * (1 - beat * 0.5),
          -0.15,
          0,
          Math.PI * 2,
        );
        ctx.ellipse(
          cx + 18,
          apexY + maxR * 0.54,
          18 * (1 - beat),
          34 * (1 - beat * 0.5),
          0.15,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (panel.id === "heart_sounds") {
        const cycleSec = 60 / 72;
        const phase = (elapsedSec % cycleSec) / cycleSec;
        const ventSystole =
          Math.exp(-Math.pow((phase - 0.28) * 7.5, 2)) * 0.068 +
          0.2 * Math.exp(-Math.pow((phase - 0.42) * 11, 2)) * 0.045;

        if (organImg) {
          ctx.save();
          const cx = w * 0.5;
          const cy = h * 0.46;
          ctx.translate(cx, cy);
          ctx.scale(1 - ventSystole * 0.92, 1 - ventSystole * 0.52);
          ctx.drawImage(organImg, -w * 0.5, -h * 0.48, w, h * 0.94);
          ctx.restore();
        }

        ctx.save();
        ctx.strokeStyle = "rgba(244, 63, 94, 0.92)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        const ecgBaseY = h - 14;
        for (let x = 8; x < w - 8; x += 2) {
          const t = (((elapsedSec * 1.2 + x / w) % 1) + 1) % 1;
          const pWave = 3 * Math.exp(-Math.pow((t - 0.1) * 32, 2));
          const qWave = -2.5 * Math.exp(-Math.pow((t - 0.18) * 80, 2));
          const rWave = 13 * Math.exp(-Math.pow((t - 0.2) * 75, 2));
          const sWave = -4 * Math.exp(-Math.pow((t - 0.22) * 80, 2));
          const tWave = 4.5 * Math.exp(-Math.pow((t - 0.36) * 24, 2));
          const y = ecgBaseY - (pWave + qWave + rWave + sWave + tWave);
          if (x === 8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      } else if (panel.id === "breath_sounds") {
        const breathPeriod = 4.0;
        const phase = (elapsedSec % breathPeriod) / breathPeriod;
        const inhale =
          phase < 0.44
            ? 0.5 - 0.5 * Math.cos((Math.PI * phase) / 0.44)
            : 0.5 + 0.5 * Math.cos((Math.PI * (phase - 0.44)) / 0.56);

        if (organImg) {
          ctx.save();
          const cx = w * 0.5;
          const cy = h * 0.46;
          ctx.translate(cx, cy);
          ctx.scale(1 + inhale * 0.068, 1 + inhale * 0.048);
          ctx.drawImage(organImg, -w * 0.5, -h * 0.48, w, h * 0.94);
          ctx.restore();
        }

        ctx.save();
        ctx.strokeStyle = "rgba(45, 212, 191, 0.92)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        const waveBaseY = h - 13;
        for (let x = 8; x < w - 8; x += 2) {
          const p = (((phase + x / w) % 1) + 1) % 1;
          const val =
            p < 0.44
              ? Math.sin((Math.PI * p) / 0.44)
              : -0.55 * Math.sin((Math.PI * (p - 0.44)) / 0.56);
          const y = waveBaseY - val * 8;
          if (x === 8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
    };

    const renderLoop = (now: number) => {
      if (!visible) {
        rafId = 0;
        return;
      }
      if (now - lastDraw >= 33) {
        lastDraw = now;
        drawFrame(now);
      }
      rafId = requestAnimationFrame(renderLoop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible && !rafId) {
          rafId = requestAnimationFrame(renderLoop);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [panel.id, panel.video_url, organImg, extVideoFailed]);

  const usVideoUrl =
    panel.video_url ??
    "https://upload.wikimedia.org/wikipedia/commons/b/b5/A4CTTS_(CardioNetworks_ECHOpedia).webm";

  if (panel.id === "scanner" && !extVideoFailed) {
    return (
      <div
        ref={containerRef}
        className={`group relative flex w-full items-center justify-center overflow-hidden select-none ${className}`}
        style={{
          height,
          borderRadius: 12,
          background: isLight
            ? "radial-gradient(ellipse 75% 70% at 50% 44%, #ffffff 0%, #f0f9ff 54%, #e0f2fe 100%)"
            : "radial-gradient(ellipse 72% 68% at 50% 44%, #273954 0%, #162236 48%, #0b1220 82%, #050911 100%)",
          boxShadow: isLight
            ? "inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -8px 18px rgba(14, 116, 144, 0.12)"
            : "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -10px 24px rgba(0,0,0,0.85)",
        }}
      >
        <video
          ref={videoRef}
          src={usVideoUrl}
          preload="none"
          loop
          muted
          playsInline
          onError={() => setExtVideoFailed(true)}
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = 0.75;
          }}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 pointer-events-none"
        />

      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`group relative flex w-full items-center justify-center overflow-hidden select-none pointer-events-none ${className}`}
      style={{
        height,
        borderRadius: 12,
        background: isLight
          ? "radial-gradient(ellipse 75% 70% at 50% 44%, #ffffff 0%, #f0f9ff 54%, #e0f2fe 100%)"
          : "radial-gradient(ellipse 72% 68% at 50% 44%, #273954 0%, #162236 48%, #0b1220 82%, #050911 100%)",
        boxShadow: isLight
          ? "inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -8px 18px rgba(14, 116, 144, 0.12)"
          : "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -10px 24px rgba(0,0,0,0.85)",
      }}
    >
      <canvas
        ref={canvasRef}
        width={VIDEO_W}
        height={VIDEO_H}
        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
      />

    </div>
  );
}
