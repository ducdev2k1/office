import { cn } from '@office/ui-kit';

export type SettingsUnit = 'cm' | 'mm' | 'inch';

export interface SelectFieldProps {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

export const SelectField = ({
  value,
  onChange,
  options,
  className,
}: SelectFieldProps) => (
  <div className={cn('relative flex items-center', className)}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-8.5 appearance-none rounded-lg border border-neutral-800 bg-[#1c1c1f] px-3 pr-8 text-xs font-medium text-neutral-100 focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 cursor-pointer transition-all"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-neutral-900 text-neutral-100">
          {opt.label}
        </option>
      ))}
    </select>
    <div className="absolute right-2.5 pointer-events-none text-neutral-500">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
  step = 0.05,
  min = 0,
  max = 50,
  readOnly = false,
  onChange,
}: NumberInputWithUnitProps) => (
  <div className="space-y-1">
    <span className="text-[11px] text-neutral-400 font-normal">{label}</span>
    <div className="relative flex items-center">
      <input
        type={readOnly ? 'text' : 'number'}
        step={step}
        min={min}
        max={max}
        readOnly={readOnly}
        value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
        className={cn(
          'w-full h-8.5 rounded-lg border border-neutral-800 bg-[#1c1c1f] px-3 pr-8 text-xs font-medium text-neutral-100 transition-all',
          readOnly
            ? 'bg-neutral-900/40 text-neutral-400 cursor-default'
            : 'focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30',
        )}
      />
      <span className="absolute right-2.5 text-[11px] text-neutral-500 font-medium pointer-events-none select-none">
        {unit}
      </span>
    </div>
  </div>
);
