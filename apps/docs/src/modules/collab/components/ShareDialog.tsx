import { useState } from 'react';
import { useTranslation } from '@office/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
  Input,
  Skeleton,
  cn,
} from '@office/ui-kit';
import { useDocPermissions } from '@/hooks/useDocPermissions';
import { addGrant, removeGrant, updateGrantRole } from '@/services/docGrants.service';
import type { DocRole } from '@/types/permissions.types';

const ROLE_ORDER: readonly DocRole[] = ['viewer', 'commenter', 'editor', 'owner'];

const ROLE_LABEL_KEY: Record<DocRole, string> = {
  viewer: 'view',
  commenter: 'comment',
  editor: 'edit',
  owner: 'owner',
};

const ROLE_URL_PARAM: Record<DocRole, string> = {
  viewer: 'view',
  commenter: 'comment',
  editor: 'edit',
  owner: 'edit',
};

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  docId: string;
  currentUserId?: string;
}

export const ShareDialog = ({ open, onClose, docId, currentUserId }: ShareDialogProps) => {
  const { t } = useTranslation('docs');
  const { t: tCommon } = useTranslation('common');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { grants, myRole, can } = useDocPermissions(open ? docId : null, currentUserId);

  const canManage = can('share');

  const shareUrl = () => {
    const roleParam = myRole ? ROLE_URL_PARAM[myRole] : 'view';
    const base = window.location.origin + window.location.pathname.replace(/\/edit\/.*$/, '');
    return `${base}/edit/${docId}?access=${roleParam}`;
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
    if (!trimmed || !canManage) return;
    const name = trimmed.includes('@') ? trimmed.split('@')[0]! : trimmed;
    const userId = trimmed.includes('@') ? trimmed : `user-${crypto.randomUUID()}`;
    setError(null);
    void addGrant(docId, { userId, userName: name, role: 'viewer' })
      .then(() => setEmail(''))
      .catch(() => setError(t('share.ownerOnlyNote')));
  };

  const handleRoleChange = (grantId: string, nextRole: DocRole) => {
    if (!canManage) return;
    setError(null);
    void updateGrantRole(docId, grantId, nextRole).catch(() =>
      setError(t('share.ownerOnlyNote')),
    );
  };

  const handleRemove = (grantId: string) => {
    if (!canManage) return;
    setError(null);
    void removeGrant(docId, grantId).catch(() => setError(t('share.ownerOnlyNote')));
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
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {t('share.linkLabel')}
            </label>
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
          {canManage ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t('share.addPeople')}
              </label>
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
          ) : (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              {t('share.ownerOnlyNote')}
            </p>
          )}
          <div>
            <ul className="space-y-1.5">
              {grants.map((grant) => {
                const isMine = grant.userId === currentUserId;
                return (
                  <li
                    key={grant.id}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {grant.userName.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {grant.userName}
                      {isMine && (
                        <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {t('share.you')}
                        </span>
                      )}
                    </span>
                    {canManage ? (
                      <>
                        <div className="flex gap-1 rounded-md bg-muted/60 p-0.5">
                          {ROLE_ORDER.map((role) => (
                            <Button
                              key={role}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={cn(
                                'px-1.5 py-0.5 text-[10px] font-medium h-auto',
                                grant.role === role
                                  ? 'bg-background text-foreground shadow-sm font-semibold'
                                  : 'text-muted-foreground hover:text-foreground',
                              )}
                              onClick={() => handleRoleChange(grant.id, role)}
                            >
                              {t(`share.roles.${ROLE_LABEL_KEY[role]}`)}
                            </Button>
                          ))}
                        </div>
                        {grant.role !== 'owner' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t('share.remove')}
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemove(grant.id)}
                          >
                            <Icon name="trash" size={14} />
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {t(`share.roles.${ROLE_LABEL_KEY[grant.role]}`)}
                      </span>
                    )}
                  </li>
                );
              })}
              {grants.length === 0 && (
                <>
                  <Skeleton className="h-11 w-full" />
                  <Skeleton className="h-11 w-full" />
                </>
              )}
            </ul>
          </div>
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}
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
