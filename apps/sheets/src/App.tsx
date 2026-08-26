import { HomePage } from '@/pages/HomePage';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Skeleton } from '@office/ui-kit';

const EditorPage = lazy(() =>
  import('@/pages/EditorPage').then((m) => ({ default: m.EditorPage })),
);

const PageFallback = () => (
  <div className="flex h-screen w-full flex-col gap-3 bg-background p-4">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-full w-full" />
  </div>
);

const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route
      path="/edit/:id"
      element={
        <Suspense fallback={<PageFallback />}>
          <EditorPage />
        </Suspense>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
