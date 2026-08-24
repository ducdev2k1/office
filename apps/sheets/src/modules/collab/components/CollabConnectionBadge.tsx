import type { CollabStatus } from '@office/collab-core';
import { useTranslation } from '@office/i18n';
import { cn, Tooltip, TooltipContent, TooltipTrigger } from '@office/ui-kit';

interface CollabConnectionBadgeProps {
  status: CollabStatus;
  className?: string;
}

export const CollabConnectionBadge = ({ status, className }: CollabConnectionBadgeProps) => {
  const { t } = useTranslation('sheets');

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          dotClass: 'bg-emerald-500 ring-2 ring-emerald-500/20',
          label: t('collab.connected'),
        };
      case 'connecting':
        return {
          dotClass: 'bg-amber-500 ring-2 ring-amber-500/20 animate-pulse',
          label: t('collab.connecting'),
        };
      case 'disconnected':
      default:
        return {
          dotClass: 'bg-zinc-400 ring-2 ring-zinc-400/20',
          label: t('collab.offline'),
        };
    }
  };

  const { dotClass, label } = getStatusConfig();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              'inline-flex items-center justify-center size-6 rounded-full shrink-0 cursor-default',
              className,
            )}
            aria-label={label}
          >
            <span className={cn('size-2.5 rounded-full transition-all duration-300', dotClass)} />
          </span>
        }
      />
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
};
