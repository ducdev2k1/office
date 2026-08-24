import {
  CollabConnectionBadge,
  CollaboratorAvatarStack,
  CollabUserProfilePopover,
} from '@/modules/collab';
import type { CollabStatus, CollabUser } from '@office/collab-core';
import { useTranslation } from '@office/i18n';
import { Button, Icon, Input, Tooltip, TooltipContent, TooltipTrigger, cn } from '@office/ui-kit';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface SheetsHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  starred?: boolean;
  onToggleStar?: () => void;
  saveState: 'loading' | 'saving' | 'saved';
  onOpenFromDevice: (file: File) => void;
  onExport: () => void;
  exporting?: boolean;
  collabStatus?: CollabStatus;
  collaborators?: CollabUser[];
  currentUser?: CollabUser;
  onUpdateProfile?: (partial: Partial<CollabUser>) => void;
  onOpenShare?: () => void;
}

export const SheetsHeader = ({
  title,
  onTitleChange,
  theme = 'light',
  onToggleTheme,
  starred = false,
  onToggleStar,
  saveState,
  onOpenFromDevice,
  onExport,
  exporting = false,
  collabStatus,
  collaborators = [],
  currentUser,
  onUpdateProfile,
  onOpenShare,
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
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                to="/"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--o-kind-sheets)' }}
                aria-label={t('header.back')}
              >
                <Icon name="file-spreadsheet" size={20} />
              </Link>
            }
          />
          <TooltipContent side="bottom">{t('header.back')}</TooltipContent>
        </Tooltip>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <Input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="h-7 max-w-[320px] rounded border-0 bg-transparent px-1.5 text-base font-medium text-foreground shadow-none transition-colors hover:bg-hover focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring sm:max-w-[450px]"
              placeholder={t('untitled')}
              aria-label={t('header.titleAriaLabel')}
            />

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    className="size-7 rounded-full text-muted-foreground hover:bg-hover hover:text-foreground shrink-0"
                    type="button"
                    aria-label={starred ? t('header.unstar') : t('header.star')}
                    variant="ghost"
                    size="icon"
                    onClick={onToggleStar}
                  >
                    <Icon
                      name="star"
                      className={cn('size-4', starred && 'fill-amber-500 text-amber-500')}
                    />
                  </Button>
                }
              />
              <TooltipContent side="bottom">
                {starred ? t('header.unstar') : t('header.star')}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground pl-1 cursor-default">
                    <Icon
                      name="cloud"
                      className={cn(
                        'size-3.5',
                        saveState === 'saving' && 'animate-pulse text-primary',
                      )}
                    />
                    <span className="hidden md:inline">
                      {saveState === 'saving'
                        ? tCommon('actions.saving')
                        : tCommon('actions.saved')}
                    </span>
                  </span>
                }
              />
              <TooltipContent side="bottom">
                {saveState === 'saving' ? tCommon('actions.saving') : t('header.savedTooltip')}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Collab Badge & Avatars */}
        {collabStatus && <CollabConnectionBadge status={collabStatus} />}
        {collaborators.length > 0 && <CollaboratorAvatarStack collaborators={collaborators} />}
        {currentUser && onUpdateProfile && (
          <CollabUserProfilePopover user={currentUser} onUpdateProfile={onUpdateProfile} />
        )}

        {/* Share Button */}
        {onOpenShare && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10"
            onClick={onOpenShare}
          >
            <Icon name="users" size={14} />
            <span className="hidden sm:inline">{t('collab.share')}</span>
          </Button>
        )}

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
      </div>
    </header>
  );
};
