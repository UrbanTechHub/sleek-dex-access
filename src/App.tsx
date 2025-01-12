import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import WalletDashboard from '@/pages/WalletDashboard';
import CreateWallet from '@/pages/CreateWallet';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/wallet-dashboard" element={<WalletDashboard />} />
            <Route path="/create-wallet" element={<CreateWallet />} />
          </Routes>
          <Toaster position="top-center" />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;