import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '@/components/RequireAuth';
import { DemoSheetsPage } from '@/pages/DemoSheetsPage';
import { EditorPage } from '@/pages/EditorPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <RequireAuth>{children}</RequireAuth>
);

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-workspace">
        <div className="animate-pulse text-text-muted">Đang kiểm tra phiên đăng nhập…</div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

import { useAuthStore } from '@office/auth-sdk';

const App = () => (
  <Routes>
    <Route path="/login" element={
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    } />
    <Route path="/" element={<HomePage />} />
    <Route
      path="/edit/:id"
      element={
        <ProtectedRoute>
          <EditorPage />
        </ProtectedRoute>
      }
    />
    {import.meta.env.DEV && <Route path="/demo/sheets" element={<DemoSheetsPage />} />}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;