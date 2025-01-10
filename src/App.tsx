import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import CreateWallet from "@/pages/CreateWallet";
import WalletDashboard from "@/pages/WalletDashboard";
import { AuthProvider } from "@/contexts/AuthContext";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create-wallet" element={<CreateWallet />} />
          <Route path="/wallet-dashboard" element={<WalletDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;