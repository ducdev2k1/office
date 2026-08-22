import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@office/ui-kit';
import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { mountPopup } from '@office/tiptap-extensions';
import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';

interface LinkPopoverHostProps {
  editor: Editor | null;
}

interface LinkState {
  url: string;
  anchor: DOMRect;
}

export const LinkPopoverHost = ({ editor }: LinkPopoverHostProps) => {
  const { t } = useTranslation('docs');
  const containerRef = useRef<HTMLDivElement>(null);
  const [link, setLink] = useState<LinkState | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const hide = useCallback(() => {
    setLink(null);
    setEditing(false);
  }, []);

  const openLink = useCallback((url: string) => {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    window.open(normalized, '_blank', 'noopener,noreferrer');
  }, []);

  const copyLink = useCallback((url: string) => {
    void navigator.clipboard?.writeText(url).catch(() => undefined);
  }, []);

  const unlink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
    hide();
  }, [editor, hide]);

  const saveEdit = useCallback(() => {
    const url = draft.trim();
    if (url && editor) {
      const { from, to } = editor.state.selection;
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .setTextSelection({ from, to })
        .run();
    }
    hide();
  }, [draft, editor, hide]);

  useEffect(() => {
    if (!editor) return;
    const storage = editor.storage.linkPopover as
      | { onOpen: ((editor: Editor, url: string, anchor: DOMRect | null) => void) | null }
      | undefined;
    if (storage) {
      storage.onOpen = (activeEditor, url, anchor) => {
        if (!anchor) return;
        setLink({ url, anchor });
        setEditing(false);
        setDraft(url);
        activeEditor.commands.setTextSelection(activeEditor.state.selection);
      };
    }
  }, [editor]);

  useEffect(() => {
    if (!editing || !link) return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [editing, link]);

  useEffect(() => {
    if (!link || !containerRef.current) return;
    const controller = mountPopup(containerRef.current, {
      placement: 'top-start',
      anchor: link.anchor,
      offset: 8,
    });
    return () => controller.destroy();
  }, [link, editing]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') saveEdit();
    if (event.key === 'Escape') hide();
  };

  if (!link) return null;

  const content = (
    <div
      ref={containerRef}
      className="fixed z-50 flex min-w-[220px] max-w-sm items-center gap-1 rounded-xl border border-border bg-popover/95 backdrop-blur-md px-2 py-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100"
      onMouseDown={(event) => event.preventDefault()}
    >
      {editing ? (
        <>
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('toolbar.linkUrlPlaceholder')}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            aria-label={t('toolbar.linkEdit')}
            className="grid size-6 place-items-center rounded-md text-primary hover:bg-accent cursor-pointer"
            onClick={saveEdit}
          >
            <Icon name="check" size={16} />
          </button>
        </>
      ) : (
        <>
          <span className="max-w-[180px] flex-1 truncate text-[13px] text-primary underline" aria-label={link.url}>
            {link.url.replace(/^https?:\/\//, '')}
          </span>
          <ToolbarButton label={t('toolbar.linkOpen')} onClick={() => openLink(link.url)}>
            <Icon name="external-link" />
          </ToolbarButton>
          <ToolbarButton label={t('toolbar.linkCopy')} onClick={() => copyLink(link.url)}>
            <Icon name="copy" />
          </ToolbarButton>
          <ToolbarButton label={t('toolbar.linkEdit')} onClick={() => setEditing(true)}>
            <Icon name="pencil" />
          </ToolbarButton>
          <ToolbarButton label={t('toolbar.linkUnlink')} onClick={unlink}>
            <Icon name="x" />
          </ToolbarButton>
        </>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};