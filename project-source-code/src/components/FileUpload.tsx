import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Upload, FileCode, Play, Loader2 } from 'lucide-react';

export function FileUpload() {
  const { uploadFile, files, runTests } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [runningFileId, setRunningFileId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList) => {
    for (const file of Array.from(fileList)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['py', 'js', 'ts', 'java'].includes(ext || '')) {
        await uploadFile(file);
      }
    }
  };

  const handleRunTests = async (fileId: string) => {
    setRunningFileId(fileId);
    await runTests(fileId);
    setRunningFileId(null);
  };

  return (
    <div className="space-y-4">
      <GlassCard
        className={`border-2 border-dashed cursor-pointer transition-all duration-200 ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".py,.js,.ts,.java"
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
        <div className="text-center py-6">
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-foreground font-medium">Drop code files here or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">Supports .py, .js, .ts, .java</p>
        </div>
      </GlassCard>

      <AnimatePresence>
        {files.map(file => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{file.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.language} · {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleRunTests(file.id)}
                disabled={runningFileId === file.id}
              >
                {runningFileId === file.id ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Running</>
                ) : (
                  <><Play className="w-3.5 h-3.5 mr-1.5" /> Run Tests</>
                )}
              </Button>
            </GlassCard>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
