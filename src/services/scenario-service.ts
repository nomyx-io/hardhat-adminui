import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ScenarioDiscovery } from "../scenario-runner/core/discovery";
import { ScenarioEngine } from "../scenario-runner/core/engine";
import { ScenarioHistoryService, ScenarioExecution } from "./scenario-history-service";
import * as path from "path";

export class ScenarioService {
  private discovery: ScenarioDiscovery;
  private engine: ScenarioEngine;
  private historyService: ScenarioHistoryService;

  constructor(private hre: HardhatRuntimeEnvironment) {
    const scenariosPath = path.join(this.hre.config.paths.root, "scenarios");
    this.discovery = new ScenarioDiscovery(scenariosPath);
    this.engine = new ScenarioEngine(this.hre);
    this.historyService = new ScenarioHistoryService(this.hre.config.paths.root);
  }

  public async listScenarios(): Promise<string[]> {
    return this.discovery.listScenarios();
  }

  public async getScenario(name: string) {
    return this.discovery.loadScenario(name);
  }

  public async runScenario(name: string) {
    const scenario = await this.discovery.loadScenario(name);
    return this.engine.run(scenario);
  }

  public async runScenarioBatch(scenarioNames: string[], executionId: string) {
    const scenarios = await Promise.all(
      scenarioNames.map(name => this.discovery.loadScenario(name))
    );

    const execution: ScenarioExecution = {
      id: executionId,
      timestamp: new Date().toISOString(),
      status: 'running',
      summary: {
        total: scenarios.length,
        passed: 0,
        failed: 0,
        running: scenarios.length,
        pending: 0,
      },
      scenarios: scenarios.map(s => ({
        name: s.metadata.name,
        status: 'running',
        steps: [],
      })),
    };
    this.historyService.addExecution(execution);

    const results = await this.engine.runBatch(scenarios);

    const finalExecution = this.historyService.getExecutionById(executionId);
    if (finalExecution) {
      finalExecution.status = results.some(r => r.status === 'failed') ? 'failed' : 'completed';
      finalExecution.scenarios = results;
      finalExecution.summary = {
        total: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        failed: results.filter(r => r.status === 'failed').length,
        running: 0,
        pending: 0,
      };
      finalExecution.duration = new Date().getTime() - new Date(finalExecution.timestamp).getTime();
      this.historyService.updateExecution(executionId, finalExecution);
    }
  }

  public async saveScenario(name: string, content: string) {
    return this.discovery.saveScenario(name, content);
  }
}
