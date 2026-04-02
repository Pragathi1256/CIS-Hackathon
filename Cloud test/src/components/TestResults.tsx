import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { useApp, TestResult } from '@/context/AppContext';
import { CheckCircle2, XCircle, ChevronDown, Clock, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TestResults() {
  const { activeRun, testRuns } = useApp();
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const run = activeRun || testRuns[0];
  if (!run) {
    return (
      <GlassCard className="text-center py-12">
        <p className="text-muted-foreground text-sm">Upload a file and run tests to see results</p>
      </GlassCard>
    );
  }

  const filtered = run.results.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleDownload = () => {
    const report = run.results.map(r =>
      `${r.status === 'passed' ? '✓' : '✗'} ${r.testName}\n${r.logs}\n`
    ).join('\n---\n\n');
    const blob = new Blob([`Test Report — ${run.filename}\n${'='.repeat(40)}\n\n${report}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${run.filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">
            {run.filename}
            {run.status === 'running' && (
              <span className="ml-2 text-warning animate-pulse-glow">● Running</span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-border">
            {(['all', 'passed', 'failed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs capitalize transition-colors ${
                  filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={handleDownload} disabled={run.status === 'running'}>
            <Download className="w-3.5 h-3.5 mr-1" /> Report
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((result, i) => (
            <TestResultRow
              key={result.id}
              result={result}
              index={i}
              expanded={expandedId === result.id}
              onToggle={() => setExpandedId(expandedId === result.id ? null : result.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TestResultRow({ result, index, expanded, onToggle }: {
  result: TestResult;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isPending = result.status === 'pending' || result.status === 'running';

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard className={`p-0 overflow-hidden ${result.status === 'failed' ? 'bg-status-fail' : result.status === 'passed' ? 'bg-status-pass' : ''}`}>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 text-left"
          disabled={isPending}
        >
          <div className="flex items-center gap-3">
            {isPending ? (
              <Clock className="w-4 h-4 text-muted-foreground animate-pulse-glow" />
            ) : result.status === 'passed' ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm font-medium text-foreground">{result.testName}</span>
          </div>
          <div className="flex items-center gap-3">
            {result.duration > 0 && (
              <span className="text-xs text-muted-foreground">{result.duration}ms</span>
            )}
            {!isPending && (
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
            )}
          </div>
        </button>

        <AnimatePresence>
          {expanded && result.logs && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <pre className="px-4 pb-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {result.logs}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}
