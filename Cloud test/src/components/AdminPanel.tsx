import { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminPanel() {
  const { testCases, addTestCase, removeTestCase } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('python');
  const [expected, setExpected] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (!name || !expected) return;
    addTestCase({ name, language, expectedOutput: expected, description });
    setName(''); setExpected(''); setDescription('');
    setShowForm(false);
  };

  const languages = ['python', 'javascript', 'java'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Test Case Management</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Test Case
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard variant="strong" className="space-y-3">
              <Input placeholder="Test name" value={name} onChange={e => setName(e.target.value)} className="bg-secondary/50" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-secondary/50 px-3 text-sm text-foreground"
              >
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <Input placeholder="Expected output" value={expected} onChange={e => setExpected(e.target.value)} className="bg-secondary/50" />
              <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="bg-secondary/50" />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {languages.map(lang => {
        const cases = testCases.filter(tc => tc.language === lang);
        if (cases.length === 0) return null;
        return (
          <div key={lang}>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 capitalize">{lang}</h3>
            <div className="space-y-2">
              {cases.map(tc => (
                <GlassCard key={tc.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{tc.name}</p>
                    <p className="text-xs text-muted-foreground">{tc.description} · Expected: {tc.expectedOutput}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeTestCase(tc.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </GlassCard>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
