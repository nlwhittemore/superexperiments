export type Dimension = { key: string; label: string; description: string };

export type MaturityLevelDef = {
  level: number;
  name: string;
  description: string;
};

export type TemplateConfig = {
  dimensions?: Dimension[];
  maturity_levels?: MaturityLevelDef[];
};

export type Question = {
  id: string;
  template_id: string;
  position: number;
  prompt: string;
  intent: string | null;
  probe_guidance: string | null;
  dimension: string | null;
};

export type Coverage = Record<string, { done: boolean; takeaway?: string }>;

export type DimensionScore = {
  score: number;
  rationale: string;
  evidence: string[];
};

export type AssessmentScores = Record<string, DimensionScore>;

export type AssessmentFlags = {
  use_case_ideas?: string[];
  blockers?: string[];
  notable_quotes?: string[];
  training_needs?: string[];
  champion_signal?: boolean;
};

export type ReportSnapshot = {
  participant_count: number;
  completed_count: number;
  assessed_count: number;
  avg_maturity: number | null;
  maturity_distribution: Record<string, number>;
  dimension_averages: Record<string, number | null>;
  segment_breakdown: Record<string, { count: number; avg_maturity: number | null }>;
};
