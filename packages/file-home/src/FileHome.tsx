import { useEffect, useState } from 'react';
import type { FileHomeActions, FileRecord, FileSort, FileTab, FileView, ProductConfig } from './types';
import { TemplateStrip } from './components/TemplateStrip';
import { StatsCards } from './components/StatsCards';
import { FileTabs } from './components/FileTabs';
import { FileToolbar } from './components/FileToolbar';
import { FileList } from './components/FileList';
import { FileGrid } from './components/FileGrid';
import { EmptyStates } from './components/EmptyStates';

interface FileHomeProps {
  config: ProductConfig;
  files: FileRecord[];
  query?: string;
  storageMB?: number;
  loading?: boolean;
  actions: FileHomeActions;
  onClearQuery?: () => void;
}

const VIEW_KEY = 'office-file-home-view';
const SORT_KEY = 'office-file-home-sort';

const readPref = <T,>(key: string, fallback: T, valid: readonly T[]): T => {
  try {
    const value = localStorage.getItem(key) as T | null;
    return value !== null && valid.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

const sortFiles = (files: FileRecord[], sort: FileSort): FileRecord[] => {
  const sorted = [...files];
  if (sort === 'name') {
    sorted.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
  } else if (sort === 'updated') {
    sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } else {
    sorted.sort((a, b) => b.lastOpenedAt.localeCompare(a.lastOpenedAt));
  }
  return sorted;
};

/** Trang home quan ly file — kind-agnostic, Sheets/Slides truyen ProductConfig khac. */
export const FileHome = ({
  config,
  files,
  query = '',
  storageMB,
  loading = false,
  actions,
  onClearQuery,
}: FileHomeProps) => {
  const [tab, setTab] = useState<FileTab>('recent');
  const [view, setView] = useState<FileView>(() =>
    readPref(VIEW_KEY, 'list', ['list', 'grid']),
  );
  const [sort, setSort] = useState<FileSort>(() =>
    readPref(SORT_KEY, 'lastOpened', ['lastOpened', 'updated', 'name']),
  );

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);
  useEffect(() => {
    localStorage.setItem(SORT_KEY, sort);
  }, [sort]);

  const trimmedQuery = query.trim().toLowerCase();
  const base = files.filter((file) => {
    if (tab === 'trash') return !!file.deletedAt;
    if (file.deletedAt) return false;
    return tab === 'starred' ? file.starred : true;
  });
  const filtered = trimmedQuery
    ? base.filter((file) => file.title.toLowerCase().includes(trimmedQuery))
    : base;
  const sorted = sortFiles(filtered, sort);

  const showNoResults = base.length > 0 && filtered.length === 0;
  const showEmptyTrash = tab === 'trash' && base.length === 0;
  const showNoFiles = base.length === 0 && tab !== 'trash';

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <TemplateStrip config={config} onCreate={actions.onCreate} />
        <StatsCards files={files} storageMB={storageMB} />
        <div className="mt-4 flex items-end justify-between px-6">
          <FileTabs files={files} active={tab} accentVar={config.accentVar} onChange={setTab} />
          <FileToolbar sort={sort} view={view} onSortChange={setSort} onViewChange={setView} />
        </div>
        <div className="px-6 pb-10">
          {loading ? (
            <div className="flex flex-col gap-3 py-4" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-md bg-muted"
                />
              ))}
            </div>
          ) : showNoResults ? (
            <EmptyStates variant="no-results" onClearQuery={onClearQuery} />
          ) : showEmptyTrash ? (
            <EmptyStates variant="empty-trash" />
          ) : showNoFiles ? (
            <EmptyStates variant="no-files" onCreate={actions.onCreate} />
          ) : view === 'grid' ? (
            <FileGrid files={sorted} accentVar={config.accentVar} tab={tab} actions={actions} />
          ) : (
            <FileList files={sorted} accentVar={config.accentVar} tab={tab} actions={actions} />
          )}
        </div>
      </div>
    </main>
  );
};