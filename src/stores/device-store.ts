"use client";

import { create } from "zustand";
import type { IoTDeviceData } from "@/types/device";

interface DeviceState {
  devices: IoTDeviceData[];
  setDevices: (devices: IoTDeviceData[]) => void;

  statusFilter: string | null;
  typeFilter: string | null;
  searchQuery: string;
  setStatusFilter: (filter: string | null) => void;
  setTypeFilter: (filter: string | null) => void;
  setSearchQuery: (query: string) => void;

  viewMode: "list" | "map";
  setViewMode: (mode: "list" | "map") => void;

  selectedDevice: IoTDeviceData | null;
  selectDevice: (device: IoTDeviceData | null) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  setDevices: (devices) => set({ devices }),

  statusFilter: null,
  typeFilter: null,
  searchQuery: "",
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  viewMode: "list",
  setViewMode: (viewMode) => set({ viewMode }),

  selectedDevice: null,
  selectDevice: (selectedDevice) => set({ selectedDevice }),
}));
