export type SuggestionType = 'insert' | 'delete' | 'replace';
export type SuggestionStatus = 'pending' | 'accepted' | 'rejected';

export interface TrackSuggestion {
  id: string;
  type: SuggestionType;
  fromIndex: number;
  toIndex: number;
  fromAnchor?: string;
  toAnchor?: string;
  text: string;
  originalText?: string;
  authorId: string;
  authorName: string;
  authorColor?: string;
  createdAt: number;
  status: SuggestionStatus;
}
