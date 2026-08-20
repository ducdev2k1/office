import type { CollabStatus, CollabUser } from '@office/collab-core';
import { useTranslation } from '@office/i18n';
import { Button, Icon, Tooltip, TooltipContent, TooltipTrigger, cn } from '@office/ui-kit';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CollabConnectionBadge,
  CollaboratorAvatarStack,
  CollabUserProfilePopover,
} from '@/modules/collab';
import { MenuBar } from '@/modules/header/components/MenuBar';
import { TitleInput } from '@/modules/header/components/TitleInput';
import type { HeaderMenuActions } from '@/modules/header/types/header.types';

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onMenuToggle?: () => void;
  menuActions: HeaderMenuActions;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  starred?: boolean;
  onToggleStar?: () => void;
  onMoveToFolder?: () => void;
  collabStatus?: CollabStatus;
  collaborators?: CollabUser[];
  currentUser?: CollabUser;
  onUpdateCurrentUserProfile?: (partial: Partial<CollabUser>) => void;
  followedClientId?: number | null;
  onToggleFollow?: (user: CollabUser) => void;
  isReadOnly?: boolean;
}

export const Header = ({
  title,
  onTitleChange,
  menuActions,
  theme,
  onToggleTheme,
  starred = false,
  onToggleStar,
  onMoveToFolder,
  collabStatus,
  collaborators = [],
  currentUser,
  onUpdateCurrentUserProfile,
  followedClientId,
  onToggleFollow,
  isReadOnly = false,
}: HeaderProps) => {
  const { t, locale, setLocale } = useTranslation('docs');
  const { t: tCommon } = useTranslation('common');
  const [copied, setCopied] = useState(false);

  const handleToggleLocale = () => {
    setLocale(locale === 'vi' ? 'en' : 'vi');
  };

  const handleShare = () => {
    if (menuActions.onShare) {
      menuActions.onShare();
      return;
    }
    if (typeof window !== 'undefined') {
      void navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="top-header flex items-center justify-between min-w-0 bg-background border-b border-border px-5 py-2 gap-4">
      <div className="flex items-center min-w-0 flex-1 gap-2.5">
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                to="/"
                className="grid place-items-center size-9 text-primary shrink-0 hover:opacity-85 transition-opacity"
                aria-label="OneMail Docs"
              >
                <Icon name="file-text" size={32} />
              </Link>
            }
          />
          <TooltipContent side="bottom">OneMail Docs</TooltipContent>
        </Tooltip>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-1 min-w-0 max-w-full h-8">
            <TitleInput title={title} onTitleChange={onTitleChange} readOnly={isReadOnly} />

            {isReadOnly && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="inline-flex items-center gap-1 h-5.5 px-2 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 select-none shrink-0">
                      <Icon name="eye" size={12} className="shrink-0" />
                      {t('header.viewOnlyBadge')}
                    </span>
                  }
                />
                <TooltipContent side="bottom">{t('header.viewOnlyBadgeTooltip')}</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    className="size-7.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-hover shrink-0"
                    type="button"
                    aria-label={starred ? t('header.unstar') : t('header.star')}
                    variant="ghost"
                    size="icon"
                    onClick={onToggleStar}
                  >
                    <Icon
                      name="star"
                      className={cn('size-4.5', starred && 'text-amber-500 fill-amber-500')}
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
                  <Button
                    className="size-7.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-hover shrink-0"
                    type="button"
                    aria-label={t('header.moveToFolder')}
                    variant="ghost"
                    size="icon"
                    onClick={onMoveToFolder}
                  >
                    <Icon name="folder-closed" className="size-4.5" />
                  </Button>
                }
              />
              <TooltipContent side="bottom">
                {t('header.moveToFolder')}
              </TooltipContent>
            </Tooltip>

            {collabStatus ? (
              <CollabConnectionBadge status={collabStatus} />
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="inline-flex text-muted-foreground shrink-0 pl-1 cursor-default">
                      <Icon name="cloud" className="size-4.5" />
                    </span>
                  }
                />
                <TooltipContent side="bottom">{tCommon('status.savedToDevice')}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <MenuBar {...menuActions} isReadOnly={isReadOnly} />
        </div>
      </div>
      <div className="flex items-center shrink-0 gap-1.5">
        {collaborators.length > 0 && (
          <CollaboratorAvatarStack
            collaborators={collaborators}
            followedClientId={followedClientId}
            onToggleFollow={onToggleFollow}
            className="mr-1"
          />
        )}

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className="h-8 px-2 font-semibold text-xs rounded-md text-muted-foreground hover:text-foreground hover:bg-hover"
                type="button"
                aria-label={tCommon('language.switchLanguage')}
                onClick={handleToggleLocale}
                variant="ghost"
              >
                <span>{locale.toUpperCase()}</span>
              </Button>
            }
          />
          <TooltipContent side="bottom">
            {locale === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-hover"
                type="button"
                aria-label={
                  theme === 'dark' ? tCommon('theme.switchToLight') : tCommon('theme.switchToDark')
                }
                onClick={onToggleTheme}
                variant="ghost"
                size="icon"
              >
                {theme === 'dark' ? (
                  <Icon name="sun" className="size-4.5" />
                ) : (
                  <Icon name="moon" className="size-4.5" />
                )}
              </Button>
            }
          />
          <TooltipContent side="bottom">
            {theme === 'dark' ? tCommon('theme.switchToLight') : tCommon('theme.switchToDark')}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-hover hidden sm:inline-flex"
                type="button"
                aria-label={t('header.versionHistory')}
                variant="ghost"
                size="icon"
                onClick={() => menuActions.onVersionHistory?.()}
              >
                <Icon name="history" className="size-4.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">{t('header.versionHistory')}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-hover hidden sm:inline-flex"
                type="button"
                aria-label={t('header.comments')}
                variant="ghost"
                size="icon"
                disabled
              >
                <Icon name="message-square" className="size-4.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">
            {`${t('header.comments')} · ${t('header.comingSoon')}`}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className="h-8 px-2 gap-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-hover hidden md:inline-flex"
                type="button"
                aria-label={t('header.videoMeeting')}
                variant="ghost"
                disabled
              >
                <Icon name="video" className="size-4.5" />
                <Icon name="chevron-down" size={10} className="-ml-0.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">
            {`${t('header.videoMeeting')} · ${t('header.comingSoon')}`}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className="h-9 px-4 gap-1.5 rounded-full bg-primary/15 text-primary hover:bg-primary/25 font-medium text-sm border-0 transition-colors"
                type="button"
                onClick={handleShare}
                aria-label={copied ? 'Đã sao chép liên kết' : tCommon('actions.share')}
              >
                <Icon name={copied ? 'check' : 'share-2'} className="size-4" />
                {copied ? 'Đã sao chép' : tCommon('actions.share')}
              </Button>
            }
          />
          <TooltipContent side="bottom">
            {copied ? 'Đã sao chép liên kết vào bộ nhớ tạm' : 'Chia sẻ liên kết tài liệu'}
          </TooltipContent>
        </Tooltip>

        {currentUser && onUpdateCurrentUserProfile ? (
          <CollabUserProfilePopover
            user={currentUser}
            onUpdateProfile={onUpdateCurrentUserProfile}
            className="ml-1"
          />
        ) : (
          <div
            className="grid place-items-center size-8 rounded-full bg-primary text-primary-foreground font-semibold text-xs ml-1 select-none"
            aria-label={t('header.account', { name: 'Duc' })}
          >
            D
          </div>
        )}
      </div>
    </header>
  );
};
