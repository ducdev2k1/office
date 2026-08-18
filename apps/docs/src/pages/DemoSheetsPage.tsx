import { ShellLayout, TopBar, type ProductIdentity } from '@office/app-shell';
import { FileHome, type FileRecord, type ProductConfig } from '@office/file-home';
import { useTranslation } from '@office/i18n';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

const sheetsProduct: ProductIdentity = {
  kind: 'sheets',
  name: 'Sheets',
  accentVar: 'var(--o-kind-sheets)',
};

const fakeFiles: FileRecord[] = [
  {
    id: 'sheet-1',
    kind: 'sheets',
    title: 'Ngân sách tháng 8',
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-17T09:30:00.000Z',
    lastOpenedAt: '2026-08-17T09:30:00.000Z',
    starred: true,
    deletedAt: null,
  },
  {
    id: 'sheet-2',
    kind: 'sheets',
    title: 'Lịch team hàng tuần',
    createdAt: '2026-07-20T02:00:00.000Z',
    updatedAt: '2026-08-10T07:00:00.000Z',
    lastOpenedAt: '2026-08-11T01:00:00.000Z',
    starred: false,
    deletedAt: null,
  },
  {
    id: 'sheet-3',
    kind: 'sheets',
    title: 'Theo dõi khách hàng Q3',
    createdAt: '2026-08-05T03:00:00.000Z',
    updatedAt: '2026-08-16T05:00:00.000Z',
    lastOpenedAt: '2026-08-16T05:00:00.000Z',
    starred: false,
    deletedAt: null,
  },
];

/** Demo tái dùng FileHome cho Sheets (dev-only) — minh họa ProductConfig, không sửa FileHome. */
export const DemoSheetsPage = () => {
  const { t } = useTranslation('appShell');
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const sheetsConfig = useMemo<ProductConfig>(
    () => ({
      kind: 'sheets',
      name: 'Sheets',
      createLabel: 'Tạo bảng tính mới',
      startLabel: 'Bắt đầu bảng tính mới',
      blankLabel: 'Bảng tính trống',
      editorPath: (id) => `/demo/sheets/${id}`,
      accentVar: 'var(--o-kind-sheets)',
      templates: [
        { id: 'blank', label: 'Bảng tính trống' },
        { id: 'budget', label: 'Ngân sách hộ gia đình' },
        { id: 'schedule', label: 'Lịch tuần' },
      ],
    }),
    [],
  );

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
        files={fakeFiles}
        query={searchQuery}
        actions={{
          onCreate: () => {
            const id = `sheet-${crypto.randomUUID()}`;
            navigate(sheetsConfig.editorPath(id));
          },
          onOpen: (id) => navigate(sheetsConfig.editorPath(id)),
          onStar: () => {},
          onRename: () => {},
          onDuplicate: () => {},
          onTrash: () => {},
          onRestore: () => {},
          onDeleteForever: () => {},
        }}
        onClearQuery={() => setSearchQuery('')}
      />
    </ShellLayout>
  );
};

export default DemoSheetsPage;
