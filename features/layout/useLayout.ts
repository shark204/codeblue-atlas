'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { readLocal, writeLocal } from "@/lib/localStore";

const STORAGE_KEY = "anatria3d.layout.v8";

export const TREE_LIMITS = { min: 300, max: 520, default: 365 } as const;
export const CHAT_LIMITS = { min: 290, max: 540, default: 345 } as const;

export interface LayoutState {
  treeWidth: number;
  chatWidth: number;
  treeCollapsed: boolean;
  chatCollapsed: boolean;
}

const DEFAULTS: LayoutState = {
  treeWidth: TREE_LIMITS.default,
  chatWidth: CHAT_LIMITS.default,
  treeCollapsed: true,
  chatCollapsed: true,
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export type WidthUpdate = number | ((current: number) => number);

const resolve = (update: WidthUpdate, current: number) =>
  typeof update === "function" ? update(current) : update;

function load(): LayoutState {
  try {
    const raw = readLocal(STORAGE_KEY);
    if (!raw) {
      return DEFAULTS;
    }
    const parsed = JSON.parse(raw) as Partial<LayoutState>;
    return {
      treeWidth: clamp(
        Number(parsed.treeWidth) || DEFAULTS.treeWidth,
        TREE_LIMITS.min,
        TREE_LIMITS.max,
      ),
      chatWidth: clamp(
        Number(parsed.chatWidth) || DEFAULTS.chatWidth,
        CHAT_LIMITS.min,
        CHAT_LIMITS.max,
      ),
      treeCollapsed: false,
      chatCollapsed: true,
    };
  } catch {
    return DEFAULTS;
  }
}

export function useLayout() {
  const [layout, setLayout] = useState<LayoutState>(load);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        writeLocal(STORAGE_KEY, JSON.stringify(layout));
      } catch {
        // Ignore storage errors
      }
    }, 250);
    return () => clearTimeout(saveTimer.current);
  }, [layout]);

  const setTreeWidth = useCallback((width: WidthUpdate) => {
    setLayout((state) => ({
      ...state,
      treeWidth: clamp(resolve(width, state.treeWidth), TREE_LIMITS.min, TREE_LIMITS.max),
    }));
  }, []);

  const setChatWidth = useCallback((width: WidthUpdate) => {
    setLayout((state) => ({
      ...state,
      chatWidth: clamp(resolve(width, state.chatWidth), CHAT_LIMITS.min, CHAT_LIMITS.max),
    }));
  }, []);

  const toggleTree = useCallback(
    () => setLayout((state) => ({ ...state, treeCollapsed: !state.treeCollapsed })),
    [],
  );

  const closeTree = useCallback(
    () => setLayout((state) => (state.treeCollapsed ? state : { ...state, treeCollapsed: true })),
    [],
  );

  const openTree = useCallback(
    () => setLayout((state) => (!state.treeCollapsed ? state : { ...state, treeCollapsed: false })),
    [],
  );

  const toggleChat = useCallback(
    () => setLayout((state) => ({ ...state, chatCollapsed: !state.chatCollapsed })),
    [],
  );

  const reset = useCallback(() => setLayout(DEFAULTS), []);

  return { layout, setTreeWidth, setChatWidth, toggleTree, closeTree, openTree, toggleChat, reset };
}
