import {
  ChevronDown,
  Cloud,
  FileText,
  FolderClosed,
  History,
  Menu,
  MessageSquare,
  Share2,
  Star,
  Video,
} from 'lucide-react';
import { MenuBar, type HeaderMenuActions } from './header/MenuBar';

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onMenuToggle: () => void;
  menuActions: HeaderMenuActions;
}

export const Header = ({ title, onTitleChange, onMenuToggle, menuActions }: HeaderProps) => (
  <header className="top-header">
    <div className="file-heading">
      <button
        className="mobile-menu-button"
        type="button"
        aria-label="Mo document tabs"
        onClick={onMenuToggle}
      >
        <Menu aria-hidden="true" />
      </button>
      <div className="docs-file-icon">
        <FileText aria-hidden="true" />
      </div>
      <div className="file-heading-copy">
        <div className="title-line">
          <input
            aria-label="Tieu de tai lieu"
            className="title-input"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
          />
          <button
            className="plain-icon-button"
            type="button"
            aria-label="Danh dau yeu thich"
            title="Danh dau yeu thich"
          >
            <Star aria-hidden="true" />
          </button>
          <button
            className="plain-icon-button"
            type="button"
            aria-label="Di chuyen tai lieu"
            title="Di chuyen tai lieu"
          >
            <FolderClosed aria-hidden="true" />
          </button>
          <span className="cloud-state" title="Da luu tren thiet bi">
            <Cloud aria-hidden="true" />
          </span>
        </div>
        <MenuBar {...menuActions} />
      </div>
    </div>
    <div className="header-actions">
      <button
        className="header-icon-button"
        type="button"
        aria-label="Lich su phien ban"
        title="Lich su phien ban"
      >
        <History aria-hidden="true" />
      </button>
      <button
        className="header-icon-button"
        type="button"
        aria-label="Mo binh luan"
        title="Mo binh luan"
      >
        <MessageSquare aria-hidden="true" />
      </button>
      <button className="header-icon-button" type="button" aria-label="Hop video" title="Hop video">
        <Video aria-hidden="true" />
        <ChevronDown aria-hidden="true" className="tiny-chevron" />
      </button>
      <button className="share-button" type="button">
        <Share2 aria-hidden="true" /> Chia se <ChevronDown aria-hidden="true" />
      </button>
      <div className="avatar" aria-label="Tai khoan Duc">
        D
      </div>
    </div>
  </header>
);
