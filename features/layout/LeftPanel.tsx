'use client';

import { StudyPanel, useOrganAtelierStore } from "@/features/study/StudyPanel";
import { AnatomyTree } from "@/features/tree/AnatomyTree";
import { StructureSearch } from "@/features/tree/StructureSearch";
import { StorageNotice } from "./StorageNotice";
import { Box, ScanLine, Volume2, X } from "lucide-react";
import { useAtlasLocale } from "@/lib/atlasI18n";
import { useSceneStore } from "@/stores/sceneStore";
import { useUIStore } from "@/stores/uiStore";
import { useScanStore } from "@/stores/scanStore";
import { useHeartStore } from "@/stores/heartStore";
import { useBreathStore } from "@/stores/breathStore";

export function LeftPanel({
  onClose,
  onMobileActionComplete,
}: {
  onClose?: () => void;
  onMobileActionComplete?: () => void;
}) {
  const { at } = useAtlasLocale();
  const activeTab = useOrganAtelierStore((s) => s.activeTab);
  const setActiveTab = useOrganAtelierStore((s) => s.setActiveTab);
  const background = useSceneStore((s) => s.background);
  const siteTheme = useUIStore((s) => s.theme);
  const isLight = siteTheme === "light" || background === "light";

  const scanEnabled = useScanStore((s) => s.enabled);
  const scanPanel = useScanStore((s) => s.panel);

  const handleOpenScanner = () => {
    const heart = useHeartStore.getState();
    if (heart.enabled) {
      heart.setSound(false);
      heart.toggle();
    }
    const breath = useBreathStore.getState();
    if (breath.enabled) {
      breath.setSound(false);
      breath.toggle();
    }
    const st = useSceneStore.getState();
    st.clearIsolation();
    st.clearSelection();
    st.hideAllSystems();
    useScanStore.setState({
      enabled: true,
      panel: true,
      ghost: false,
      axial: false,
      cut: false,
    });
    onMobileActionComplete?.();
  };

  return (
    <div
      className={`flex h-full min-h-0 flex-col ${
        isLight ? "bg-[#f0f7ff] text-[#0f172a]" : "bg-[#0b1120] text-[#f1f5f9]"
      }`}
    >
      {/* Top 3 Bordered Options on a Single Line with Leading Icons: Sounds | Scanner | 3D Organs */}
      <div
        className={`flex shrink-0 items-center gap-1.5 border-b px-2 py-2 ${
          isLight
            ? "border-[#bae6fd] bg-white/90 text-[#0f172a]"
            : "border-[#26324d] bg-[#0f172a]/95 text-[#f1f5f9]"
        }`}
      >
        <TabButton
          active={activeTab === "atlas" && !scanEnabled}
          isLight={isLight}
          onClick={() => {
            if (useScanStore.getState().enabled) {
              useScanStore.getState().toggle();
            }
            setActiveTab("atlas");
          }}
        >
          <Volume2 size={13} className="shrink-0 text-[#d98a96]" />
          <span className="whitespace-nowrap">{at("الأصوات", "Sounds")}</span>
        </TabButton>

        <TabButton
          active={scanEnabled}
          isLight={isLight}
          onClick={handleOpenScanner}
        >
          <ScanLine size={13} className="shrink-0 text-[#d98a96]" />
          <span className="whitespace-nowrap">{at("السكانر", "Scanner")}</span>
        </TabButton>

        <TabButton
          active={activeTab === "organs" && !scanEnabled}
          isLight={isLight}
          onClick={() => {
            if (useScanStore.getState().enabled) {
              useScanStore.getState().toggle();
            }
            setActiveTab("organs");
          }}
        >
          <Box size={13} className="shrink-0 text-[#d98a96]" />
          <span className="whitespace-nowrap">{at("الأعضاء 3D", "3D Organs")}</span>
        </TabButton>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            title={at("إغلاق القائمة الجانبية", "Close sidebar")}
            aria-label="Close sidebar"
            className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border px-2 py-1.5 text-[11px] font-bold transition ${
              isLight
                ? "border-[#bae6fd] bg-white text-[#334155] hover:border-[#be123c]/50 hover:text-[#0f172a]"
                : "border-[#26324d] bg-[#131c31] text-[#94a3b8] hover:border-[#3b4d71] hover:bg-[#1e293b] hover:text-[#f1f5f9]"
            }`}
          >
            <X size={13} className="shrink-0 text-[#d98a96]" />
            <span className="hidden sm:inline">{at("إغلاق", "Close")}</span>
          </button>
        )}
      </div>

      {/* Global Anatomical Structure Search Bar directly underneath the top tabs */}
      <StructureSearch
        onSelectComplete={() => {
          setActiveTab("atlas");
          onMobileActionComplete?.();
        }}
      />

      <div className={`min-h-0 flex-1 ${activeTab === "atlas" ? "" : "hidden"}`}>
        <AnatomyTree onMobileActionComplete={onMobileActionComplete} />
      </div>
      <div className={`min-h-0 flex-1 ${activeTab === "organs" ? "" : "hidden"}`}>
        <StudyPanel onSelectComplete={onMobileActionComplete} />
      </div>

      <StorageNotice />
    </div>
  );
}

function TabButton({
  active,
  isLight,
  onClick,
  children,
}: {
  active: boolean;
  isLight: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-2 py-1.5 text-[11px] font-bold tracking-tight transition-all ${
        active
          ? isLight
            ? "border-[#be123c] bg-sky-50 text-[#0f172a] shadow-xs ring-1 ring-[#be123c]/30"
            : "border-[#d98a96] bg-[#1e293b] text-[#f1f5f9] shadow-[0_0_12px_rgba(217,138,150,0.28)] ring-1 ring-[#d98a96]/40"
          : isLight
            ? "border-[#bae6fd] bg-white/80 text-[#334155] hover:border-sky-400 hover:bg-white hover:text-[#0f172a]"
            : "border-[#26324d] bg-[#131c31]/90 text-[#94a3b8] hover:border-[#d98a96]/60 hover:bg-[#1e293b] hover:text-[#f1f5f9]"
      }`}
    >
      {children}
    </button>
  );
}
