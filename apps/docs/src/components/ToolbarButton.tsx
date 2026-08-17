import type { ReactNode } from 'react';

interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  label: string;
  tone?: 'default' | 'danger';
  children: ReactNode;
  onClick: () => void;
}

export const ToolbarButton = ({
  active = false,
  disabled = false,
  label,
  tone = 'default',
  children,
  onClick,
}: ToolbarButtonProps) => (
  <button
    aria-label={label}
    className={`tool-button ${active ? 'active' : ''} ${tone === 'danger' ? 'danger' : ''}`}
    disabled={disabled}
    onClick={onClick}
    title={label}
    type="button"
  >
    {children}
  </button>
);
