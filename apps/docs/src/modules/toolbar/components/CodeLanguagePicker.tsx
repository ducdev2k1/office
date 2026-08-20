import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Icon } from '@office/ui-kit';
import type { Editor } from '@tiptap/core';
import { useTranslation } from '@office/i18n';
import { ToolbarButton } from '@/modules/toolbar/components/ToolbarButton';

const CODE_LANGUAGES = [
  'plaintext',
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'ruby',
  'php',
  'css',
  'scss',
  'html',
  'xml',
  'json',
  'markdown',
  'bash',
  'shell',
  'sql',
  'yaml',
  'kotlin',
  'swift',
  'dart',
  'lua',
  'r',
  'diff',
];

interface CodeLanguagePickerProps {
  editor: Editor;
}

export const CodeLanguagePicker = ({ editor }: CodeLanguagePickerProps) => {
  const { t } = useTranslation('docs');
  const inCodeBlock = editor.isActive('codeBlock');
  const currentLanguage = (editor.getAttributes('codeBlock').language as string) ?? 'plaintext';

  if (!inCodeBlock) return null;

  const setLanguage = (language: string) => {
    editor.chain().focus().updateAttributes('codeBlock', { language }).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button type="button" />}>
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