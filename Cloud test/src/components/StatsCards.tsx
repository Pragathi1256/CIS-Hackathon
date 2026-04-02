import { motion } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { CheckCircle2, XCircle, Clock, Activity } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function StatsCards() {
  const { testRuns } = useApp();

  const allResults = testRuns.flatMap(r => r.results);
  const total = allResults.length;
  const passed = allResults.filter(r => r.status === 'passed').length;
  const failed = allResults.filter(r => r.status === 'failed').length;
  const running = allResults.filter(r => r.status === 'running' || r.status === 'pending').length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const stats = [
    { label: 'Total Tests', value: total, icon: Activity, color: 'text-primary' },
    { label: 'Passed', value: passed, icon: CheckCircle2, color: 'text-success' },
    { label: 'Failed', value: failed, icon: XCircle, color: 'text-destructive' },
    { label: 'Pass Rate', value: `${passRate}%`, icon: Clock, color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <GlassCard className="flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
