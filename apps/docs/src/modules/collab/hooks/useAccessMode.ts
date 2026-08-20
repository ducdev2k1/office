import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type AccessMode = 'view' | 'comment' | 'edit';

const VALID: AccessMode[] = ['view', 'comment', 'edit'];

export const useAccessMode = (): AccessMode => {
  const [params] = useSearchParams();
  const access = params.get('access');
  return useMemo(() => {
    const normalized = (access ?? 'edit').toLowerCase();
    return VALID.includes(normalized as AccessMode) ? (normalized as AccessMode) : 'edit';
  }, [access]);
};

export const readAccessMode = (): AccessMode => {
  if (typeof window === 'undefined') return 'edit';
  const params = new URLSearchParams(window.location.search);
  const access = params.get('access');
  const normalized = (access ?? 'edit').toLowerCase();
  return VALID.includes(normalized as AccessMode) ? (normalized as AccessMode) : 'edit';
};