import { useState } from 'react';
import { useTranslation } from '@office/i18n';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Icon, Input, cn } from '@office/ui-kit';

type AccessRole = 'view' | 'comment' | 'edit';

const ROLE_LABELS: Record<AccessRole, string> = {
  view: 'view',
  comment: 'comment',
  edit: 'edit',
};

interface SharedUser {
  id: string;
  name: string;
  role: AccessRole;
}

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  docId: string;
}

const MOCK_USERS: SharedUser[] = [
  { id: 'user-nguyen-van-a', name: 'Nguyễn Văn A', role: 'edit' },
  { id: 'user-tran-thi-b', name: 'Trần Thị B', role: 'comment' },
  { id: 'user-le-van-c', name: 'Lê Văn C', role: 'view' },
];

export const ShareDialog = ({ open, onClose, docId }: ShareDialogProps) => {
  const { t } = useTranslation('docs');
  const { t: tCommon } = useTranslation('common');
  const [role, setRole] = useState<AccessRole>('edit');
  const [copied, setCopied] = useState(false);
  const [users, setUsers] = useState<SharedUser[]>(MOCK_USERS);
  const [email, setEmail] = useState('');

  const shareUrl = () => {
    const base = window.location.origin + window.location.pathname.replace(/\/edit\/.*$/, '');
    return `${base}/edit/${docId}?access=${role}`;
  };

  const handleCopy = async () => {
    const url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert(url);
    }
  };

  const handleAddUser = () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    const name = trimmed.includes('@') ? trimmed.split('@')[0]! : trimmed;
    setUsers((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, name, role: 'view' },
    ]);
    setEmail('');
  };

  const handleRoleChange = (userId: string, nextRole: AccessRole) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: nextRole } : user)));
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('share.title')}</DialogTitle>
          <DialogDescription>{t('share.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t('share.accessLabel')}</label>
            <div className="flex gap-1 rounded-lg bg-muted/60 p-1">
              {(['view', 'comment', 'edit'] as AccessRole[]).map((r) => (
                <Button
                  key={r}
                  type="button"
                  variant="ghost"
                  className={cn(
                    'flex-1 rounded-md px-2 py-1.5 text-xs font-medium',
                    role === r ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => setRole(r)}
                >
                  {t(`share.roles.${ROLE_LABELS[r]}`)}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t('share.linkLabel')}</label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl()}
                className="min-w-0 flex-1 text-xs text-muted-foreground"
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button size="sm" variant="outline" onClick={() => void handleCopy()}>
                <Icon name={copied ? 'check' : 'copy'} size={14} />
                {copied ? t('share.copied') : t('share.copy')}
              </Button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t('share.addPeople')}</label>
            <div className="flex gap-2">
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleAddUser()}
                placeholder={t('share.emailPlaceholder')}
                className="min-w-0 flex-1 text-sm"
              />
              <Button
                size="sm"
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs px-3.5 cursor-pointer shadow-xs"
                onClick={handleAddUser}
              >
                {t('share.add')}
              </Button>
            </div>
          </div>
          <div>
            <ul className="space-y-1.5">
              {users.map((user) => (
                <li key={user.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                  <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {user.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{user.name}</span>
                  <div className="flex gap-1 rounded-md bg-muted/60 p-0.5">
                    {(['view', 'comment', 'edit'] as AccessRole[]).map((r) => (
                      <Button
                        key={r}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'px-1.5 py-0.5 text-[10px] font-medium h-auto',
                          user.role === r ? 'bg-background text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground',
                        )}
                        onClick={() => handleRoleChange(user.id, r)}
                      >
                        {t(`share.roles.${ROLE_LABELS[r]}`)}
                      </Button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            {t('share.backendNote')}
          </p>
        </div>
        <DialogFooter className="border-t border-border/60 pt-4 mt-2 flex items-center justify-end">
          <Button
            size="default"
            variant="outline"
            className="px-4 text-xs font-medium border-border/80 bg-background text-foreground/80 hover:bg-muted hover:text-foreground cursor-pointer"
            onClick={onClose}
          >
            {tCommon('actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};