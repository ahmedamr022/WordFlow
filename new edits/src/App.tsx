import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { VocabularyProvider } from './wordflow/hooks/useVocabulary';
import { WordsPage } from './wordflow/pages/WordsPage';
import { CategoryPage } from './wordflow/pages/CategoryPage';
import { StoriesPage } from './wordflow/pages/StoriesPage';
import { AdminPage } from './wordflow/pages/AdminPage';
import { PlaceholderPage } from './wordflow/pages/PlaceholderPage';

export function App() {
  return (
    <VocabularyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/words" replace />} />
          <Route path="/words" element={<WordsPage />} />
          <Route path="/words/:categoryId" element={<CategoryPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/paths" element={<PlaceholderPage title="المسارات" />} />
          <Route path="/stats" element={<PlaceholderPage title="الإحصائيات" />} />
          <Route
            path="/challenges"
            element={<PlaceholderPage title="التحديات" />} />
          
          <Route
            path="/favorites"
            element={<PlaceholderPage title="المفضلة" />} />
          
          <Route
            path="/settings"
            element={<PlaceholderPage title="الإعدادات" />} />
          
          <Route path="*" element={<Navigate to="/words" replace />} />
        </Routes>
      </BrowserRouter>
    </VocabularyProvider>);

}