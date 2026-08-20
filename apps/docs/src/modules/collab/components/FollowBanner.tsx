import type { CollabUser } from '@office/collab-core';
import { useTranslation } from '@office/i18n';
import { Button, Icon, cn } from '@office/ui-kit';

interface FollowBannerProps {
  followedUser: CollabUser | null;
  onStopFollow: () => void;
  className?: string;
}

export const FollowBanner = ({ followedUser, onStopFollow, className }: FollowBannerProps) => {
  const { t } = useTranslation('docs');

  if (!followedUser) return null;

  return (
    <div
      className={cn(
        'follow-banner absolute top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 pl-2.5 pr-1.5 py-1 rounded-full bg-background/90 dark:bg-card/90 backdrop-blur-md border border-border shadow-md transition-all animate-in fade-in slide-in-from-top-2 duration-200 select-none',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex size-2.5">
          <span
            className="animate-ping absolute inline-flex size-full rounded-full opacity-75"
            style={{ backgroundColor: followedUser.color }}
          />
          <span
            className="relative inline-flex rounded-full size-2.5"
            style={{ backgroundColor: followedUser.color }}
          />
        </span>

        <div
          className="size-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
          style={{ backgroundColor: followedUser.color }}
        >
          {followedUser.initials ?? followedUser.name.slice(0, 2).toUpperCase()}
        </div>

        <span className="text-xs font-medium text-foreground max-w-44 truncate">
          {t('collab.following', { name: followedUser.name })}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onStopFollow}
          className="h-6 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-hover rounded-full gap-1"
          aria-label={t('collab.stopFollowing')}
        >
          <span>{t('collab.stopFollowing')}</span>
          <kbd className="hidden sm:inline-block px-1 py-0.5 text-[9px] font-mono font-semibold bg-muted text-muted-foreground rounded border border-border">
            {t('collab.escToStop')}
          </kbd>
          <Icon name="x" size={12} className="ml-0.5" />
        </Button>
      </div>
    </div>
  );
};
