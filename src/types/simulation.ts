export interface SimulationData {
  id: string;
  nameAr: string;
  type: string;
  status: string;
  progress: number;
  inputData: SimulationInput;
  createdAt: string;
  completedAt?: string;
  results?: SimulationResultData[];
}

export interface SimulationInput {
  type: string;
  affectedStreetIds: string[];
  parameters: {
    coordinates?: number[][];
    widthChange?: number;
    radius?: number;
    lanes?: number;
    length?: number;
  };
}

export interface SimulationResultData {
  id: string;
  congestionReduction: number;
  speedIncrease: number;
  emissionReduction: number;
  safetyScore: number;
  beforeMetrics: BeforeAfterMetrics;
  afterMetrics: BeforeAfterMetrics;
  explanationAr: string;
  dataPointsProcessed: number;
  modelAccuracy: number;
  recommendations: SimulationRecommendation[];
}

export interface BeforeAfterMetrics {
  avgTravelTime: number;
  co2: number;
  failedIntersections: number;
}

export interface SimulationRecommendation {
  titleAr: string;
  descriptionAr: string;
  metrics: {
    congestion: number;
    efficiency: number;
    response: number;
  };
}

export interface ComparisonData {
  before: BeforeAfterMetrics;
  after: BeforeAfterMetrics;
}
