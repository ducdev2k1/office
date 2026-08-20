import { useTranslation } from '@office/i18n';
import { Icon } from '@office/ui-kit';
import type { AccessMode } from '@/modules/collab/hooks/useAccessMode';

interface AccessModeBannerProps {
  mode: AccessMode;
}

export const AccessModeBanner = ({ mode }: AccessModeBannerProps) => {
  const { t } = useTranslation('docs');
  if (mode === 'edit') return null;

  const isView = mode === 'view';
  const message = isView ? t('access.viewWarning') : t('access.commentWarning');

  return (
    <div
      className="pointer-events-none fixed top-20 left-1/2 z-40 -translate-x-1/2"
      role="status"
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-700 shadow-lg backdrop-blur dark:text-amber-400">
        <Icon name={isView ? 'external-link' : 'message-square'} size={14} className="shrink-0" />
        {message}
      </div>
    </div>
  );
};