import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleTaskList: {
      toggleTaskList: () => ReturnType;
    };
  }
}

export const Checklist = TaskList.extend({
  name: 'taskList',
});

export { TaskItem, TaskList };

export const ChecklistItem = TaskItem;