import { AppProvider, useApp } from '@/context/AppContext';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';

function AppContent() {
  const { user } = useApp();
  return user ? <Dashboard /> : <AuthPage />;
}

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
