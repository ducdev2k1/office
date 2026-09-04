import { useEffect } from 'react';
import { useAuthStore } from './authStore';

interface IAuthProviderProps {
  children: React.ReactNode;
  autoBootstrap?: boolean;
}

export const AuthProvider = ({ children, autoBootstrap = true }: IAuthProviderProps) => {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    if (autoBootstrap) {
      void bootstrap();
    }
  }, [autoBootstrap, bootstrap]);

  return <>{children}</>;
};