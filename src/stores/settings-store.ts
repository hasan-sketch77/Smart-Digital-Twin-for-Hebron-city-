"use client";

import { create } from "zustand";

interface SettingsState {
  darkMode: boolean;
  desktopNotifications: boolean;
  autoSave: boolean;
  mapQuality: string;
  language: string;

  toggleDarkMode: () => void;
  toggleDesktopNotifications: () => void;
  toggleAutoSave: () => void;
  setMapQuality: (quality: string) => void;
  setLanguage: (lang: string) => void;
  loadSettings: (settings: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  darkMode: false,
  desktopNotifications: true,
  autoSave: true,
  mapQuality: "high",
  language: "ar",

  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  toggleDesktopNotifications: () => set((s) => ({ desktopNotifications: !s.desktopNotifications })),
  toggleAutoSave: () => set((s) => ({ autoSave: !s.autoSave })),
  setMapQuality: (mapQuality) => set({ mapQuality }),
  setLanguage: (language) => set({ language }),
  loadSettings: (settings) => set(settings),
}));
