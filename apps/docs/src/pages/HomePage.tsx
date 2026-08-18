import { ShellLayout, TopBar, type ProductIdentity } from '@office/app-shell';
import { FileHome, estimateStorageMB, type ProductConfig } from '@office/file-home';
import { useTranslation } from '@office/i18n';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocs } from '@/hooks/use-docs';
import { useTheme } from '@/hooks/use-theme';

const docsProduct: ProductIdentity = {
  kind: 'docs',
  name: 'Docs',
  accentVar: 'var(--o-kind-docs)',
};

/** Trang home: quan ly file Docs (tai dung cho Sheets/Slides qua ProductConfig). */
export const HomePage = () => {
  const { t } = useTranslation('appShell');
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [storageMB, setStorageMB] = useState<number | undefined>(undefined);
  const navigate = useNavigate();
  const docsApi = useDocs();

  const docsConfig = useMemo<ProductConfig>(
    () => ({
      kind: 'docs',
      name: 'Docs',
      createLabel: t('home.createNew'),
      startLabel: t('home.templatesTitle'),
      blankLabel: t('home.blankDoc'),
      editorPath: (id) => `/edit/${id}`,
      accentVar: 'var(--o-kind-docs)',
      templates: [],
    }),
    [t],
  );

  useEffect(() => {
    void estimateStorageMB().then(setStorageMB);
  }, [docsApi.files]);

  return (
    <ShellLayout>
      <TopBar
        product={docsProduct}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <FileHome
        config={docsConfig}
        files={docsApi.files}
        query={searchQuery}
        storageMB={storageMB}
        loading={docsApi.loading}
        actions={{
          onCreate: () => {
            const id = docsApi.addDoc();
            navigate(`/edit/${id}`);
          },
          onOpen: (id) => {
            docsApi.markOpened(id);
            navigate(`/edit/${id}`);
          },
          onStar: docsApi.star,
          onRename: docsApi.rename,
          onDuplicate: docsApi.duplicate,
          onTrash: docsApi.trash,
          onRestore: docsApi.restore,
          onDeleteForever: docsApi.deleteForever,
        }}
        onClearQuery={() => setSearchQuery('')}
      />
    </ShellLayout>
  );
};
