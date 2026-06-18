export type StyleMode = 'formal' | 'simple' | 'professional' | 'academic' | 'creative' | 'social_media' | 'news_style';

export type LengthModulation = 'shorten' | 'expand' | 'same';

export interface ExplanationItem {
  original: string;
  replaced_with: string;
  reason: string;
}

export interface RephraseResponse {
  rephrased_text: string;
  readability_score: string;
  confidence_score: number;
  explanations: ExplanationItem[];
}
