"use client";

import { create } from "zustand";
import type { SimulationData, ComparisonData } from "@/types/simulation";

interface SimulationState {
  simulations: SimulationData[];
  setSimulations: (sims: SimulationData[]) => void;

  activeSimulation: SimulationData | null;
  setActiveSimulation: (sim: SimulationData | null) => void;

  runningProgress: number;
  setRunningProgress: (progress: number) => void;

  comparisonData: ComparisonData | null;
  setComparisonData: (data: ComparisonData | null) => void;

  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  simulations: [],
  setSimulations: (simulations) => set({ simulations }),

  activeSimulation: null,
  setActiveSimulation: (activeSimulation) => set({ activeSimulation }),

  runningProgress: 0,
  setRunningProgress: (runningProgress) => set({ runningProgress }),

  comparisonData: null,
  setComparisonData: (comparisonData) => set({ comparisonData }),

  isSimulating: false,
  setIsSimulating: (isSimulating) => set({ isSimulating }),
}));
