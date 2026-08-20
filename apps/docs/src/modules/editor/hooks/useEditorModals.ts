import { useEffect, useState } from 'react';
import type { ContextMenuPosition } from '@/modules/editor/types/editor.types';

export const useEditorModals = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('docs-sidebar-open');
    return saved !== null ? saved === 'true' : true;
  });
  const [findOpen, setFindOpen] = useState(false);
  const [docSettingsOpen, setDocSettingsOpen] = useState(false);
  const [docSettingsTab, setDocSettingsTab] = useState<'document' | 'headerFooter'>('headerFooter');
  const [activeBand, setActiveBand] = useState<'header' | 'footer'>('header');
  const [helpOpen, setHelpOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const handleOpenHf = (event: Event) => {
      const customEvent = event as CustomEvent<{ band?: 'header' | 'footer' }>;
      if (customEvent.detail?.band) {
        setActiveBand(customEvent.detail.band);
      }
      setDocSettingsTab('headerFooter');
      setDocSettingsOpen(true);
    };

    window.addEventListener('doc-open-hf-panel', handleOpenHf);
    return () => {
      window.removeEventListener('doc-open-hf-panel', handleOpenHf);
    };
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('docs-sidebar-open', String(next));
      return next;
    });
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    localStorage.setItem('docs-sidebar-open', 'false');
  };

  const openPageSetup = () => {
    setDocSettingsTab('document');
    setDocSettingsOpen(true);
  };

  const openHeaderFooter = () => {
    setDocSettingsTab('headerFooter');
    setDocSettingsOpen(true);
  };

  const toggleFind = () => setFindOpen((prev) => !prev);
  const closeAllModals = () => {
    setFindOpen(false);
    setDocSettingsOpen(false);
    setHelpOpen(false);
  };

  return {
    sidebarOpen,
    findOpen,
    docSettingsOpen,
    docSettingsTab,
    activeBand,
    helpOpen,
    contextMenu,
    versionHistoryOpen,
    shareOpen,
    setFindOpen,
    setDocSettingsOpen,
    setDocSettingsTab,
    setActiveBand,
    setHelpOpen,
    setContextMenu,
    setVersionHistoryOpen,
    setShareOpen,
    handleToggleSidebar,
    handleCloseSidebar,
    openPageSetup,
    openHeaderFooter,
    toggleFind,
    closeAllModals,
  };
};
