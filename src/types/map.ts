export interface StreetData {
  id: string;
  nameAr: string;
  nameEn?: string;
  type: string;
  coordinates: number[][];
  width: number;
  speedLimit: number;
  congestion: number;
  avgSpeed: number;
  isProposed: boolean;
}

export interface BuildingData {
  id: string;
  nameAr?: string;
  nameEn?: string;
  type: string;
  coordinates: [number, number];
  footprint: number[][];
  height: number;
  floors: number;
}

export interface MapLayerData {
  id: string;
  key: string;
  nameAr: string;
  icon: string;
  enabled: boolean;
}

export type DrawingMode = "none" | "add_street" | "modify_street" | "edit_street" | "add_roundabout" | "remove_traffic_light";

export interface ProposedStreet {
  points: [number, number, number][];
  width: number;
  type: string;
  length: number;
}
