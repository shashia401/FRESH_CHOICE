import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { ShoppingListPage } from './pages/ShoppingListPage';
import { ReportsPage } from './pages/ReportsPage';
import { VendorsPage } from './pages/VendorsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/shopping-list" element={<ShoppingListPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
}

export default App;