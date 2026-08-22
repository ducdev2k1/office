import { useEffect, useState } from 'react';
import { cn } from '@office/ui-kit';

export type SettingsUnit = 'cm' | 'mm' | 'inch';

export interface SelectFieldProps {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

export const SelectField = ({ value, onChange, options, className }: SelectFieldProps) => (
  <div className={cn('relative flex items-center', className)}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-8.5 appearance-none rounded-lg border border-input bg-background px-3 pr-8 text-xs font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 cursor-pointer transition-all"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-card text-foreground">
          {opt.label}
        </option>
      ))}
    </select>
    <div className="absolute right-2.5 pointer-events-none text-muted-foreground">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  </div>
);

export interface NumberInputWithUnitProps {
  label: string;
  value: number | string;
  unit: string;
  step?: number;
  min?: number;
  max?: number;
  readOnly?: boolean;
  onChange?: (v: number) => void;
}

export const NumberInputWithUnit = ({
  label,
  value,
  unit,
  step = 0.1,
  min = 0,
  max = 50,
  readOnly = false,
  onChange,
}: NumberInputWithUnitProps) => {
  const [localVal, setLocalVal] = useState<string>(String(value ?? ''));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalVal(String(value ?? ''));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextText = e.target.value;
    setLocalVal(nextText);
    if (nextText.trim() === '') return;
    const parsed = parseFloat(nextText);
    if (!Number.isNaN(parsed)) {
      onChange?.(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localVal.trim() === '') {
      const fallback = typeof value === 'number' ? value : (min ?? 0);
      setLocalVal(String(fallback));
      onChange?.(fallback);
      return;
    }
    let parsed = parseFloat(localVal);
    if (Number.isNaN(parsed)) {
      const fallback = typeof value === 'number' ? value : (min ?? 0);
      setLocalVal(String(fallback));
      onChange?.(fallback);
      return;
    }
    if (min !== undefined && parsed < min) parsed = min;
    if (max !== undefined && parsed > max) parsed = max;
    setLocalVal(String(parsed));
    onChange?.(parsed);
  };

  return (
    <div className="space-y-1">
      <span className="text-[11px] text-muted-foreground font-normal">{label}</span>
      <div className="relative flex items-center">
        <input
          type={readOnly ? 'text' : 'number'}
          step={step}
          min={min}
          max={max}
          readOnly={readOnly}
          value={readOnly ? value : isFocused ? localVal : value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          className={cn(
            'w-full h-8.5 rounded-lg border border-input bg-background px-3 pr-8 text-xs font-medium text-foreground transition-all',
            readOnly
              ? 'bg-muted/50 text-muted-foreground cursor-default border-border'
              : 'focus:border-primary focus:ring-1 focus:ring-primary/30',
          )}
        />
        <span className="absolute right-2.5 text-[11px] text-muted-foreground font-medium pointer-events-none select-none">
          {unit}
        </span>
      </div>
    </div>
  );
};
