import { FileText, Search } from 'lucide-react';
import type { OutlineItem } from '../lib/utils';
import type { DocRecord } from '../types';

interface DocsSidebarProps {
  docs: DocRecord[];
  activeId: string;
  query: string;
  outline: OutlineItem[];
  sidebarOpen: boolean;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onClose: () => void;
}

const formatTime = (value: string): string =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const DocsSidebar = ({
  docs,
  activeId,
  query,
  outline,
  sidebarOpen,
  onQueryChange,
  onSelect,
  onAdd,
  onClose,
}: DocsSidebarProps) => {
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? docs.filter((doc) => doc.title.toLowerCase().includes(normalized))
    : docs;

  return (
    <aside
      className={`docs-sidebar ${sidebarOpen ? 'is-open' : ''}`}
      aria-label="Document tabs va muc luc"
    >
      <div className="sidebar-topline">
        <button
          className="back-button"
          type="button"
          aria-label="Dong document tabs"
          onClick={onClose}
        >
          ‹
        </button>
        <span>Document tabs</span>
        <button
          className="add-tab-button"
          type="button"
          aria-label="Tao document moi"
          onClick={onAdd}
        >
          +
        </button>
      </div>
      <label className="search-box">
        <Search aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Tim tai lieu..."
        />
      </label>
      <div className="doc-list">
        {filtered.length ? (
          filtered.map((doc) => (
            <button
              className={`doc-row ${doc.id === activeId ? 'active' : ''}`}
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              type="button"
            >
              <FileText aria-hidden="true" />
              <span>
                <strong>{doc.title}</strong>
                <small>{formatTime(doc.updatedAt)}</small>
              </span>
              <span className="doc-more">⋮</span>
            </button>
          ))
        ) : (
          <p className="empty-docs">Khong tim thay tai lieu.</p>
        )}
      </div>
      <div className="outline-section">
        <div className="outline-label">Outline</div>
        {outline.length ? (
          outline.map((item) => (
            <button className={`outline-row level-${item.level}`} key={item.id} type="button">
              {item.text}
            </button>
          ))
        ) : (
          <p className="outline-empty">Them heading de tao muc luc.</p>
        )}
      </div>
    </aside>
  );
};
