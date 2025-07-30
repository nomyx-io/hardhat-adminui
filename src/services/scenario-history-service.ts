import fs from 'fs';
import path from 'path';

export interface ScenarioStep {
  description: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration?: number; // in milliseconds
  logs: string[];
  error?: string | null;
  timestamp?: string;
}

export interface ScenarioResult {
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration?: number; // in milliseconds
  steps: ScenarioStep[];
  startTime?: string;
  endTime?: string;
}

export interface ExecutionSummary {
  total: number;
  passed: number;
  failed: number;
  running: number;
  pending: number;
}

export interface ScenarioExecution {
  id: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'running' | 'pending';
  summary: ExecutionSummary;
  scenarios: ScenarioResult[];
  duration?: number; // total execution time in milliseconds
}

const HISTORY_FILE = '.scenarios-history.json';

export class ScenarioHistoryService {
  private historyPath: string;

  constructor(projectRoot: string) {
    this.historyPath = path.join(projectRoot, HISTORY_FILE);
    this.ensureHistoryFile();
  }

  private ensureHistoryFile() {
    if (!fs.existsSync(this.historyPath)) {
      fs.writeFileSync(this.historyPath, JSON.stringify([]));
    }
  }

  private readHistory(): ScenarioExecution[] {
    const data = fs.readFileSync(this.historyPath, 'utf-8');
    return JSON.parse(data);
  }

  private writeHistory(data: ScenarioExecution[]) {
    fs.writeFileSync(this.historyPath, JSON.stringify(data, null, 2));
  }

  getAllExecutions(): ScenarioExecution[] {
    return this.readHistory().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getExecutionById(id: string): ScenarioExecution | undefined {
    const history = this.readHistory();
    return history.find(exec => exec.id === id);
  }

  addExecution(execution: ScenarioExecution) {
    const history = this.readHistory();
    history.unshift(execution);
    this.writeHistory(history);
  }

  updateExecution(id: string, updatedExecution: Partial<ScenarioExecution>) {
    const history = this.readHistory();
    const index = history.findIndex(exec => exec.id === id);
    if (index !== -1) {
      history[index] = { ...history[index], ...updatedExecution };
      this.writeHistory(history);
    }
  }
}
