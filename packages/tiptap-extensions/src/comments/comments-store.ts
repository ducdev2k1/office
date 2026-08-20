import type * as Y from 'yjs';
import type { CommentItem, CommentThread } from './types';
import { decodeAnchor, encodeAnchor, indexToAnchor } from '../shared/yjs-anchor.utils';

export class CommentsStore {
  private ymap: Y.Map<CommentThread> | null = null;
  private localThreads = new Map<string, CommentThread>();
  private listeners = new Set<() => void>();

  constructor(ydoc?: Y.Doc | null) {
    if (ydoc) {
      this.ymap = ydoc.getMap<CommentThread>('comments');
      this.ymap.observe(() => {
        this.notify();
      });
    }
  }

  public setYDoc(ydoc?: Y.Doc | null): void {
    if (ydoc) {
      this.ymap = ydoc.getMap<CommentThread>('comments');
      this.ymap.observe(() => {
        this.notify();
      });
    } else {
      this.ymap = null;
    }
    this.notify();
  }

  public getThreads(): CommentThread[] {
    if (this.ymap) {
      return Array.from(this.ymap.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }
    return Array.from(this.localThreads.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  public addThread(options: {
    fromIndex: number;
    toIndex: number;
    text: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    highlightedText?: string;
  }): CommentThread {
    const threadId = `thread-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const initialComment: CommentItem = {
      id: commentId,
      threadId,
      authorId: options.authorId,
      authorName: options.authorName,
      authorAvatar: options.authorAvatar,
      content: options.text,
      createdAt: now,
    };

    const thread: CommentThread = {
      id: threadId,
      fromAnchor: encodeAnchor(indexToAnchor(options.fromIndex)),
      toAnchor: encodeAnchor(indexToAnchor(options.toIndex, 1)),
      fromIndex: options.fromIndex,
      toIndex: options.toIndex,
      highlightedText: options.highlightedText,
      resolved: false,
      createdAt: now,
      comments: [initialComment],
    };

    if (this.ymap) {
      this.ymap.set(threadId, thread);
    } else {
      this.localThreads.set(threadId, thread);
      this.notify();
    }
    return thread;
  }

  public addReply(options: {
    threadId: string;
    text: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
  }): void {
    const thread = this.getThread(options.threadId);
    if (!thread) return;

    const commentId = `comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const reply: CommentItem = {
      id: commentId,
      threadId: options.threadId,
      authorId: options.authorId,
      authorName: options.authorName,
      authorAvatar: options.authorAvatar,
      content: options.text,
      createdAt: new Date().toISOString(),
    };

    const updated: CommentThread = {
      ...thread,
      comments: [...thread.comments, reply],
    };

    if (this.ymap) {
      this.ymap.set(options.threadId, updated);
    } else {
      this.localThreads.set(options.threadId, updated);
      this.notify();
    }
  }

  public setResolved(threadId: string, resolved: boolean): void {
    const thread = this.getThread(threadId);
    if (!thread) return;
    const updated = { ...thread, resolved };
    if (this.ymap) {
      this.ymap.set(threadId, updated);
    } else {
      this.localThreads.set(threadId, updated);
      this.notify();
    }
  }

  public deleteThread(threadId: string): void {
    if (this.ymap) {
      this.ymap.delete(threadId);
    } else {
      this.localThreads.delete(threadId);
      this.notify();
    }
  }

  public getThread(threadId: string): CommentThread | undefined {
    if (this.ymap) {
      return this.ymap.get(threadId);
    }
    return this.localThreads.get(threadId);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }
}
