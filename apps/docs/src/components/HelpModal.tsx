import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@office/ui-kit';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: 'Dinh dang co ban',
    items: [
      ['Ctrl+B', 'In dam'],
      ['Ctrl+I', 'In nghieng'],
      ['Ctrl+Shift+X', 'Gach ngang'],
      ['Ctrl+Shift+5', 'Chi so duoi'],
      ['Ctrl+Shift+6', 'Chi so tren'],
    ],
  },
  {
    title: 'Font chu',
    items: [
      ['Ctrl+Shift+>', 'Tang co chu'],
      ['Ctrl+Shift+<', 'Giam co chu'],
      ['Ctrl+Alt+7', 'Mo bang mau chu'],
      ['Ctrl+Shift+F', 'Focus font picker'],
    ],
  },
  {
    title: 'Tim kiem & dieu huong',
    items: [
      ['Ctrl+H', 'Mo/dong Find & Replace'],
      ['Ctrl+K', 'Chen link'],
      ['Ctrl+Enter', 'Chen page break'],
      ['Ctrl+P', 'In tai lieu'],
    ],
  },
  {
    title: 'Undo/Redo & khac',
    items: [
      ['Ctrl+Z', 'Undo'],
      ['Ctrl+Y / Ctrl+Shift+Z', 'Redo'],
      ['Ctrl+Alt+1/2/3', 'Heading 1/2/3'],
      ['Ctrl+Shift+7/8', 'Bullet/Numbered list'],
      ['Ctrl+`', 'Code block'],
      ['Tab / Shift+Tab', 'Thut / lui list'],
    ],
  },
];

export const HelpModal = ({ open, onClose }: HelpModalProps) => (
  <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Phím tắt bàn phím</DialogTitle>
        <DialogDescription>Danh sách các phím tắt thao tác nhanh trong văn bản</DialogDescription>
      </DialogHeader>
      <div className="help-grid">
        {SHORTCUT_GROUPS.map((group) => (
          <div key={group.title} className="help-group">
            <div className="help-group-title">{group.title}</div>
            {group.items.map(([key, label]) => (
              <div className="help-row" key={key}>
                <kbd>{key}</kbd>
                <span>{label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);