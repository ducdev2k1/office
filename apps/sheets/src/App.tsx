import { EditorPage } from '@/pages/EditorPage';
import { HomePage } from '@/pages/HomePage';
import { Navigate, Route, Routes } from 'react-router-dom';

const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/edit/:id" element={<EditorPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
