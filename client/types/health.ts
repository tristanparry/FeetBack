export enum SeverityLevel {
  Severe = 'severe',
  Mild = 'mild',
  Neutral = 'neutral',
}

export type HealthInsight = {
  name: string;
  description: string;
  severity: SeverityLevel;
};

