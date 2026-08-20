export interface CommentItem {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CommentThread {
  id: string;
  fromAnchor: string; // encoded Y.RelativePosition
  toAnchor: string;   // encoded Y.RelativePosition
  fromIndex?: number; // resolved index in current doc
  toIndex?: number;   // resolved index in current doc
  highlightedText?: string;
  resolved: boolean;
  createdAt: string;
  comments: CommentItem[];
}
