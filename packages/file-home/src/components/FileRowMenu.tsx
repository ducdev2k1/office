import { useTranslation } from '@office/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from '@office/ui-kit';
import type { FileRecord, FileHomeActions, FileTab } from '../types';

interface FileRowMenuProps {
  file: FileRecord;
  tab: FileTab;
  actions: FileHomeActions;
  onRequestRename: () => void;
  onRequestDeleteForever: () => void;
}

/** Menu ⋮ tren moi file, noi dung phu thuoc tab hien tai. */
export const FileRowMenu = ({
  file,
  tab,
  actions,
  onRequestRename,
  onRequestDeleteForever,
}: FileRowMenuProps) => {
  const { t } = useTranslation('appShell');
  const isTrash = tab === 'trash';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={t('fileActions.moreOptions')}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          />
        }
      >
        <Icon name="more-vertical" size={16} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        {isTrash ? (
          <>
            <DropdownMenuItem onSelect={() => actions.onRestore(file.id)}>
              <Icon name="rotate-ccw" size={16} className="mr-2" aria-hidden="true" />
              {t('fileActions.restore')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onSelect={onRequestDeleteForever}>
              <Icon name="x-circle" size={16} className="mr-2" aria-hidden="true" />
              {t('fileActions.deletePermanently')}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onSelect={onRequestRename}>
              <Icon name="pencil" size={16} className="mr-2" aria-hidden="true" />
              {t('fileActions.rename')}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => actions.onDuplicate(file.id)}>
              <Icon name="copy" size={16} className="mr-2" aria-hidden="true" />
              {t('fileActions.duplicate')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => actions.onStar(file.id)}>
              <Icon name="star" size={16} className="mr-2" aria-hidden="true" />
              {file.starred ? t('fileActions.unstar') : t('fileActions.star')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => actions.onTrash(file.id)}>
              <Icon name="trash-2" size={16} className="mr-2" aria-hidden="true" />
              {t('fileActions.moveToTrash')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
