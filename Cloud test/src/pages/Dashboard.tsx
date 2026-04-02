import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { StatsCards } from '@/components/StatsCards';
import { ResultsChart } from '@/components/ResultsChart';
import { FileUpload } from '@/components/FileUpload';
import { TestResults } from '@/components/TestResults';
import { LiveLogs } from '@/components/LiveLogs';
import { AdminPanel } from '@/components/AdminPanel';
import { Terminal, LayoutDashboard, Upload, FlaskConical, Settings, LogOut } from 'lucide-react';

type Tab = 'dashboard' | 'upload' | 'results' | 'admin';

export default function Dashboard() {
  const { user, logout } = useApp();
  const [tab, setTab] = useState<Tab>('dashboard');

  const navItems: { id: Tab; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload & Run', icon: Upload },
    { id: 'results', label: 'Results', icon: FlaskConical },
    { id: 'admin', label: 'Admin', icon: Settings, adminOnly: true },
  ];

  const visibleNav = navItems.filter(n => !n.adminOnly || user?.role === 'admin');

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <span className="font-bold text-gradient">CloudTest</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {visibleNav.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  tab === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
            {user?.role === 'admin' && (
              <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full">admin</span>
            )}
            <Button size="sm" variant="ghost" onClick={logout} className="text-muted-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden flex gap-1 p-2 overflow-x-auto glass">
        {visibleNav.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs whitespace-nowrap ${
              tab === item.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="container py-6 space-y-6">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <StatsCards />
              <ResultsChart />
              <LiveLogs />
            </div>
          )}

          {tab === 'upload' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Upload Code Files</h2>
              <FileUpload />
            </div>
          )}

          {tab === 'results' && <TestResults />}

          {tab === 'admin' && <AdminPanel />}
        </motion.div>
      </main>
    </div>
  );
}
