import { useState } from 'react';
import { useTranslation } from '@office/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
  Input,
} from '@office/ui-kit';
import type { DocRecord } from '@/types/docs.types';

interface MoveToFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeDoc: DocRecord | undefined;
  docs: DocRecord[];
  onMoveToFolder: (docId: string, folderId: string | null) => void;
}

const DEFAULT_FOLDERS = [
  { id: 'folder-work', name: 'Công việc & Dự án' },
  { id: 'folder-personal', name: 'Cá nhân' },
  { id: 'folder-reports', name: 'Báo cáo & Thống kê' },
  { id: 'folder-contracts', name: 'Hợp đồng & Văn bản' },
];

export const MoveToFolderDialog = ({
  open,
  onOpenChange,
  activeDoc,
  onMoveToFolder,
}: MoveToFolderDialogProps) => {
  const { t } = useTranslation('docs');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(
    activeDoc?.parentId ?? null,
  );
  const [customFolders, setCustomFolders] = useState<Array<{ id: string; name: string }>>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const allFolders = [...DEFAULT_FOLDERS, ...customFolders];

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
    };
    setCustomFolders((prev) => [...prev, newFolder]);
    setSelectedFolder(newFolder.id);
    setNewFolderName('');
    setCreatingFolder(false);
  };

  const handleSave = () => {
    if (!activeDoc) return;
    onMoveToFolder(activeDoc.id, selectedFolder);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="folder" className="size-5 text-amber-500" />
            Di chuyển tài liệu vào thư mục
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-xs text-muted-foreground">
            Chọn thư mục để sắp xếp tài liệu <strong>{activeDoc?.title}</strong>:
          </p>

          <div className="border border-border rounded-md p-1.5 max-h-56 overflow-y-auto space-y-1 bg-muted/30">
            <button
              type="button"
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-left transition-colors ${selectedFolder === null ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-hover text-foreground'}`}
              onClick={() => setSelectedFolder(null)}
            >
              <Icon name="folder-root" className="size-4 shrink-0" />
              <span>Thư mục gốc (Không thuộc thư mục nào)</span>
            </button>

            {allFolders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-left transition-colors ${selectedFolder === folder.id ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-hover text-foreground'}`}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <Icon name="folder" className="size-4 text-amber-500 shrink-0" />
                <span>{folder.name}</span>
              </button>
            ))}
          </div>

          {creatingFolder ? (
            <div className="flex gap-2 items-center pt-1">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Tên thư mục mới..."
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                autoFocus
              />
              <Button size="sm" className="h-8 text-xs" onClick={handleCreateFolder}>
                Tạo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setCreatingFolder(false)}
              >
                Hủy
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs gap-1.5 border-dashed"
              onClick={() => setCreatingFolder(true)}
            >
              <Icon name="plus" className="size-3.5" />
              Tạo thư mục mới
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            Di chuyển
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
