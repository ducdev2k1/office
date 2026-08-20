import * as Y from 'yjs';
import type { TrackSuggestion, SuggestionType } from './types';
import { createAnchorFromTypeIndex } from '../shared/yjs-anchor.utils';

export class SuggestionStore {
  private ydoc: Y.Doc | null = null;
  private ymap: Y.Map<TrackSuggestion> | null = null;
  private localSuggestions: Map<string, TrackSuggestion> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor(ydoc?: Y.Doc | null) {
    if (ydoc) {
      this.setYDoc(ydoc);
    }
  }

  setYDoc(ydoc: Y.Doc | null) {
    if (this.ydoc === ydoc) return;
    this.ydoc = ydoc;
    if (ydoc) {
      this.ymap = ydoc.getMap<TrackSuggestion>('suggestions');
      this.ymap.observe(() => {
        this.emit();
      });
      // Copy any local suggestions if empty
      if (this.ymap.size === 0 && this.localSuggestions.size > 0) {
        ydoc.transact(() => {
          this.localSuggestions.forEach((item, key) => {
            this.ymap?.set(key, item);
          });
        });
      }
    } else {
      this.ymap = null;
    }
    this.emit();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  getSuggestions(): TrackSuggestion[] {
    if (this.ymap) {
      const items: TrackSuggestion[] = [];
      this.ymap.forEach((item) => {
        items.push(item);
      });
      return items.sort((a, b) => a.createdAt - b.createdAt);
    }
    return Array.from(this.localSuggestions.values()).sort((a, b) => a.createdAt - b.createdAt);
  }

  getPendingSuggestions(): TrackSuggestion[] {
    return this.getSuggestions().filter((s) => s.status === 'pending');
  }

  getSuggestion(id: string): TrackSuggestion | undefined {
    if (this.ymap) {
      return this.ymap.get(id);
    }
    return this.localSuggestions.get(id);
  }

  addSuggestion(options: {
    type: SuggestionType;
    fromIndex: number;
    toIndex: number;
    text: string;
    originalText?: string;
    authorId: string;
    authorName: string;
    authorColor?: string;
  }): TrackSuggestion {
    const id = `sug-${Math.random().toString(36).slice(2, 10)}`;
    const ytext = this.ydoc ? this.ydoc.getText('default') : null;

    const fromAnchor = ytext ? createAnchorFromTypeIndex(ytext, options.fromIndex) : undefined;
    const toAnchor = ytext ? createAnchorFromTypeIndex(ytext, options.toIndex) : undefined;

    const item: TrackSuggestion = {
      id,
      type: options.type,
      fromIndex: options.fromIndex,
      toIndex: options.toIndex,
      fromAnchor: fromAnchor ? JSON.stringify(fromAnchor) : undefined,
      toAnchor: toAnchor ? JSON.stringify(toAnchor) : undefined,
      text: options.text,
      originalText: options.originalText,
      authorId: options.authorId,
      authorName: options.authorName,
      authorColor: options.authorColor,
      createdAt: Date.now(),
      status: 'pending',
    };

    if (this.ymap && this.ydoc) {
      this.ydoc.transact(() => {
        this.ymap?.set(id, item);
      });
    } else {
      this.localSuggestions.set(id, item);
      this.emit();
    }

    return item;
  }

  acceptSuggestion(id: string) {
    const item = this.getSuggestion(id);
    if (!item) return;

    const updated: TrackSuggestion = { ...item, status: 'accepted' };
    if (this.ymap && this.ydoc) {
      this.ydoc.transact(() => {
        this.ymap?.set(id, updated);
      });
    } else {
      this.localSuggestions.set(id, updated);
      this.emit();
    }
  }

  rejectSuggestion(id: string) {
    const item = this.getSuggestion(id);
    if (!item) return;

    const updated: TrackSuggestion = { ...item, status: 'rejected' };
    if (this.ymap && this.ydoc) {
      this.ydoc.transact(() => {
        this.ymap?.set(id, updated);
      });
    } else {
      this.localSuggestions.set(id, updated);
      this.emit();
    }
  }

  acceptAll() {
    const pending = this.getPendingSuggestions();
    if (this.ymap && this.ydoc) {
      this.ydoc.transact(() => {
        pending.forEach((item) => {
          this.ymap?.set(item.id, { ...item, status: 'accepted' });
        });
      });
    } else {
      pending.forEach((item) => {
        this.localSuggestions.set(item.id, { ...item, status: 'accepted' });
      });
      this.emit();
    }
  }

  rejectAll() {
    const pending = this.getPendingSuggestions();
    if (this.ymap && this.ydoc) {
      this.ydoc.transact(() => {
        pending.forEach((item) => {
          this.ymap?.set(item.id, { ...item, status: 'rejected' });
        });
      });
    } else {
      pending.forEach((item) => {
        this.localSuggestions.set(item.id, { ...item, status: 'rejected' });
      });
      this.emit();
    }
  }
}
