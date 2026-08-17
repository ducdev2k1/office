import { Navigate, Route, Routes } from 'react-router-dom';
import { DemoSheetsPage } from '@/pages/DemoSheetsPage';
import { EditorPage } from '@/pages/EditorPage';
import { HomePage } from '@/pages/HomePage';

const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/edit/:id" element={<EditorPage />} />
    {import.meta.env.DEV && <Route path="/demo/sheets" element={<DemoSheetsPage />} />}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;