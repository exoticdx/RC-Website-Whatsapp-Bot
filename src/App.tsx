import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CollectionView from './pages/CollectionView';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-gray-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collection/:id" element={<CollectionView />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
