import { Link } from 'react-router-dom';
import { useTranslation } from '@office/i18n';
import { Button, Icon } from '@office/ui-kit';
import { MenuBar, type HeaderMenuActions } from '@/components/header/MenuBar';

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  menuActions: HeaderMenuActions;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header = ({
  title,
  onTitleChange,
  menuActions,
  theme,
  onToggleTheme,
}: HeaderProps) => {
  const { t, locale, setLocale } = useTranslation();

  const handleToggleLocale = () => {
    setLocale(locale === 'vi' ? 'en' : 'vi');
  };

  return (
    <header className="top-header">
      <div className="file-heading">
        <Link to="/" className="docs-file-icon" title={t('common.actions.back')} aria-label={t('common.actions.back')}>
          <Icon name="file-text" />
        </Link>
        <div className="file-heading-copy">
          <div className="title-line">
            <input
              aria-label={t('docs.header.titleAriaLabel')}
              placeholder={t('docs.header.titlePlaceholder')}
              className="title-input"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
            />
            <Button
              className="plain-icon-button"
              type="button"
              aria-label={t('docs.header.star')}
              title={t('docs.header.star')}
              variant="ghost"
              size="icon"
            >
              <Icon name="star" />
            </Button>
            <Button
              className="plain-icon-button"
              type="button"
              aria-label={t('docs.header.moveToFolder')}
              title={t('docs.header.moveToFolder')}
              variant="ghost"
              size="icon"
            >
              <Icon name="folder-closed" />
            </Button>
            <span className="cloud-state" title={t('common.status.savedToDevice')}>
              <Icon name="cloud" />
            </span>
          </div>
          <MenuBar {...menuActions} />
        </div>
      </div>
      <div className="header-actions">
        <Button
          className="header-icon-button font-medium text-xs px-2"
          type="button"
          aria-label={t('common.language.switchLanguage')}
          title={locale === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          onClick={handleToggleLocale}
          variant="ghost"
        >
          <span className="font-semibold">{locale.toUpperCase()}</span>
        </Button>
        <Button
          className="header-icon-button"
          type="button"
          aria-label={
            theme === 'dark'
              ? t('common.theme.switchToLight')
              : t('common.theme.switchToDark')
          }
          title={
            theme === 'dark'
              ? t('common.theme.switchToLight')
              : t('common.theme.switchToDark')
          }
          onClick={onToggleTheme}
          variant="ghost"
          size="icon"
        >
          {theme === 'dark' ? <Icon name="sun" /> : <Icon name="moon" />}
        </Button>
        <Button
          className="header-icon-button"
          type="button"
          aria-label={t('docs.header.versionHistory')}
          title={t('docs.header.versionHistory')}
          variant="ghost"
          size="icon"
        >
          <Icon name="history" />
        </Button>
        <Button
          className="header-icon-button"
          type="button"
          aria-label={t('docs.header.comments')}
          title={t('docs.header.comments')}
          variant="ghost"
          size="icon"
        >
          <Icon name="message-square" />
        </Button>
        <Button
          className="header-icon-button"
          type="button"
          aria-label={t('docs.header.videoMeeting')}
          title={t('docs.header.videoMeeting')}
          variant="ghost"
          size="icon"
        >
          <Icon name="video" />
          <Icon name="chevron-down" className="tiny-chevron" />
        </Button>
        <Button className="share-button" type="button">
          <Icon name="share-2" /> {t('common.actions.share')} <Icon name="chevron-down" />
        </Button>
        <div className="avatar" aria-label={t('docs.header.account', { name: 'Duc' })}>
          D
        </div>
      </div>
    </header>
  );
};