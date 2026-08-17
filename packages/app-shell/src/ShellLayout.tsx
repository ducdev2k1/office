import type { ReactNode } from 'react';

interface ShellLayoutProps {
  children: ReactNode;
}

/** Khung app chung: TopBar + noi dung. Docs/Sheets/Slides cung dung. */
export const ShellLayout = ({ children }: ShellLayoutProps) => (
  <div className="flex h-full min-h-screen flex-col bg-workspace">
    {children}
  </div>
);
