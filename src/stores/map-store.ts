"use client";

import { create } from "zustand";
import type { StreetData, BuildingData, DrawingMode, ProposedStreet } from "@/types/map";

interface MapState {
  layers: Record<string, boolean>;
  toggleLayer: (key: string) => void;
  setLayers: (layers: Record<string, boolean>) => void;

  drawingMode: DrawingMode;
  setDrawingMode: (mode: DrawingMode) => void;
  drawingPoints: [number, number, number][];
  addDrawingPoint: (point: [number, number, number]) => void;
  clearDrawing: () => void;

  selectedObjectId: string | null;
  selectedObjectType: string | null;
  selectObject: (id: string, type: string) => void;
  clearSelection: () => void;

  streets: StreetData[];
  setStreets: (streets: StreetData[]) => void;
  buildings: BuildingData[];
  setBuildings: (buildings: BuildingData[]) => void;

  proposedStreet: ProposedStreet | null;
  setProposedStreet: (street: ProposedStreet | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  layers: {
    traffic: true,
    infrastructure: true,
    maintenance: false,
    lighting: true,
    pedestrian: false,
    heatmap: true,
  },
  toggleLayer: (key) =>
    set((state) => ({
      layers: { ...state.layers, [key]: !state.layers[key] },
    })),
  setLayers: (layers) => set({ layers }),

  drawingMode: "none",
  setDrawingMode: (mode) => set({ drawingMode: mode }),
  drawingPoints: [],
  addDrawingPoint: (point) =>
    set((state) => ({
      drawingPoints: [...state.drawingPoints, point],
    })),
  clearDrawing: () => set({ drawingPoints: [], drawingMode: "none" }),

  selectedObjectId: null,
  selectedObjectType: null,
  selectObject: (id, type) =>
    set({ selectedObjectId: id, selectedObjectType: type }),
  clearSelection: () =>
    set({ selectedObjectId: null, selectedObjectType: null }),

  streets: [],
  setStreets: (streets) => set({ streets }),
  buildings: [],
  setBuildings: (buildings) => set({ buildings }),

  proposedStreet: null,
  setProposedStreet: (street) => set({ proposedStreet: street }),
}));
