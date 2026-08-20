import type { SlideElement, SlideTableData } from '@/types/slides.types';
import React, { useState } from 'react';

interface TableElementRendererProps {
  element: SlideElement;
  onUpdateElement: (patch: Partial<SlideElement>) => void;
  isSelected: boolean;
}

export const TableElementRenderer = ({
  element,
  onUpdateElement,
  isSelected,
}: TableElementRendererProps) => {
  const [editingCell, setEditingCell] = useState<{ r: number; c: number } | null>(null);

  const tableData: SlideTableData = element.tableData || {
    rows: 3,
    cols: 3,
    cells: [
      ['Tiêu đề 1', 'Tiêu đề 2', 'Tiêu đề 3'],
      ['Dữ liệu 1', 'Dữ liệu 2', 'Dữ liệu 3'],
      ['Dữ liệu 4', 'Dữ liệu 5', 'Dữ liệu 6'],
    ],
    headerRow: true,
  };

  const handleCellChange = (r: number, c: number, value: string) => {
    const nextCells = tableData.cells.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === r && cIdx === c ? value : cell)),
    );
    onUpdateElement({
      tableData: { ...tableData, cells: nextCells },
    });
  };

  return (
    <div className="h-full w-full overflow-hidden rounded border border-border bg-white shadow-xs dark:bg-slate-900">
      <table className="h-full w-full table-fixed border-collapse">
        <tbody>
          {tableData.cells.map((row, rIdx) => {
            const isHeader = rIdx === 0 && tableData.headerRow;
            return (
              <tr key={rIdx} className={isHeader ? 'bg-muted/70 font-semibold' : ''}>
                {row.map((cell, cIdx) => {
                  const isEditing = editingCell?.r === rIdx && editingCell?.c === cIdx;
                  return (
                    <td
                      key={cIdx}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingCell({ r: rIdx, c: cIdx });
                      }}
                      className="border border-border/80 p-1 text-center text-xs text-foreground transition-colors hover:bg-accent/30 select-text"
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          defaultValue={cell}
                          onBlur={(e) => {
                            setEditingCell(null);
                            handleCellChange(rIdx, cIdx, e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Escape') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="h-full w-full bg-transparent text-center text-xs outline-none"
                        />
                      ) : (
                        <div className="truncate px-1">{cell || '-'}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
