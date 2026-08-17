import { loadIcons, type IconEntry } from '@inet/icons';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { cn } from './cn';

export type InetIconVariant = 'outline' | 'duotone';

export interface InetIconProps {
  /** Ten icon theo payload iNET (field `n`), vd: 'chevron-down', 'od-check-circle'. */
  name: string;
  variant?: InetIconVariant;
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Luon hien duotone neu co (fallback outline). */
  preferDuotone?: boolean;
}

type IconPayloadCache = Record<string, IconEntry>;

let payloadPromise: Promise<IconPayloadCache> | null = null;

const getPayload = (): Promise<IconPayloadCache> => {
  if (!payloadPromise) {
    payloadPromise = loadIcons().then((payload) =>
      Object.fromEntries(payload.icons.map((icon) => [icon.n, icon])),
    );
  }
  return payloadPromise;
};

/**
 * Icon iNET Design System (@inet/icons), render truc tiep SVG string tu payload.
 * Lazy-load 1 lan roi cache; mau theo `currentColor`.
 */
export const InetIcon = ({
  name,
  variant = 'outline',
  size = 20,
  className,
  style,
  preferDuotone,
}: InetIconProps) => {
  const [entry, setEntry] = useState<IconEntry | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getPayload().then((payload) => {
      if (!cancelled) setEntry(payload[name]);
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  const markup = useMemo(() => {
    if (!entry) return '';
    const useDuotone = (preferDuotone || variant === 'duotone') && !!entry.d;
    return useDuotone ? (entry.d ?? '') : (entry.o ?? entry.d ?? '');
  }, [entry, variant, preferDuotone]);

  if (!markup) return null;

  return (
    <span
      className={cn('inet-icon', className)}
      style={{ width: size, height: size, ...style }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
};
