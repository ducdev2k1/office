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
    <div className={cn('p-2.5 select-none flex flex-col items-center gap-2 bg-popover text-popover-foreground', className)}>
      <div
        className="grid gap-[3px] p-1.5 rounded-md bg-muted/40 dark:bg-muted/20 border border-border/60"
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
                'size-[18px] rounded-[2px] transition-colors cursor-pointer block',
                isSelected
                  ? 'border-primary bg-primary/20 dark:bg-primary/30 ring-1 ring-primary/60'
                  : 'border-border/90 bg-card hover:border-primary/50 hover:bg-primary/5',
              )}
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
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
      <div className="text-xs font-medium text-muted-foreground tracking-wide px-2 py-0.5 rounded bg-muted/50">
        {hovered.rows} x {hovered.cols}
      </div>
    </div>
  );
};
