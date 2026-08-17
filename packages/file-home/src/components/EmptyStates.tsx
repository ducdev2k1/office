import { useTranslation } from '@office/i18n';
import { Button, Icon } from '@office/ui-kit';

interface EmptyStatesProps {
  variant: 'no-files' | 'no-results' | 'empty-trash';
  onCreate?: () => void;
  onClearQuery?: () => void;
}

export const EmptyStates = ({ variant, onCreate, onClearQuery }: EmptyStatesProps) => {
  const { t } = useTranslation('appShell');

  const content = {
    'no-files': {
      icon: 'file-plus-2',
      title: t('home.emptyTitle'),
      description: t('home.emptyDescription'),
      action: onCreate ? (
        <Button onClick={onCreate} size="sm">
          {t('home.createNew')}
        </Button>
      ) : null,
    },
    'no-results': {
      icon: 'search-x',
      title: t('home.noResultsTitle'),
      description: t('home.noResultsDescription'),
      action: onClearQuery ? (
        <Button onClick={onClearQuery} variant="outline" size="sm">
          {t('home.clearSearch')}
        </Button>
      ) : null,
    },
    'empty-trash': {
      icon: 'file-x-2',
      title: t('trash.emptyStateTitle'),
      description: t('trash.emptyStateDescription'),
      action: null,
    },
  }[variant];

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Icon name={content.icon} size={40} className="text-muted-foreground/60" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-foreground">{content.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{content.description}</p>
      </div>
      {content.action}
    </div>
  );
};