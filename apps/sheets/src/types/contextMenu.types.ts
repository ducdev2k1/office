export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  active?: boolean;
  dividerAfter?: boolean;
  subitems?: ContextMenuItem[];
  onClick?: () => void;
}
