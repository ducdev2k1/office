import { useTranslation } from '@office/i18n';
import { Button, Icon, cn } from '@office/ui-kit';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface SheetsHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  starred?: boolean;
  onToggleStar?: () => void;
  saveState: 'loading' | 'saving' | 'saved';
  onOpenFromDevice: (file: File) => void;
  onExport: () => void;
  exporting?: boolean;
}

export const SheetsHeader = ({
  title,
  onTitleChange,
  theme,
  onToggleTheme,
  starred = false,
  onToggleStar,
  saveState,
  onOpenFromDevice,
  onExport,
  exporting = false,
}: SheetsHeaderProps) => {
  const { t, locale, setLocale } = useTranslation('sheets');
  const { t: tCommon } = useTranslation('common');
  const [localTitle, setLocalTitle] = useState(title);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const handleTitleBlur = () => {
    const trimmed = localTitle.trim();
    if (trimmed && trimmed !== title) {
      onTitleChange(trimmed);
    } else {
      setLocalTitle(title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleToggleLocale = () => {
    setLocale(locale === 'vi' ? 'en' : 'vi');
  };

  return (
    <header className="top-header flex h-14 items-center justify-between border-b border-border bg-background px-4 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link
          to="/"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--o-kind-sheets)' }}
          title="Quay lại danh sách Bảng tính"
          aria-label="Quay lại danh sách Bảng tính"
        >
          <Icon name="file-spreadsheet" size={20} />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="h-7 max-w-[320px] rounded px-1.5 text-base font-medium text-foreground outline-none transition-colors hover:bg-hover focus:bg-background focus:ring-1 focus:ring-ring sm:max-w-[450px]"
              placeholder={t('untitled')}
              aria-label="Tiêu đề bảng tính"
            />
            <Button
              className="size-7 rounded-full text-muted-foreground hover:bg-hover hover:text-foreground shrink-0"
              type="button"
              aria-label={starred ? 'Bỏ gắn dấu sao' : 'Gắn dấu sao'}
              title={starred ? 'Bỏ gắn dấu sao' : 'Gắn dấu sao'}
              variant="ghost"
              size="icon"
              onClick={onToggleStar}
            >
              <Icon
                name="star"
                className={cn('size-4', starred && 'fill-amber-500 text-amber-500')}
              />
            </Button>
            <span
              className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground pl-1"
              title={saveState === 'saving' ? 'Đang lưu...' : 'Đã lưu vào bộ nhớ thiết bị'}
            >
              <Icon
                name="cloud"
                className={cn('size-3.5', saveState === 'saving' && 'animate-pulse text-primary')}
              />
              <span className="hidden md:inline">
                {saveState === 'saving' ? 'Đang lưu...' : 'Đã lưu'}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onOpenFromDevice(file);
            e.target.value = '';
          }}
        />

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium text-foreground"
          onClick={() => fileInputRef.current?.click()}
        >
          <Icon name="upload" size={14} />
          <span className="hidden sm:inline">{t('openXlsx')}</span>
        </Button>

        <Button
          variant="default"
          size="sm"
          disabled={exporting}
          className="h-8 gap-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: 'var(--o-kind-sheets)' }}
          onClick={onExport}
        >
          <Icon name="download" size={14} />
          <span>{exporting ? t('exporting') : t('exportXlsx')}</span>
        </Button>

        <div className="mx-1 h-5 w-[1px] bg-border" />

        <Button
          className="h-8 px-2 text-xs font-semibold text-muted-foreground hover:bg-hover hover:text-foreground"
          type="button"
          onClick={handleToggleLocale}
          variant="ghost"
        >
          <span>{locale.toUpperCase()}</span>
        </Button>

        <Button
          className="size-8 rounded-full text-muted-foreground hover:bg-hover hover:text-foreground"
          type="button"
          aria-label={
            theme === 'dark' ? tCommon('theme.switchToLight') : tCommon('theme.switchToDark')
          }
          onClick={onToggleTheme}
          variant="ghost"
          size="icon"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="size-4" />
        </Button>

        <div className="ml-1 grid size-8 select-none place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          D
        </div>
      </div>
    </header>
  );
};
