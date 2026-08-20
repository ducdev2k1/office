import { COLLAB_PALETTE_COLORS, type CollabUser } from '@office/collab-core';
import { useTranslation } from '@office/i18n';
import {
  Button,
  Icon,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from '@office/ui-kit';
import { useState, type FormEvent } from 'react';

interface CollabUserProfilePopoverProps {
  user: CollabUser;
  onUpdateProfile: (partial: Partial<CollabUser>) => void;
  className?: string;
}

export const CollabUserProfilePopover = ({
  user,
  onUpdateProfile,
  className,
}: CollabUserProfilePopoverProps) => {
  const { t } = useTranslation('docs');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [selectedColor, setSelectedColor] = useState(user.color);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setName(user.name);
      setSelectedColor(user.color);
    }
    setOpen(nextOpen);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || user.name,
      color: selectedColor,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <PopoverTrigger
            render={
              <button
                type="button"
                className={cn(
                  'relative inline-flex items-center justify-center size-8 rounded-full select-none text-white text-xs font-semibold shrink-0 ring-2 ring-background hover:scale-105 transition-transform cursor-pointer shadow-sm',
                  className,
                )}
                style={{ backgroundColor: user.color }}
                aria-label={t('collab.editProfile')}
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
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>{`${user.name} (${t('collab.you')})`}</span>
        </TooltipContent>
      </Tooltip>

      <PopoverContent align="end" className="w-72 p-4 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Icon name="user" size={16} /> {t('collab.editProfile')}
          </h4>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('collab.yourName')}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên..."
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('collab.cursorColor')}
            </label>
            <div className="grid grid-cols-6 gap-2">
              {COLLAB_PALETTE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'size-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center cursor-pointer',
                    selectedColor === color && 'ring-2 ring-primary ring-offset-2',
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                >
                  {selectedColor === color && (
                    <Icon name="check" size={14} className="text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" size="sm" variant="default">
              {t('collab.save')}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};
