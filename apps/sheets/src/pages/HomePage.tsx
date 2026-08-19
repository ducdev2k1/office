import { useSheets } from '@/hooks/useSheets';
import { useTheme } from '@/hooks/useTheme';
import { ShellLayout, TopBar, type ProductIdentity } from '@office/app-shell';
import { estimateStorageMB, FileHome, type ProductConfig } from '@office/file-home';
import { useTranslation } from '@office/i18n';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const sheetsProduct: ProductIdentity = {
  kind: 'sheets',
  name: 'Bảng tính',
  accentVar: 'var(--o-kind-sheets)',
};

/** Trang home: Quản lý danh sách bảng tính Sheets. */
export const HomePage = () => {
  const { t } = useTranslation('appShell');
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [storageMB, setStorageMB] = useState<number | undefined>(undefined);
  const navigate = useNavigate();
  const sheetsApi = useSheets();

  const sheetsConfig = useMemo<ProductConfig>(
    () => ({
      kind: 'sheets',
      name: 'Bảng tính',
      createLabel: 'Tạo bảng tính mới',
      startLabel: 'Bắt đầu bảng tính mới',
      blankLabel: 'Bảng tính trống',
      openFromDeviceLabel: 'Mở từ máy (.xlsx)',
      acceptExtension: '.xlsx',
      editorPath: (id) => `/edit/${id}`,
      accentVar: 'var(--o-kind-sheets)',
      templates: [
        { id: 'blank', label: 'Bảng tính trống' },
        { id: 'budget', label: 'Ngân sách thu chi' },
        { id: 'schedule', label: 'Kế hoạch tuần' },
      ],
    }),
    [],
  );

  useEffect(() => {
    void estimateStorageMB().then(setStorageMB);
  }, [sheetsApi.files]);

  return (
    <ShellLayout>
      <TopBar
        product={sheetsProduct}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <FileHome
        config={sheetsConfig}
        files={sheetsApi.files}
        query={searchQuery}
        storageMB={storageMB}
        loading={sheetsApi.loading}
        actions={{
          onCreate: () => {
            const id = sheetsApi.addSheet();
            navigate(`/edit/${id}`);
          },
          onOpenFromDevice: async (file) => {
            try {
              const id = await sheetsApi.importFile(file);
              navigate(`/edit/${id}`);
            } catch {
              window.alert('Không mở được file. Vui lòng chọn file .xlsx hợp lệ.');
            }
          },
          onOpen: (id) => {
            sheetsApi.markOpened(id);
            navigate(`/edit/${id}`);
          },
          onStar: sheetsApi.star,
          onRename: sheetsApi.rename,
          onDuplicate: sheetsApi.duplicate,
          onTrash: sheetsApi.trash,
          onRestore: sheetsApi.restore,
          onDeleteForever: sheetsApi.deleteForever,
        }}
        onClearQuery={() => setSearchQuery('')}
      />
    </ShellLayout>
  );
};

export default HomePage;
