import type { ContextMenuItem, ContextMenuPosition } from '@/types/contextMenu.types';
import { cn, Icon } from '@office/ui-kit';
import { useLayoutEffect, useRef, useState } from 'react';

export interface SheetContextMenuProps {
  position: ContextMenuPosition | null;
  items: ContextMenuItem[];
  activeSubmenuId: string | null;
  onSetActiveSubmenuId: (id: string | null) => void;
  onClose: () => void;
}

export const SheetContextMenu = ({ position, items, onClose }: SheetContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenuId, setActiveSubmenuId] = useState<string | null>(null);
  const [coords, setCoords] = useState<ContextMenuPosition>(() => {
    const pad = 12;
    const width = 240;
    const height = 400;
    let x = position?.x ?? 0;
    let y = position?.y ?? 0;
    if (typeof window !== 'undefined') {
      if (x + width > window.innerWidth - pad) {
        x = Math.max(pad, window.innerWidth - width - pad);
      }
      if (y + height > window.innerHeight - pad) {
        y = Math.max(pad, window.innerHeight - height - pad);
      }
    }
    return { x, y };
  });

  useLayoutEffect(() => {
    if (!position) return;
    const el = menuRef.current;
    const width = el?.offsetWidth ?? 240;
    const height = el?.offsetHeight ?? 400;
    const pad = 12;

    let x = position.x;
    let y = position.y;

    if (x + width > window.innerWidth - pad) {
      x = Math.max(pad, window.innerWidth - width - pad);
    }
    if (y + height > window.innerHeight - pad) {
      y = Math.max(pad, window.innerHeight - height - pad);
    }
    setCoords({ x, y });
  }, [position]);

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      data-sheet-context-menu="true"
      className="fixed z-50 select-none"
      style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="w-56 overflow-hidden rounded-lg border border-gray-200 bg-white p-1 text-gray-800 shadow-xl shadow-black/10 animate-in fade-in-0 duration-75">
        {items.map((item) => (
          <MenuItemRow
            key={item.id}
            item={item}
            isActiveSubmenu={activeSubmenuId === item.id}
            onOpenSubmenu={() => setActiveSubmenuId(item.id)}
            onCloseSubmenu={() => setActiveSubmenuId(null)}
            onCloseMenu={onClose}
          />
        ))}
      </div>
    </div>
  );
};

interface MenuItemRowProps {
  item: ContextMenuItem;
  isActiveSubmenu: boolean;
  onOpenSubmenu: () => void;
  onCloseSubmenu: () => void;
  onCloseMenu: () => void;
}

const MenuItemRow = ({
  item,
  isActiveSubmenu,
  onOpenSubmenu,
  onCloseSubmenu,
  onCloseMenu,
}: MenuItemRowProps) => {
  const itemRef = useRef<HTMLButtonElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const [submenuCoords, setSubmenuCoords] = useState<ContextMenuPosition | null>(null);

  useLayoutEffect(() => {
    if (!isActiveSubmenu || !itemRef.current) {
      setSubmenuCoords(null);
      return;
    }
    const rect = itemRef.current.getBoundingClientRect();
    const subWidth = 200;
    const pad = 12;

    let subX = rect.right + 2;
    if (subX + subWidth > window.innerWidth - pad) {
      subX = rect.left - subWidth - 2;
    }

    let subY = rect.top - 4;
    const subHeight = (item.subitems?.length ?? 0) * 32 + 12;
    if (subY + subHeight > window.innerHeight - pad) {
      subY = Math.max(pad, window.innerHeight - subHeight - pad);
    }

    setSubmenuCoords({ x: subX, y: subY });
  }, [isActiveSubmenu, item.subitems?.length]);

  const hasSub = !!item.subitems && item.subitems.length > 0;

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => {
          if (hasSub) onOpenSubmenu();
          else onCloseSubmenu();
        }}
      >
        <button
          ref={itemRef}
          type="button"
          disabled={item.disabled}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer text-gray-800 outline-none',
            'hover:bg-gray-100 hover:text-gray-900',
            item.danger && 'text-red-600 hover:bg-red-50 hover:text-red-700',
            item.disabled && 'cursor-not-allowed opacity-50',
            isActiveSubmenu && 'bg-gray-100 text-gray-900 font-medium',
          )}
          onClick={(e) => {
            if (hasSub) {
              e.stopPropagation();
              onOpenSubmenu();
            } else {
              item.onClick?.();
              onCloseMenu();
            }
          }}
        >
          {item.icon && (
            <span className="flex size-4 items-center justify-center shrink-0 text-gray-600">
              <Icon name={item.icon} size={15} />
            </span>
          )}
          <span className="truncate">{item.label}</span>

          {item.shortcut && (
            <kbd className="ml-auto rounded bg-gray-100 border border-gray-200/80 px-1 py-0.5 font-mono text-[10px] text-gray-500">
              {item.shortcut}
            </kbd>
          )}

          {hasSub && (
            <span className="ml-auto flex size-3.5 items-center justify-center text-gray-400">
              <Icon name="chevron-right" size={13} />
            </span>
          )}
        </button>

        {/* Submenu Flyout */}
        {hasSub && isActiveSubmenu && submenuCoords && item.subitems && (
          <div
            ref={submenuRef}
            data-sheet-context-menu="true"
            className="fixed z-50 min-w-[190px] max-w-[260px] rounded-lg border border-gray-200 bg-white p-1 text-gray-800 shadow-xl shadow-black/10 select-none animate-in fade-in-0 duration-75"
            style={{ left: `${submenuCoords.x}px`, top: `${submenuCoords.y}px` }}
          >
            {item.subitems.map((sub) => (
              <button
                key={sub.id}
                type="button"
                disabled={sub.disabled}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer text-gray-800 outline-none',
                  'hover:bg-gray-100 hover:text-gray-900',
                  sub.danger && 'text-red-600 hover:bg-red-50 hover:text-red-700',
                  sub.disabled && 'cursor-not-allowed opacity-50',
                )}
                onClick={() => {
                  sub.onClick?.();
                  onCloseMenu();
                }}
              >
                {sub.icon && (
                  <span className="flex size-4 items-center justify-center shrink-0 text-gray-600">
                    <Icon name={sub.icon} size={15} />
                  </span>
                )}
                <span className="truncate">{sub.label}</span>
                {sub.shortcut && (
                  <kbd className="ml-auto rounded bg-gray-100 border border-gray-200/80 px-1 py-0.5 font-mono text-[10px] text-gray-500">
                    {sub.shortcut}
                  </kbd>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {item.dividerAfter && <div className="my-1 h-px bg-gray-200 -mx-1" />}
    </>
  );
};
