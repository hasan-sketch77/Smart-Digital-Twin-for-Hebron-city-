"use client";

import { create } from "zustand";

interface UIState {
  unreadAlerts: number;
  setUnreadAlerts: (count: number) => void;

  isLoading: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;

  activeModal: string | null;
  modalData: unknown;
  openModal: (name: string, data?: unknown) => void;
  closeModal: () => void;

  showComparisonBar: boolean;
  setShowComparisonBar: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  unreadAlerts: 3,
  setUnreadAlerts: (unreadAlerts) => set({ unreadAlerts }),

  isLoading: {},
  setLoading: (key, loading) =>
    set((state) => ({
      isLoading: { ...state.isLoading, [key]: loading },
    })),

  activeModal: null,
  modalData: null,
  openModal: (name, data) => set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  showComparisonBar: true,
  setShowComparisonBar: (showComparisonBar) => set({ showComparisonBar }),
}));
