import { useApp } from '@/context/AppContext';
import { GlassCard } from '@/components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

export function LiveLogs() {
  const { activeRun, testRuns } = useApp();
  const run = activeRun || testRuns[0];

  const completedResults = run?.results.filter(r => r.status === 'passed' || r.status === 'failed') || [];

  return (
    <GlassCard className="h-64 overflow-hidden flex flex-col">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Live Logs</h3>
      <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
        {completedResults.length === 0 ? (
          <p className="text-muted-foreground opacity-50">Waiting for test execution...</p>
        ) : (
          <AnimatePresence>
            {completedResults.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`py-1 ${r.status === 'passed' ? 'status-pass' : 'status-fail'}`}
              >
                {r.status === 'passed' ? '✓' : '✗'} {r.testName} — {r.duration}ms
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {run?.status === 'running' && (
          <div className="status-running animate-pulse-glow mt-2">● Executing...</div>
        )}
      </div>
    </GlassCard>
  );
}
