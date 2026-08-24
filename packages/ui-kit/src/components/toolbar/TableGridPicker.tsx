import { useState } from 'react';
import { cn } from '../../cn';

export interface TableGridPickerProps {
  maxRows?: number;
  maxCols?: number;
  onSelect: (rows: number, cols: number) => void;
  className?: string;
}

export const TableGridPicker = ({
  maxRows = 8,
  maxCols = 10,
  onSelect,
  className,
}: TableGridPickerProps) => {
  const [hovered, setHovered] = useState<{ rows: number; cols: number }>({ rows: 1, cols: 1 });
  const totalCells = maxRows * maxCols;

  return (
    <div className={cn('p-2.5 select-none flex flex-col items-center gap-2 bg-popover', className)}>
      <div
        className="grid gap-[3px] p-0.5"
        style={{
          gridTemplateColumns: `repeat(${maxCols}, 18px)`,
        }}
        onMouseLeave={() => setHovered({ rows: 1, cols: 1 })}
      >
        {Array.from({ length: totalCells }).map((_, index) => {
          const row = Math.floor(index / maxCols) + 1;
          const col = (index % maxCols) + 1;
          const isSelected = row <= hovered.rows && col <= hovered.cols;

          return (
            <button
              key={`${row}-${col}`}
              type="button"
              className={cn(
                'w-[18px] h-[18px] rounded-[2px] border transition-colors cursor-pointer block',
                isSelected
                  ? 'border-primary bg-primary/20 dark:bg-primary/30 ring-1 ring-primary/60'
                  : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:border-primary/50',
              )}
              onMouseEnter={() => setHovered({ rows: row, cols: col })}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(row, col);
              }}
              aria-label={`${row} x ${col}`}
            />
          );
        })}
      </div>
      <div className="text-xs font-medium text-muted-foreground tracking-wide">
        {hovered.rows} x {hovered.cols}
      </div>
    </div>
  );
};
