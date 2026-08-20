import type { CollabUser } from '@office/collab-core';
import { useTranslation } from '@office/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from '@office/ui-kit';

interface CollaboratorAvatarStackProps {
  collaborators: CollabUser[];
  followedClientId?: number | null;
  onToggleFollow?: (user: CollabUser) => void;
  className?: string;
}

const MAX_VISIBLE_AVATARS = 4;

export const CollaboratorAvatarStack = ({
  collaborators,
  followedClientId,
  onToggleFollow,
  className,
}: CollaboratorAvatarStackProps) => {
  const { t } = useTranslation('docs');

  if (collaborators.length === 0) {
    return null;
  }

  const visibleCollaborators = collaborators.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCollaborators = collaborators.slice(MAX_VISIBLE_AVATARS);
  const overflowCount = overflowCollaborators.length;

  return (
    <div className={cn('flex items-center -space-x-1.5 shrink-0', className)}>
      {visibleCollaborators.map((user) => {
        const isFollowed = user.clientId === followedClientId;
        const tooltipText = isFollowed
          ? t('collab.clickToUnfollow', { name: user.name })
          : t('collab.clickToFollow', { name: user.name });

        return (
          <Tooltip key={user.clientId ?? user.id}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => onToggleFollow?.(user)}
                  className={cn(
                    'collaborator-avatar-btn relative inline-flex items-center justify-center size-7.5 rounded-full select-none text-white text-xs font-semibold shrink-0 cursor-pointer transition-all hover:z-20 hover:scale-110 shadow-sm border-0 focus:outline-none',
                    isFollowed
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-10 animate-pulse'
                      : 'ring-2 ring-background',
                  )}
                  style={{ backgroundColor: user.color }}
                  aria-label={tooltipText}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{user.initials ?? user.name.slice(0, 2).toUpperCase()}</span>
                  )}
                  {isFollowed && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-primary rounded-full ring-1 ring-background" />
                  )}
                </button>
              }
            />
            <TooltipContent side="bottom">
              <div className="flex flex-col gap-0.5 text-center">
                <span className="font-semibold">{user.name}</span>
                <span className="text-[11px] text-muted-foreground">{tooltipText}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}

      {overflowCount > 0 && (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="relative inline-flex items-center justify-center size-7.5 rounded-full bg-muted text-muted-foreground ring-2 ring-background select-none text-xs font-semibold shrink-0 hover:bg-hover hover:text-foreground transition-all cursor-pointer shadow-sm"
                      aria-label={t('collab.moreUsers', { count: overflowCount })}
                    >
                      <span>+{overflowCount}</span>
                    </button>
                  }
                />
              }
            />
            <TooltipContent side="bottom">
              {t('collab.moreUsers', { count: overflowCount })}
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="end" className="w-56 p-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {t('collab.onlineCollaborators', { count: collaborators.length })}
            </div>
            {overflowCollaborators.map((user) => {
              const isFollowed = user.clientId === followedClientId;
              return (
                <DropdownMenuItem
                  key={user.clientId ?? user.id}
                  onClick={() => onToggleFollow?.(user)}
                  className={cn(
                    'flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer',
                    isFollowed && 'bg-primary/10 text-primary font-medium',
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-3 rounded-full shrink-0"
                      style={{ backgroundColor: user.color }}
                    />
                    <span className="truncate text-sm">{user.name}</span>
                  </div>
                  {isFollowed ? (
                    <Icon name="check" size={14} className="text-primary shrink-0" />
                  ) : (
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {t('collab.clickToFollow', { name: '' }).trim()}
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
