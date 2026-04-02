import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(145, 65%, 45%)', 'hsl(0, 72%, 55%)', 'hsl(38, 92%, 55%)'];

export function ResultsChart() {
  const { testRuns } = useApp();

  const barData = testRuns.slice(0, 8).reverse().map((run, i) => {
    const passed = run.results.filter(r => r.status === 'passed').length;
    const failed = run.results.filter(r => r.status === 'failed').length;
    return { name: `Run ${i + 1}`, passed, failed };
  });

  const allResults = testRuns.flatMap(r => r.results);
  const pieData = [
    { name: 'Passed', value: allResults.filter(r => r.status === 'passed').length },
    { name: 'Failed', value: allResults.filter(r => r.status === 'failed').length },
    { name: 'Pending', value: allResults.filter(r => r.status === 'pending' || r.status === 'running').length },
  ].filter(d => d.value > 0);

  if (testRuns.length === 0) {
    return (
      <GlassCard className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Run tests to see results charts</p>
      </GlassCard>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <GlassCard>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Test Results by Run</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsla(220, 14%, 30%, 0.3)" />
            <XAxis dataKey="name" tick={{ fill: 'hsl(215, 12%, 55%)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'hsl(215, 12%, 55%)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 18%, 10%)',
                border: '1px solid hsl(220, 14%, 18%)',
                borderRadius: '8px',
                color: 'hsl(210, 20%, 92%)',
              }}
            />
            <Bar dataKey="passed" fill="hsl(145, 65%, 45%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="failed" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Overall Distribution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 18%, 10%)',
                border: '1px solid hsl(220, 14%, 18%)',
                borderRadius: '8px',
                color: 'hsl(210, 20%, 92%)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          {pieData.map((entry, i) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-xs text-muted-foreground">{entry.name} ({entry.value})</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
