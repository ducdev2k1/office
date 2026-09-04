import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@office/auth-sdk';

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-workspace">
        <div className="animate-pulse text-text-muted">Đang kiểm tra phiên đăng nhập…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};