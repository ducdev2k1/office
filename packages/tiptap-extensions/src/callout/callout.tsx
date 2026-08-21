import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import { useState } from 'react';

export type CalloutType = 'info' | 'tip' | 'warning' | 'danger';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attrs?: { type?: CalloutType }) => ReturnType;
      toggleCallout: (attrs?: { type?: CalloutType }) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>;
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-callout-type') || 'info',
        renderHTML: (attributes) => ({
          'data-callout-type': attributes.type || 'info',
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
      {
        tag: 'div.callout',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const classList = el.className;
          let type: CalloutType = 'info';
          if (classList.includes('callout-tip')) type = 'tip';
          else if (classList.includes('callout-warning')) type = 'warning';
          else if (classList.includes('callout-danger')) type = 'danger';
          return { type };
        },
      },
      {
        tag: 'aside.callout',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const type = (node.attrs.type as CalloutType) || 'info';
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'callout',
        'data-callout-type': type,
        class: `callout callout-${type}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (attrs = { type: 'info' }) =>
        ({ commands }) =>
          commands.wrapIn(this.name, attrs),
      toggleCallout:
        (attrs = { type: 'info' }) =>
        ({ commands }) =>
          commands.toggleWrap(this.name, attrs),
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView);
  },
});

const CALLOUT_CONFIG: Record<
  CalloutType,
  { label: string; icon: string; border: string; bg: string; text: string; badge: string }
> = {
  info: {
    label: 'Thông tin',
    icon: 'ℹ️',
    border: 'border-blue-300 dark:border-blue-700/60',
    bg: 'bg-blue-50/70 dark:bg-blue-950/30',
    text: 'text-blue-900 dark:text-blue-200',
    badge: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300',
  },
  tip: {
    label: 'Mẹo',
    icon: '💡',
    border: 'border-emerald-300 dark:border-emerald-700/60',
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    text: 'text-emerald-900 dark:text-emerald-200',
    badge: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300',
  },
  warning: {
    label: 'Chú ý',
    icon: '⚠️',
    border: 'border-amber-300 dark:border-amber-700/60',
    bg: 'bg-amber-50/70 dark:bg-amber-950/30',
    text: 'text-amber-900 dark:text-amber-200',
    badge: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300',
  },
  danger: {
    label: 'Cảnh báo',
    icon: '🚨',
    border: 'border-rose-300 dark:border-rose-700/60',
    bg: 'bg-rose-50/70 dark:bg-rose-950/30',
    text: 'text-rose-900 dark:text-rose-200',
    badge: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300',
  },
};

const CalloutNodeView = ({ node, updateAttributes, deleteNode }: NodeViewProps) => {
  const currentType = (node.attrs.type as CalloutType) || 'info';
  const config = CALLOUT_CONFIG[currentType] ?? CALLOUT_CONFIG.info;
  const [showMenu, setShowMenu] = useState(false);

  const handleSelectType = (type: CalloutType) => {
    updateAttributes({ type });
    setShowMenu(false);
  };

  return (
    <NodeViewWrapper
      className={`callout callout-${currentType} my-4 rounded-xl border-l-4 ${config.border} ${config.bg} p-4 shadow-xs transition-colors`}
      data-type="callout"
      data-callout-type={currentType}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2" contentEditable={false}>
        <div className="relative inline-block">
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${config.badge} cursor-pointer hover:opacity-85 transition-opacity`}
            onClick={() => setShowMenu((prev) => !prev)}
            title="Đổi loại ghi chú"
          >
            <span>{config.icon}</span>
            <span>{config.label}</span>
            <span className="text-[10px] opacity-70">▼</span>
          </button>

          {showMenu && (
            <div
              className="absolute left-0 top-full z-50 mt-1 w-36 rounded-lg border border-border bg-popover p-1 shadow-lg"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {(Object.keys(CALLOUT_CONFIG) as CalloutType[]).map((key) => {
                const item = CALLOUT_CONFIG[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                      key === currentType ? 'bg-accent text-accent-foreground font-semibold' : 'hover:bg-hover'
                    }`}
                    onClick={() => handleSelectType(key)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-destructive cursor-pointer px-1.5 py-0.5 rounded-sm hover:bg-destructive/10 transition-colors"
          onClick={deleteNode}
          title="Xóa hộp ghi chú"
        >
          ✕
        </button>
      </div>

      <div className={`callout-content min-w-0 ${config.text}`}>
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
};
