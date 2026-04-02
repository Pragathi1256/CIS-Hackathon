import React, { createContext, useContext, useState, useCallback } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface UploadedFile {
  id: string;
  filename: string;
  language: string;
  size: number;
  uploadDate: string;
  content?: string;
}

export interface TestCase {
  id: string;
  name: string;
  language: string;
  expectedOutput: string;
  description: string;
}

export interface TestResult {
  id: string;
  fileId: string;
  testCaseId: string;
  testName: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  logs: string;
  duration: number;
  timestamp: string;
}

export interface TestRun {
  id: string;
  fileId: string;
  filename: string;
  language: string;
  status: 'running' | 'completed';
  results: TestResult[];
  startedAt: string;
  completedAt?: string;
}

// Mock data
const MOCK_TEST_CASES: TestCase[] = [
  { id: '1', name: 'Syntax Validation', language: 'python', expectedOutput: 'valid', description: 'Check for syntax errors' },
  { id: '2', name: 'Function Existence', language: 'python', expectedOutput: 'found', description: 'Verify main functions exist' },
  { id: '3', name: 'Output Correctness', language: 'python', expectedOutput: 'correct', description: 'Validate expected output' },
  { id: '4', name: 'Edge Case Handling', language: 'python', expectedOutput: 'handled', description: 'Test edge case inputs' },
  { id: '5', name: 'Performance Check', language: 'python', expectedOutput: 'within_limits', description: 'Check execution time < 5s' },
  { id: '6', name: 'Syntax Validation', language: 'javascript', expectedOutput: 'valid', description: 'Check for syntax errors' },
  { id: '7', name: 'Module Exports', language: 'javascript', expectedOutput: 'exported', description: 'Verify module exports' },
  { id: '8', name: 'Output Correctness', language: 'javascript', expectedOutput: 'correct', description: 'Validate expected output' },
  { id: '9', name: 'Error Handling', language: 'javascript', expectedOutput: 'handled', description: 'Test error handling' },
  { id: '10', name: 'Compilation Check', language: 'java', expectedOutput: 'compiled', description: 'Verify compilation success' },
  { id: '11', name: 'Class Structure', language: 'java', expectedOutput: 'valid', description: 'Validate class structure' },
  { id: '12', name: 'Output Correctness', language: 'java', expectedOutput: 'correct', description: 'Validate expected output' },
];

function detectLanguage(filename: string): string {
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.js') || filename.endsWith('.ts')) return 'javascript';
  if (filename.endsWith('.java')) return 'java';
  return 'unknown';
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function simulateTestResult(tc: TestCase, fileContent: string): Omit<TestResult, 'id' | 'fileId' | 'timestamp'> {
  const shouldFail = Math.random() < 0.3; // 30% failure rate
  const duration = Math.floor(Math.random() * 2000) + 100;

  if (shouldFail) {
    const reasons = [
      `AssertionError: Expected "${tc.expectedOutput}" but got "undefined"`,
      `TypeError: Cannot read property '${tc.name.toLowerCase()}' of null`,
      `TimeoutError: Test exceeded 5000ms execution limit`,
      `ReferenceError: Function not defined in uploaded file`,
      `ValidationError: Output format mismatch — expected JSON, got string`,
    ];
    return {
      testCaseId: tc.id,
      testName: tc.name,
      status: 'failed',
      logs: `[FAIL] ${tc.name}\n  ${tc.description}\n  ${reasons[Math.floor(Math.random() * reasons.length)]}\n  at test_runner.execute (line ${Math.floor(Math.random() * 100) + 1})\n  Duration: ${duration}ms`,
      duration,
    };
  }

  return {
    testCaseId: tc.id,
    testName: tc.name,
    status: 'passed',
    logs: `[PASS] ${tc.name}\n  ${tc.description}\n  Output: "${tc.expectedOutput}"\n  Duration: ${duration}ms`,
    duration,
  };
}

// Context
interface AppState {
  user: User | null;
  files: UploadedFile[];
  testCases: TestCase[];
  testRuns: TestRun[];
  activeRun: TestRun | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  uploadFile: (file: File) => Promise<UploadedFile>;
  runTests: (fileId: string) => Promise<void>;
  addTestCase: (tc: Omit<TestCase, 'id'>) => void;
  removeTestCase: (id: string) => void;
  updateTestCase: (id: string, tc: Partial<TestCase>) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>(MOCK_TEST_CASES);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [activeRun, setActiveRun] = useState<TestRun | null>(null);

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const isAdmin = email.includes('admin');
    setUser({ id: generateId(), email, role: isAdmin ? 'admin' : 'user' });
    return true;
  }, []);

  const signup = useCallback(async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 800));
    setUser({ id: generateId(), email, role: 'user' });
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setFiles([]);
    setTestRuns([]);
    setActiveRun(null);
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<UploadedFile> => {
    const content = await file.text();
    const uploaded: UploadedFile = {
      id: generateId(),
      filename: file.name,
      language: detectLanguage(file.name),
      size: file.size,
      uploadDate: new Date().toISOString(),
      content,
    };
    setFiles(prev => [...prev, uploaded]);
    return uploaded;
  }, []);

  const runTests = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const relevantTests = testCases.filter(tc => tc.language === file.language);
    const run: TestRun = {
      id: generateId(),
      fileId,
      filename: file.filename,
      language: file.language,
      status: 'running',
      results: relevantTests.map(tc => ({
        id: generateId(),
        fileId,
        testCaseId: tc.id,
        testName: tc.name,
        status: 'pending' as const,
        logs: '',
        duration: 0,
        timestamp: new Date().toISOString(),
      })),
      startedAt: new Date().toISOString(),
    };

    setActiveRun(run);
    setTestRuns(prev => [run, ...prev]);

    // Simulate sequential test execution
    for (let i = 0; i < relevantTests.length; i++) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
      const result = simulateTestResult(relevantTests[i], file.content || '');
      
      setActiveRun(prev => {
        if (!prev) return null;
        const newResults = [...prev.results];
        newResults[i] = {
          ...newResults[i],
          ...result,
          timestamp: new Date().toISOString(),
        };
        const updated = { ...prev, results: newResults };
        return updated;
      });

      setTestRuns(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(r => r.id === run.id);
        if (idx >= 0) {
          const newResults = [...updated[idx].results];
          newResults[i] = {
            ...newResults[i],
            ...result,
            timestamp: new Date().toISOString(),
          };
          updated[idx] = { ...updated[idx], results: newResults };
        }
        return updated;
      });
    }

    // Mark complete
    setActiveRun(prev => prev ? { ...prev, status: 'completed', completedAt: new Date().toISOString() } : null);
    setTestRuns(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(r => r.id === run.id);
      if (idx >= 0) updated[idx] = { ...updated[idx], status: 'completed', completedAt: new Date().toISOString() };
      return updated;
    });
  }, [files, testCases]);

  const addTestCase = useCallback((tc: Omit<TestCase, 'id'>) => {
    setTestCases(prev => [...prev, { ...tc, id: generateId() }]);
  }, []);

  const removeTestCase = useCallback((id: string) => {
    setTestCases(prev => prev.filter(tc => tc.id !== id));
  }, []);

  const updateTestCase = useCallback((id: string, updates: Partial<TestCase>) => {
    setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, ...updates } : tc));
  }, []);

  return (
    <AppContext.Provider value={{
      user, files, testCases, testRuns, activeRun,
      login, signup, logout, uploadFile, runTests,
      addTestCase, removeTestCase, updateTestCase,
    }}>
      {children}
    </AppContext.Provider>
  );
}
