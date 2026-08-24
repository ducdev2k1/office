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
  const { t } = useTranslation('sheets');

  if (collaborators.length === 0) {
    return null;
  }

  const visibleCollaborators = collaborators.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCollaborators = collaborators.slice(MAX_VISIBLE_AVATARS);
  const overflowCount = overflowCollaborators.length;

  return (
    <div className={cn('flex items-center -space-x-1.5 shrink-0', className)}>
      {visibleCollaborators.map((user) => {
        const tooltipText = user.name;

        return (
          <Tooltip key={user.clientId ?? user.id}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    'relative inline-flex items-center justify-center size-7 rounded-full select-none text-white text-xs font-semibold shrink-0 cursor-default transition-all shadow-xs ring-2 ring-background focus:outline-hidden',
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
                </button>
              }
            />
            <TooltipContent side="bottom">
              <div className="flex flex-col gap-0.5 text-center">
                <span className="font-semibold">{user.name}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}

      {overflowCount > 0 && (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="relative inline-flex items-center justify-center size-7 rounded-full bg-muted text-muted-foreground ring-2 ring-background select-none text-xs font-semibold shrink-0 hover:bg-muted/80 hover:text-foreground transition-all cursor-pointer shadow-xs"
                    aria-label={t('collab.moreUsers', { count: overflowCount })}
                  >
                    <span>+{overflowCount}</span>
                  </button>
                }
              />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t('collab.moreUsers', { count: overflowCount })}
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="end" className="w-52 p-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {t('collab.onlineCollaborators', { count: collaborators.length })}
            </div>
            {overflowCollaborators.map((user) => (
              <DropdownMenuItem
                key={user.clientId ?? user.id}
                className="flex items-center gap-2 px-2 py-1.5"
              >
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: user.color }}
                />
                <span className="truncate text-xs">{user.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
