import { useSlides } from '@/hooks/useSlides';
import { useTheme } from '@/hooks/useTheme';
import { ShellLayout, TopBar, type ProductIdentity } from '@office/app-shell';
import { estimateStorageMB, FileHome, type ProductConfig } from '@office/file-home';
import { useTranslation } from '@office/i18n';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Trang chủ: Quản lý danh sách các bài trình chiếu Slides. */
export const HomePage = () => {
  const { t } = useTranslation('slides');
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [storageMB, setStorageMB] = useState<number | undefined>(undefined);
  const navigate = useNavigate();
  const slidesApi = useSlides();

  const slidesProduct = useMemo<ProductIdentity>(
    () => ({
      kind: 'slides',
      name: t('title'),
      accentVar: 'var(--o-kind-slides)',
    }),
    [t],
  );

  const slidesConfig = useMemo<ProductConfig>(
    () => ({
      kind: 'slides',
      name: t('title'),
      createLabel: t('home.createLabel'),
      startLabel: t('home.startLabel'),
      blankLabel: t('home.blankLabel'),
      openFromDeviceLabel: t('openPptx'),
      acceptExtension: '.pptx',
      editorPath: (id) => `/edit/${id}`,
      accentVar: 'var(--o-kind-slides)',
      templates: [
        { id: 'blank', label: t('home.templates.blank') },
        { id: 'business', label: t('home.templates.business') },
        { id: 'pitch', label: t('home.templates.pitch') },
      ],
    }),
    [t],
  );

  useEffect(() => {
    void estimateStorageMB().then(setStorageMB);
  }, [slidesApi.files]);

  return (
    <ShellLayout>
      <TopBar
        product={slidesProduct}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <FileHome
        config={slidesConfig}
        files={slidesApi.files}
        query={searchQuery}
        storageMB={storageMB}
        loading={slidesApi.loading}
        actions={{
          onCreate: () => {
            const id = slidesApi.addDeck();
            navigate(`/edit/${id}`);
          },
          onOpenFromDevice: async (file) => {
            try {
              const id = await slidesApi.importFile(file);
              navigate(`/edit/${id}`);
            } catch {
              window.alert(t('openError'));
            }
          },
          onOpen: (id) => {
            slidesApi.markOpened(id);
            navigate(`/edit/${id}`);
          },
          onStar: slidesApi.star,
          onRename: slidesApi.rename,
          onDuplicate: slidesApi.duplicate,
          onTrash: slidesApi.trash,
          onRestore: slidesApi.restore,
          onDeleteForever: slidesApi.deleteForever,
        }}
        onClearQuery={() => setSearchQuery('')}
      />
    </ShellLayout>
  );
};

export default HomePage;
