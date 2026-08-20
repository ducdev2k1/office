import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Icon } from '@office/ui-kit';
import { useTranslation } from '@office/i18n';
import type { Editor } from '@tiptap/core';
import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';

const CODE_LANGUAGES = [
  'javascript',
  'typescript',
  'html',
  'css',
  'json',
  'python',
  'java',
  'cpp',
  'csharp',
  'go',
  'rust',
  'sql',
  'bash',
  'markdown',
  'yaml',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'plain text',
];

interface CodeLanguagePickerProps {
  editor: Editor;
}

export const CodeLanguagePicker = ({ editor }: CodeLanguagePickerProps) => {
  const { t } = useTranslation('docs');
  const inCodeBlock = editor.isActive('codeBlock');
  const currentLanguage =
    (editor.getAttributes('codeBlock').language as string | undefined) || 'plain text';

  if (!inCodeBlock) return null;

  const setLanguage = (language: string) => {
    editor.chain().focus().updateAttributes('codeBlock', { language }).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<span className="inline-flex" />}>
        <ToolbarButton label={t('toolbar.codeLanguage')} onClick={() => undefined}>
          <span className="max-w-28 truncate text-[12px] font-medium">{currentLanguage}</span>
          <Icon name="chevron-down" size={12} />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" className="max-h-72 overflow-y-auto" sideOffset={6}>
        {CODE_LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language}
            onClick={() => setLanguage(language)}
            className={language === currentLanguage ? 'font-semibold text-primary' : ''}
          >
            {language}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};