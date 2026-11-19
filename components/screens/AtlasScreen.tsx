'use client';
if (typeof window !== "undefined" && !(window as any).__cbClockWarnPatched) {
  (window as any).__cbClockWarnPatched = true;
  const origWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("THREE.Clock") && args[0].includes("deprecated")) {
      return;
    }
    origWarn.apply(console, args);
  };
}
import "./atlas.css";
import { lazy, Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Bot, Box, ChevronDown, Crown, HeartPulse, HelpCircle, Languages, PanelLeft, ScanLine, Wind, X } from "lucide-react";
import { primeHeartSound } from "@/features/viewer/heartSound";
import { primeBreathSound } from "@/features/viewer/breathing";
import { UserMenu } from "@/components/UserMenu";
import { ChatPanel } from "@/features/chat/ChatPanel";
import { GuideOverlay } from "@/features/help/GuideOverlay";
import { useFirstRun } from "@/features/help/useFirstRun";
import { LeftPanel } from "@/features/layout/LeftPanel";
import { OrganAtelierMainView, useOrganAtelierStore } from "@/features/study/StudyPanel";
function SplashScreen({
  leaving
}: {
  leaving: boolean;
}) {
  const {
    at
  } = useAtlasLocale();
  return <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/45 backdrop-blur-xs transition-opacity duration-300 ${leaving ? "pointer-events-none opacity-0" : "opacity-100"}`} role="status" aria-live="polite" aria-label="Anatria3D is starting">
      <div className="flex max-w-xs flex-col items-center gap-3 rounded-2xl border border-[#26324d] bg-[#131c31] px-6 py-4 text-center shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-400/25 border-t-cyan-400" />
          <Activity size={20} className="animate-pulse text-[#d98a96]" />
        </div>
        <p className="text-xs font-black text-white">
          {at("جارٍ تحميل المجسم التشريحي ثلاثي الأبعاد...", "Loading 3D Anatomical Model...")}
        </p>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[#1e293b]">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400" />
        </div>
      </div>
    </div>;
}
function useSplash(ready: boolean): {
  visible: boolean;
  leaving: boolean;
} {
  return {
    visible: false,
    leaving: false
  };
}
import { ResizeHandle } from "@/features/layout/ResizeHandle";
import { CHAT_LIMITS, TREE_LIMITS, useLayout } from "@/features/layout/useLayout";
import { ConfirmDialog } from "@/features/common/ConfirmDialog";
import { PrintSheet } from "@/features/study/PrintSheet";
import { AnatomyViewer } from "@/features/viewer/AnatomyViewer";
import { checkStorage, confirmStoragePersists } from "@/lib/localStore";
import { useStudyStore } from "@/stores/studyStore";
import { startViewPersistence } from "@/stores/persistView";
import { useSceneStore } from "@/stores/sceneStore";
import { useHeartStore } from "@/stores/heartStore";
import { useBreathStore } from "@/stores/breathStore";
import { useScanStore } from "@/stores/scanStore";
import { useUIStore } from "@/stores/uiStore";
import { useAtlasLocale } from "@/lib/atlasI18n";
const MemoryLab = lazy(() => import("@/features/memory/MemoryLab"));
export default function AtlasScreen() {
  const router = useRouter();
  const {
    isAr,
    at,
    toggleLocale
  } = useAtlasLocale();
  const siteTheme = useUIStore(s => s.theme);
  const background = useSceneStore(s => s.background);
  const setBackground = useSceneStore(s => s.setBackground);
  const isLight = siteTheme === "light" || background === "light";
  const isDark = !isLight;
  const {
    layout,
    setTreeWidth,
    setChatWidth,
    toggleTree,
    closeTree,
    toggleChat
  } = useLayout();
  const {
    markSeen
  } = useFirstRun();
  const [guideOpen, setGuideOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const activeTab = useOrganAtelierStore(s => s.activeTab);
  const setActiveTab = useOrganAtelierStore(s => s.setActiveTab);
  const heartEnabled = useHeartStore(s => s.enabled);
  const breathEnabled = useBreathStore(s => s.enabled);
  const scanEnabled = useScanStore(s => s.enabled);
  const showAssistantInTopBar = (heartEnabled || breathEnabled) && !scanEnabled && activeTab !== "organs";
  useEffect(() => {
    if (!showAssistantInTopBar && !layout.chatCollapsed) {
      toggleChat();
    }
  }, [showAssistantInTopBar, layout.chatCollapsed, toggleChat]);
  const showTopBarBack = activeTab === "organs" || heartEnabled || breathEnabled || scanEnabled;
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile, {
      passive: true
    });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    setBackground(siteTheme === "light" ? "light" : "dark");
  }, [siteTheme, setBackground]);
  useEffect(() => {
    fetch("/api/bootstrap?sync_atlas=1").catch(() => {});
  }, []);
  useEffect(() => {
    return () => {
      const ui = useUIStore.getState();
      if ((ui.currentScreen as any) === "atlas") {
        ui.setCurrentScreen?.("landing");
      }
    };
  }, []);
  const atlasReady = useSceneStore(s => s.manifest !== null);
  const splash = useSplash(atlasReady);
  useEffect(() => {
    const stop = startViewPersistence();
    useSceneStore.getState().hideAllSystems();
    useHeartStore.setState({
      enabled: false,
      sound: false
    });
    useBreathStore.setState({
      enabled: false,
      sound: false
    });
    useScanStore.setState({
      enabled: false
    });
    setActiveTab("atlas");
    closeTree();
    return stop;
  }, [closeTree, setActiveTab]);
  useEffect(checkStorage, []);
  const journal = useStudyStore(s => s.stats);
  useEffect(() => {
    if (!journal) return;
    confirmStoragePersists(journal.sessions + journal.notes + journal.cases > 0);
  }, [journal]);
  const closeGuide = () => {
    setGuideOpen(false);
    markSeen();
  };
  const handleToggleTree = () => {
    if (isMobile && layout.treeCollapsed && !layout.chatCollapsed) {
      toggleChat();
    }
    toggleTree();
  };
  const handleToggleChat = () => {
    if (isMobile && layout.chatCollapsed && !layout.treeCollapsed) {
      toggleTree();
    }
    toggleChat();
  };
  return <div dir="ltr" className={`atlas-root ${isDark ? "atlas-theme-dark" : "atlas-theme-light"} fixed inset-0 top-0 bottom-0 left-0 right-0 z-[100] flex h-[100dvh] w-full overflow-hidden select-none`}>
      {splash.visible && <SplashScreen leaving={splash.leaving} />}
      {memoryOpen && <Suspense fallback={<div className="fixed inset-0 z-[60] bg-[#0b1120]" />}>
          <MemoryLab onClose={() => setMemoryOpen(false)} />
        </Suspense>}
      <PrintSheet />
      <ConfirmDialog />
      {isMobile && (!layout.treeCollapsed || !layout.chatCollapsed) && <div onClick={() => {
      if (!layout.treeCollapsed) toggleTree();
      if (!layout.chatCollapsed) toggleChat();
    }} className="fixed inset-0 z-30 bg-[#0b1120]/75 md:backdrop-blur-xs md:hidden" />}
      <aside hidden={layout.treeCollapsed} inert={layout.treeCollapsed} className={isMobile ? `fixed bottom-0 left-0 top-0 z-50 h-[100dvh] w-[88vw] max-w-[360px] overflow-hidden border-r shadow-2xl ${isDark ? "border-[#26324d] bg-[#0b1120]" : "border-[#bae6fd] bg-white"}` : `h-[100dvh] max-h-[100dvh] min-h-0 shrink-0 self-stretch overflow-hidden border-r ${isDark ? "border-[#26324d] bg-[#0b1120]" : "border-[#bae6fd] bg-white"}`} style={isMobile ? undefined : {
      width: layout.treeWidth
    }}>
        <LeftPanel onClose={toggleTree} onMobileActionComplete={closeTree} />
      </aside>
      {!isMobile && !layout.treeCollapsed && <ResizeHandle width={layout.treeWidth} onResize={setTreeWidth} side="left" min={TREE_LIMITS.min} max={TREE_LIMITS.max} defaultWidth={TREE_LIMITS.default} label={at("تغيير عرض لوحة التشريح", "Resize the anatomy panel")} />}
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AtlasViewportTopBar isAr={isAr} isDark={isDark} at={at} onToggleLocale={() => void toggleLocale()} treeCollapsed={layout.treeCollapsed} chatCollapsed={layout.chatCollapsed} showAssistant={showAssistantInTopBar} onToggleTree={handleToggleTree} onCloseTree={closeTree} onToggleChat={handleToggleChat} onOpenGuide={() => setGuideOpen(true)} showBack={showTopBarBack} onBack={() => {
        if (activeTab === "organs") {
          setActiveTab("atlas");
          return;
        }
        const hStore = useHeartStore.getState();
        const bStore = useBreathStore.getState();
        const sStore = useScanStore.getState();
        const st = useSceneStore.getState();
        if (hStore.enabled || bStore.enabled || sStore.enabled) {
          if (hStore.enabled) {
            hStore.setSound(false);
            hStore.toggle();
          }
          if (bStore.enabled) {
            bStore.setSound(false);
            bStore.toggle();
          }
          if (sStore.enabled) {
            sStore.toggle();
          }
          st.clearIsolation();
          st.clearSelection();
          st.hideAllSystems();
          closeTree();
          return;
        }
        if (st.undoHistory.length > 0) {
          st.undoLastStep();
          return;
        }
        if (st.selectedOrganIds.length > 0) {
          st.clearSelection();
          return;
        }
        const totalSys = st.manifest?.systems.length ?? 12;
        if (st.hiddenSystems.length < totalSys || !st.hideConnective || st.isolatedOrganIds !== null) {
          st.hideAllSystems();
          closeTree();
          return;
        }
        useUIStore.getState().setCurrentScreen?.("landing");
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
      }} />
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          {activeTab === "organs" ? <OrganAtelierMainView onBackToFullAtlas={() => setActiveTab("atlas")} /> : <AnatomyViewer paused={memoryOpen} />}
        </div>
        {guideOpen && <GuideOverlay onClose={closeGuide} />}
      </main>
      {!isMobile && !layout.chatCollapsed && <ResizeHandle width={layout.chatWidth} onResize={setChatWidth} side="right" min={CHAT_LIMITS.min} max={CHAT_LIMITS.max} defaultWidth={CHAT_LIMITS.default} label={at("تغيير عرض لوحة المساعد الذكي", "Resize the assistant panel")} />}
      <aside hidden={layout.chatCollapsed} inert={layout.chatCollapsed} className={isMobile ? `fixed bottom-0 right-0 top-0 z-50 flex h-[100dvh] w-[90vw] max-w-[370px] flex-col overflow-hidden border-l shadow-2xl ${isDark ? "border-[#26324d] bg-[#0b1120]" : "border-[#bae6fd] bg-white"}` : `h-[100dvh] max-h-[100dvh] min-h-0 shrink-0 self-stretch overflow-hidden border-l ${isDark ? "border-[#26324d] bg-[#0b1120]" : "border-[#bae6fd] bg-white"}`} style={isMobile ? undefined : {
      width: layout.chatWidth
    }}>
        {isMobile && <div className={`flex shrink-0 items-center justify-between border-b px-3 py-2 ${isDark ? "border-[#26324d] bg-[#0f172a] text-[#f1f5f9]" : "border-[#bae6fd] bg-white text-[#0b1120]"}`}>
            <span className="text-xs font-bold text-[#f1f5f9]">
              <span className="inline-flex items-center gap-1.5">
                <Bot size={14} className="text-[#94a3b8]" /> {at("المساعد التشريحي الذكي", "AI Anatomy Tutor")}
              </span>
            </span>
            <button type="button" onClick={toggleChat} className="rounded-xl border border-[#26324d] bg-[#131c31] px-2.5 py-0.5 text-xs font-bold text-[#f1f5f9] hover:border-[#3b4d71]">
              <span className="inline-flex items-center gap-1"><X size={13} className="text-[#94a3b8]" /> {at("إغلاق", "Close")}</span>
            </button>
          </div>}
        <div className="min-h-0 flex-1 overflow-hidden">
          <ChatPanel />
        </div>
      </aside>
    </div>;
}
function AtlasViewportTopBar({
  isAr,
  isDark,
  at,
  onToggleLocale,
  treeCollapsed,
  chatCollapsed,
  showAssistant,
  onToggleTree,
  onCloseTree,
  onToggleChat,
  onOpenGuide,
  showBack,
  onBack
}: {
  isAr: boolean;
  isDark: boolean;
  at: <T>(ar: T, en: T) => T;
  onToggleLocale: () => void;
  treeCollapsed: boolean;
  chatCollapsed: boolean;
  showAssistant: boolean;
  onToggleTree: () => void;
  onCloseTree: () => void;
  onToggleChat: () => void;
  onOpenGuide: () => void;
  showBack: boolean;
  onBack: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeTab = useOrganAtelierStore(s => s.activeTab);
  const setActiveTab = useOrganAtelierStore(s => s.setActiveTab);
  const heartEnabled = useHeartStore(s => s.enabled);
  const breathEnabled = useBreathStore(s => s.enabled);
  const scanEnabled = useScanStore(s => s.enabled);
  const openHeartSoundsDirect = () => {
    setMenuOpen(false);
    const bStore = useBreathStore.getState();
    if (bStore.enabled) {
      useBreathStore.setState({
        enabled: false,
        sound: false
      });
    }
    if (useScanStore.getState().enabled) {
      useScanStore.setState({
        enabled: false
      });
    }
    setActiveTab("atlas");
    primeHeartSound();
    const st = useSceneStore.getState();
    st.clearIsolation();
    st.clearSelection();
    st.hideAllSystems();
    const hStore = useHeartStore.getState();
    useHeartStore.setState({
      enabled: true,
      sound: true
    });
    onCloseTree();
  };
  const openBreathSoundsDirect = () => {
    setMenuOpen(false);
    const hStore = useHeartStore.getState();
    if (hStore.enabled) {
      useHeartStore.setState({
        enabled: false,
        sound: false
      });
    }
    if (useScanStore.getState().enabled) {
      useScanStore.setState({
        enabled: false
      });
    }
    setActiveTab("atlas");
    primeBreathSound();
    const st = useSceneStore.getState();
    st.clearIsolation();
    st.clearSelection();
    st.hideAllSystems();
    const bStore = useBreathStore.getState();
    useBreathStore.setState({
      enabled: true,
      sound: true
    });
    onCloseTree();
  };
  const openScannerDirect = () => {
    setMenuOpen(false);
    const hStore = useHeartStore.getState();
    if (hStore.enabled) {
      useHeartStore.setState({
        enabled: false,
        sound: false
      });
    }
    const bStore = useBreathStore.getState();
    if (bStore.enabled) {
      useBreathStore.setState({
        enabled: false,
        sound: false
      });
    }
    setActiveTab("atlas");
    const st = useSceneStore.getState();
    st.clearIsolation();
    st.clearSelection();
    st.hideAllSystems();
    useScanStore.setState({
      enabled: true,
      panel: true,
      ghost: false,
      axial: false,
      cut: false
    });
    onCloseTree();
  };
  const open3DOrgansDirect = () => {
    setMenuOpen(false);
    const hStore = useHeartStore.getState();
    if (hStore.enabled) {
      useHeartStore.setState({
        enabled: false,
        sound: false
      });
    }
    const bStore = useBreathStore.getState();
    if (bStore.enabled) {
      useBreathStore.setState({
        enabled: false,
        sound: false
      });
    }
    if (useScanStore.getState().enabled) {
      useScanStore.setState({
        enabled: false
      });
    }
    setActiveTab("organs");
    onCloseTree();
  };
  return <div className={`relative z-50 flex h-11 w-full shrink-0 items-center justify-between gap-1.5 sm:gap-2 border-b px-2.5 sm:px-3.5 ${isDark ? "border-[#26324d] bg-[#0f172a]/95 text-[#f1f5f9]" : "border-[#bae6fd] bg-white/95 text-[#0b1120]"}`}>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {showBack && <button type="button" onClick={onBack} className="touch-manipulation flex items-center gap-1.5 rounded-xl border border-[#26324d] bg-[#131c31] px-2.5 py-1 text-[11px] font-bold text-[#f1f5f9] transition hover:border-[#3b4d71]" title={at("رجوع للصفحة أو الخطوة السابقة", "Back to previous page")}>
            <span>←</span>
            <span>{at("رجوع (Back)", "Back")}</span>
          </button>}
        <button type="button" onClick={onToggleTree} className={`touch-manipulation rounded-xl border px-2.5 py-1 text-[11px] font-bold transition ${!treeCollapsed ? "border-[#3b4d71] bg-[#26324d] text-[#f1f5f9]" : "border-[#26324d] bg-[#131c31] text-[#94a3b8] hover:text-[#f1f5f9]"}`} title={treeCollapsed ? at("فتح القائمة الجانبية", "Open Sidebar") : at("إغلاق القائمة الجانبية", "Close Sidebar")}>
          <PanelLeft size={14} className="text-[#d98a96]" />
        </button>
        <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-[#26324d] bg-[#131c31] px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
          <Crown size={11} className="text-[#d98a96]" />
          <span>CODE BLUE ATLAS</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button type="button" onClick={onToggleLocale} title={at("التبديل إلى واجهة اللغة الإنجليزية", "Switch interface to smart Medical Arabic")} className="touch-manipulation flex items-center gap-1 rounded-xl border border-[#26324d] bg-[#131c31] px-2.5 py-1 font-mono text-[10.5px] font-bold text-[#f1f5f9] transition hover:border-[#3b4d71]">
          <Languages size={11} className="text-[#94a3b8]" />
          <span>{isAr ? "عربي · EN" : "EN"}</span>
        </button>
        <button type="button" onClick={onOpenGuide} title={at("دليل استخدام الأطلس", "How Atlas works")} className="touch-manipulation flex h-7 w-7 items-center justify-center rounded-xl border border-[#26324d] bg-[#131c31] text-xs font-bold text-[#94a3b8] transition hover:border-[#3b4d71] hover:text-[#f1f5f9]">
          <HelpCircle size={13} />
        </button>
        {showAssistant && <button type="button" onClick={onToggleChat} aria-pressed={!chatCollapsed} className={`touch-manipulation rounded-xl border px-2.5 py-1 text-[11px] font-bold transition ${!chatCollapsed ? "border-[#3b4d71] bg-[#26324d] text-[#f1f5f9]" : "border-[#26324d] bg-[#131c31] text-[#94a3b8] hover:text-[#f1f5f9]"}`} title={chatCollapsed ? at("إظهار المساعد الذكي", "Show AI Assistant") : at("إخفاء المساعد الذكي لتوسيع الشاشة", "Hide AI Assistant")}>
            <span className="inline-flex items-center gap-1.5">
              <Bot size={13} className="text-[#94a3b8]" />
              <span className="hidden sm:inline">{at("المساعد الذكي", "Assistant")}</span>
            </span>
          </button>}
        <UserMenu compact />
      </div>
    </div>;
}
