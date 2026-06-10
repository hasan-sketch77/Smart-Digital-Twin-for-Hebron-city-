export interface ScenarioData {
  id: string;
  nameAr: string;
  descriptionAr: string;
  status: string;
  impact: string;
  color: string;
  metrics: ScenarioMetrics;
  reliability: number | null;
  createdAt: string;
}

export interface ScenarioMetrics {
  traffic: string;
  infrastructure: string;
  timeline: string;
}
