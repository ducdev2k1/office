import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { CommentsStore } from '../comments/comments-store';

describe('CommentsStore', () => {
  it('should create and retrieve threads in local mode', () => {
    const store = new CommentsStore();
    expect(store.getThreads()).toHaveLength(0);

    const thread = store.addThread({
      fromIndex: 5,
      toIndex: 12,
      text: 'Bình luận mẫu',
      authorId: 'user-1',
      authorName: 'Nguyễn Văn A',
      highlightedText: 'đoạn văn bản',
    });

    expect(thread.id).toBeDefined();
    expect(store.getThreads()).toHaveLength(1);
    expect(store.getThreads()[0]?.comments[0]?.content).toBe('Bình luận mẫu');

    store.addReply({
      threadId: thread.id,
      text: 'Đồng ý với ý kiến này',
      authorId: 'user-2',
      authorName: 'Trần Thị B',
    });

    const updated = store.getThread(thread.id);
    expect(updated?.comments).toHaveLength(2);
    expect(updated?.comments[1]?.content).toBe('Đồng ý với ý kiến này');

    store.setResolved(thread.id, true);
    expect(store.getThread(thread.id)?.resolved).toBe(true);

    store.deleteThread(thread.id);
    expect(store.getThreads()).toHaveLength(0);
  });

  it('should synchronize across two stores sharing the same Y.Doc', () => {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    // Setup sync simulation between doc1 and doc2
    doc1.on('update', (update) => {
      Y.applyUpdate(doc2, update);
    });
    doc2.on('update', (update) => {
      Y.applyUpdate(doc1, update);
    });

    const store1 = new CommentsStore(doc1);
    const store2 = new CommentsStore(doc2);

    store1.addThread({
      fromIndex: 0,
      toIndex: 10,
      text: 'Realtime comment test',
      authorId: 'user-1',
      authorName: 'User 1',
    });

    expect(store2.getThreads()).toHaveLength(1);
    expect(store2.getThreads()[0]?.comments[0]?.content).toBe('Realtime comment test');

    store2.addReply({
      threadId: store2.getThreads()[0]!.id,
      text: 'Realtime reply',
      authorId: 'user-2',
      authorName: 'User 2',
    });

    expect(store1.getThreads()[0]?.comments).toHaveLength(2);
    expect(store1.getThreads()[0]?.comments[1]?.content).toBe('Realtime reply');
  });
});
