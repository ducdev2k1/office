import { MenuBar } from '@/modules/header/components/MenuBar';
import { TitleInput } from '@/modules/header/components/TitleInput';
import type { HeaderMenuActions } from '@/modules/header/types/header.types';
import { useTranslation } from '@office/i18n';
import { Button, Icon, cn } from '@office/ui-kit';
import { Link } from 'react-router-dom';

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onMenuToggle?: () => void;
  menuActions: HeaderMenuActions;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  starred?: boolean;
  onToggleStar?: () => void;
}

export const Header = ({
  title,
  onTitleChange,
  menuActions,
  theme,
  onToggleTheme,
  starred = false,
  onToggleStar,
}: HeaderProps) => {
  const { t, locale, setLocale } = useTranslation('docs');
  const { t: tCommon } = useTranslation('common');

  const handleToggleLocale = () => {
    setLocale(locale === 'vi' ? 'en' : 'vi');
  };

  return (
    <header className="top-header flex items-center justify-between min-w-0 bg-background border-b border-border px-5 py-2 gap-4">
      <div className="flex items-center min-w-0 flex-1 gap-2.5">
        <Link
          to="/"
          className="grid place-items-center size-9 text-primary shrink-0 hover:opacity-85 transition-opacity"
          title="OneMail Docs"
          aria-label="OneMail Docs"
        >
          <Icon name="file-text" size={32} />
        </Link>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-1 min-w-0 max-w-full h-8">
            <TitleInput title={title} onTitleChange={onTitleChange} />
            <Button
              className="size-7.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-hover shrink-0"
              type="button"
              aria-label={starred ? t('header.unstar') : t('header.star')}
              title={starred ? t('header.unstar') : t('header.star')}
              variant="ghost"
              size="icon"
              onClick={onToggleStar}
            >
              <Icon name="star" className={cn('size-4.5', starred && 'text-amber-500 fill-amber-500')} />
            </Button>
            <Button
              className="size-7.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-hover shrink-0"
              type="button"
              aria-label={t('header.moveToFolder')}
              title={`${t('header.moveToFolder')} · ${t('header.comingSoon')}`}
              variant="ghost"
              size="icon"
              disabled
            >
              <Icon name="folder-closed" className="size-4.5" />
            </Button>
            <span
              className="inline-flex text-muted-foreground shrink-0 pl-1"
              title={tCommon('status.savedToDevice')}
            >
              <Icon name="cloud" className="size-4.5" />
            </span>
          </div>
          <MenuBar {...menuActions} />
        </div>
      </div>
      <div className="flex items-center shrink-0 gap-1.5">
        <Button
          className="h-8 px-2 font-semibold text-xs rounded-md text-muted-foreground hover:text-foreground hover:bg-hover"
          type="button"
          aria-label={tCommon('language.switchLanguage')}
          title={locale === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          onClick={handleToggleLocale}
          variant="ghost"
        >
          <span>{locale.toUpperCase()}</span>
        </Button>
        <Button
          className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-hover"
          type="button"
          aria-label={
            theme === 'dark' ? tCommon('theme.switchToLight') : tCommon('theme.switchToDark')
          }
          title={
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
        <Button
          className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-hover hidden sm:inline-flex"
          type="button"
          aria-label={t('header.versionHistory')}
          title={`${t('header.versionHistory')} · ${t('header.comingSoon')}`}
          variant="ghost"
          size="icon"
          disabled
        >
          <Icon name="history" className="size-4.5" />
        </Button>
        <Button
          className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-hover hidden sm:inline-flex"
          type="button"
          aria-label={t('header.comments')}
          title={`${t('header.comments')} · ${t('header.comingSoon')}`}
          variant="ghost"
          size="icon"
          disabled
        >
          <Icon name="message-square" className="size-4.5" />
        </Button>
        <Button
          className="h-8 px-2 gap-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-hover hidden md:inline-flex"
          type="button"
          aria-label={t('header.videoMeeting')}
          title={`${t('header.videoMeeting')} · ${t('header.comingSoon')}`}
          variant="ghost"
          disabled
        >
          <Icon name="video" className="size-4.5" />
          <Icon name="chevron-down" size={10} className="-ml-0.5" />
        </Button>
        <Button
          className="h-9 px-4 gap-1.5 rounded-full bg-primary/15 text-primary hover:bg-primary/25 font-medium text-sm border-0 transition-colors"
          type="button"
          disabled
        >
          <Icon name="share-2" className="size-4" /> {tCommon('actions.share')}{' '}
          <Icon name="chevron-down" className="size-3.5" />
        </Button>
        <div
          className="grid place-items-center size-8 rounded-full bg-primary text-primary-foreground font-semibold text-xs ml-1 select-none"
          aria-label={t('header.account', { name: 'Duc' })}
        >
          D
        </div>
      </div>
    </header>
  );
};
