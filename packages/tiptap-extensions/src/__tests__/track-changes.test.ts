import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { SuggestionStore } from '../track-changes/suggestion-store';

describe('SuggestionStore', () => {
  it('should create and retrieve suggestions in local mode', () => {
    const store = new SuggestionStore();
    expect(store.getSuggestions()).toHaveLength(0);

    const sug = store.addSuggestion({
      type: 'insert',
      fromIndex: 10,
      toIndex: 20,
      text: 'văn bản mới',
      authorId: 'user-1',
      authorName: 'Đức',
    });

    expect(sug.id).toBeDefined();
    expect(store.getSuggestions()).toHaveLength(1);
    expect(store.getPendingSuggestions()).toHaveLength(1);

    store.acceptSuggestion(sug.id);
    expect(store.getSuggestion(sug.id)?.status).toBe('accepted');
    expect(store.getPendingSuggestions()).toHaveLength(0);

    store.rejectSuggestion(sug.id);
    expect(store.getSuggestion(sug.id)?.status).toBe('rejected');
  });

  it('should support acceptAll and rejectAll', () => {
    const store = new SuggestionStore();
    store.addSuggestion({
      type: 'insert',
      fromIndex: 0,
      toIndex: 5,
      text: 'hello',
      authorId: 'u1',
      authorName: 'U1',
    });
    store.addSuggestion({
      type: 'delete',
      fromIndex: 6,
      toIndex: 10,
      text: 'world',
      authorId: 'u2',
      authorName: 'U2',
    });

    expect(store.getPendingSuggestions()).toHaveLength(2);
    store.acceptAll();
    expect(store.getPendingSuggestions()).toHaveLength(0);
    expect(store.getSuggestions().every((s) => s.status === 'accepted')).toBe(true);

    store.addSuggestion({
      type: 'replace',
      fromIndex: 12,
      toIndex: 18,
      text: 'vietnam',
      authorId: 'u3',
      authorName: 'U3',
    });
    expect(store.getPendingSuggestions()).toHaveLength(1);
    store.rejectAll();
    expect(store.getPendingSuggestions()).toHaveLength(0);
    expect(store.getSuggestions().filter((s) => s.type === 'replace')[0]?.status).toBe('rejected');
  });

  it('should synchronize across two stores sharing the same Y.Doc', () => {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    doc1.on('update', (update) => {
      Y.applyUpdate(doc2, update);
    });
    doc2.on('update', (update) => {
      Y.applyUpdate(doc1, update);
    });

    const store1 = new SuggestionStore(doc1);
    const store2 = new SuggestionStore(doc2);

    store1.addSuggestion({
      type: 'insert',
      fromIndex: 5,
      toIndex: 15,
      text: 'realtime suggestion',
      authorId: 'user-1',
      authorName: 'User 1',
    });

    expect(store2.getSuggestions()).toHaveLength(1);
    expect(store2.getSuggestions()[0]?.text).toBe('realtime suggestion');

    store2.acceptSuggestion(store2.getSuggestions()[0]!.id);
    expect(store1.getSuggestions()[0]?.status).toBe('accepted');
  });
});
