import type { SheetCommentThread, SheetCommentItem } from '../types/comments.types';

const assert = (condition: boolean, msg: string): void => {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
};

const runTests = (): void => {
  console.log('--- Testing comments.types.ts and thread flow ---');

  const initialComment: SheetCommentItem = {
    id: 'c-1',
    author: {
      id: 'user-1',
      name: 'Nguyễn Văn A',
      color: '#3b82f6',
    },
    content: 'Cần kiểm tra lại số liệu dòng này.',
    createdAt: new Date().toISOString(),
  };

  const thread: SheetCommentThread = {
    id: 'th-1',
    sheetId: 'sheet-01',
    cellAddress: 'C4',
    range: {
      startRow: 3,
      endRow: 3,
      startColumn: 2,
      endColumn: 2,
    },
    resolved: false,
    comments: [initialComment],
    createdAt: new Date().toISOString(),
  };

  assert(thread.cellAddress === 'C4', 'Cell address should be C4');
  assert(thread.comments.length === 1, 'Initial thread should have 1 comment');
  assert(thread.resolved === false, 'Thread should initially be unresolved');
  console.log('✓ Test 1 Passed: Comment thread initialization');

  // Test 2: Reply to thread
  const reply: SheetCommentItem = {
    id: 'c-2',
    author: {
      id: 'user-2',
      name: 'Trần Thị B',
      color: '#10b981',
    },
    content: 'Đã đối soát xong, số liệu chính xác.',
    createdAt: new Date().toISOString(),
  };

  const updatedThread = {
    ...thread,
    comments: [...thread.comments, reply],
  };

  assert(updatedThread.comments.length === 2, 'Updated thread should have 2 comments');
  assert(updatedThread.comments[1]?.author.name === 'Trần Thị B', 'Author should match');
  console.log('✓ Test 2 Passed: Adding reply to comment thread');

  // Test 3: Resolve thread
  const resolvedThread = {
    ...updatedThread,
    resolved: true,
  };
  assert(resolvedThread.resolved === true, 'Thread should be marked as resolved');
  console.log('✓ Test 3 Passed: Resolving thread');

  console.log('All comments flow tests passed successfully! ✨');
};

runTests();
