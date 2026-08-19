import { useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useTranslation } from '@office/i18n';
import { Tooltip, TooltipContent, TooltipTrigger, cn } from '@office/ui-kit';
import { HeaderFooterTokens, type TokenName } from '@/modules/editor/extensions/headerFooterTokens.extension';

export interface InlineBandRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface HeaderFooterInlineEditorProps {
  band: 'header' | 'footer';
  rect: InlineBandRect;
  initialValue: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

type TokenI18nKey = 'page' | 'pages' | 'docTitle' | 'date';

const TOKEN_DEFS: { name: TokenName; i18nKey: TokenI18nKey; token: string }[] = [
  { name: 'page', i18nKey: 'page', token: '{page}' },
  { name: 'pages', i18nKey: 'pages', token: '{pages}' },
  { name: 'title', i18nKey: 'docTitle', token: '{title}' },
  { name: 'date', i18nKey: 'date', token: '{date}' },
];

export const HeaderFooterInlineEditor = ({
  band,
  rect,
  initialValue,
  onCommit,
  onCancel,
}: HeaderFooterInlineEditorProps) => {
  const { t } = useTranslation('docs');
  const doneRef = useRef(false);
  const dirtyRef = useRef(false);
  const latestRef = useRef(initialValue);
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;
  const cancelRef = useRef(onCancel);
  cancelRef.current = onCancel;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        link: false,
      }),
      HeaderFooterTokens,
    ],
    content: initialValue,
    editorProps: {
      attributes: { class: 'hf-inline-editor' },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Escape' && !event.isComposing) {
          doneRef.current = true;
          cancelRef.current();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: instance }) => {
      const text = instance.getText();
      latestRef.current = text;
      dirtyRef.current = text !== initialValue;
    },
    onBlur: ({ editor: instance }) => {
      if (!doneRef.current) {
        doneRef.current = true;
        commitRef.current(instance.getText());
        cancelRef.current();
      }
    },
  });

  useEffect(() => {
    editor?.commands.focus('end');
  }, [editor]);

  useEffect(() => {
    return () => {
      if (!doneRef.current && dirtyRef.current) {
        commitRef.current(latestRef.current);
      }
    };
  }, []);

  const insertToken = (name: TokenName) => {
    if (!editor) return;
    const def = TOKEN_DEFS.find((item) => item.name === name);
    if (!def) return;
    editor.chain().focus().insertContent(def.token).run();
  };

  const handleDone = () => {
    if (!editor || doneRef.current) return;
    doneRef.current = true;
    commitRef.current(editor.getText());
    cancelRef.current();
  };

  const toolbarTop = band === 'header' ? Math.max(2, rect.top - 38) : rect.top + rect.height + 6;

  return (
    <>
      <div
        className="hf-inline-toolbar z-40 inline-flex items-center gap-1 rounded-lg border border-border bg-card px-1.5 py-1 shadow-md"
        style={{ position: 'absolute', top: toolbarTop, left: rect.left }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {TOKEN_DEFS.map((def) => {
          const label = t(`headerFooter.tokens.${def.i18nKey}`);
          return (
            <Tooltip key={def.name}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (editor) {
                        editor.commands.insertContent(def.token);
                      }
                    }}
                    aria-label={label}
                    className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] font-medium text-foreground shadow-2xs hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                  >
                    {def.token}
                  </button>
                }
              />
              <TooltipContent side="top">{label}</TooltipContent>
            </Tooltip>
          );
        })}
        <span className="mx-0.5 h-4 w-px bg-border" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleDone}
          className={cn(
            'inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer',
          )}
        >
          {t('headerFooter.done')}
        </button>
      </div>

      <div
        className="hf-inline-card z-30 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
        style={{ position: 'absolute', top: rect.top, left: rect.left, width: rect.width, minHeight: rect.height }}
      >
        <EditorContent editor={editor} />
      </div>
    </>
  );
};