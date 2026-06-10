export interface KPIData {
  roadCondition: { percent: number; status: string };
  travelTime: { minutes: number; trend: number };
  openAlerts: { count: number; urgent: number };
  co2Saved: { tons: number; target: number };
}

export interface AlertData {
  id: string;
  titleAr: string;
  descriptionAr: string;
  type: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
}

export interface AIRecommendationData {
  id: string;
  titleAr: string;
  descriptionAr: string;
  metrics: {
    congestion: number;
    efficiency: number;
    response: number;
  };
  priority: string;
  type: string;
}

export interface UserData {
  id: string;
  nameAr: string;
  nameEn: string;
  email: string;
  role: string;
  avatarInitial: string;
}

export interface SettingsData {
  darkMode: boolean;
  desktopNotifications: boolean;
  autoSave: boolean;
  mapQuality: string;
  language: string;
  region: string;
}
