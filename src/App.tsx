import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import WalletDashboard from '@/pages/WalletDashboard';
import CreateWallet from '@/pages/CreateWallet';
import { useAuth } from '@/contexts/AuthContext';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
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
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="system" enableSystem>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-center" />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;