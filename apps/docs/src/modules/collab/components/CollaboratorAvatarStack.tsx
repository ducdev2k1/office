import type { CollabUser } from '@office/collab-core';
import { useTranslation } from '@office/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from '@office/ui-kit';

interface CollaboratorAvatarStackProps {
  collaborators: CollabUser[];
  className?: string;
}

const MAX_VISIBLE_AVATARS = 4;

export const CollaboratorAvatarStack = ({
  collaborators,
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
      {visibleCollaborators.map((user) => (
        <Tooltip key={user.clientId ?? user.id}>
          <TooltipTrigger
            render={
              <div
                className="relative inline-flex items-center justify-center size-7.5 rounded-full ring-2 ring-background select-none text-white text-xs font-semibold shrink-0 cursor-default transition-transform hover:z-10 hover:scale-110 shadow-sm"
                style={{ backgroundColor: user.color }}
                aria-label={user.name}
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
              </div>
            }
          />
          <TooltipContent side="bottom">
            <span>{user.name}</span>
          </TooltipContent>
        </Tooltip>
      ))}

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

          <DropdownMenuContent align="end" className="w-52 p-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {t('collab.onlineCollaborators', { count: collaborators.length })}
            </div>
            {overflowCollaborators.map((user) => (
              <DropdownMenuItem key={user.id} className="flex items-center gap-2 px-2 py-1.5">
                <span
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: user.color }}
                />
                <span className="truncate text-sm">{user.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
