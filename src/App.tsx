import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import WalletDashboard from '@/pages/WalletDashboard';
import CreateWallet from '@/pages/CreateWallet';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from '@/components/PublicRoute';
import './App.css';

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="system" enableSystem>
        <AuthProvider>
          <Routes>
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <Index />
                </PublicRoute>
              } 
            />
            <Route 
              path="/wallet-dashboard" 
              element={
                <ProtectedRoute>
                  <WalletDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-wallet" 
              element={
                <ProtectedRoute>
                  <CreateWallet />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-center" />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;