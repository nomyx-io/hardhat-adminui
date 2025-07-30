import { HardhatRuntimeEnvironment } from "hardhat/types";
import { EnhancedScenario, ScenarioDefinition, OperationStep } from "./types";
import { ScenarioResult, ScenarioStep } from "../../services/scenario-history-service";
import { template } from "lodash";

export class ScenarioEngine {
  constructor(private hre: HardhatRuntimeEnvironment) {}

  public async runBatch(scenarios: EnhancedScenario[]): Promise<ScenarioResult[]> {
    const results: ScenarioResult[] = [];
    for (const scenario of scenarios) {
      const result = await this.run(scenario);
      results.push(result);
    }
    return results;
  }

  public async run(scenario: EnhancedScenario): Promise<ScenarioResult> {
    const scenarioResult: ScenarioResult = {
      name: scenario.metadata.name,
      status: 'running',
      steps: [],
      startTime: new Date().toISOString(),
    };

    console.log(`Running scenario: ${scenario.metadata.name}`);
    
    await this.runSetup(scenario.setup);

    for (const individualScenario of scenario.scenarios) {
      const steps = await this.runSingleScenario(individualScenario);
      scenarioResult.steps.push(...steps);
    }

    await this.runTeardown(scenario.teardown);

    scenarioResult.endTime = new Date().toISOString();
    scenarioResult.duration = new Date(scenarioResult.endTime).getTime() - new Date(scenarioResult.startTime!).getTime();
    
    const hasFailedStep = scenarioResult.steps.some(s => s.status === 'failed');
    scenarioResult.status = hasFailedStep ? 'failed' : 'passed';

    return scenarioResult;
  }

  private async runSetup(setup: EnhancedScenario["setup"]) {
    if (!setup) return;

    if (setup.hooks?.before) {
      for (const hook of setup.hooks.before) {
        await this.hre.run(hook.task, hook.params);
      }
    }
  }

  private async runSingleScenario(scenario: ScenarioDefinition): Promise<ScenarioStep[]> {
    console.log(`-- Running: ${scenario.name}`);
    const steps: ScenarioStep[] = [];
    for (const step of scenario.steps) {
      const stepResult = await this.executeStep(step);
      steps.push(stepResult);
    }
    return steps;
  }

  private async executeStep(step: OperationStep): Promise<ScenarioStep> {
    const stepResult: ScenarioStep = {
      description: step.description || step.task,
      status: 'running',
      logs: [],
      timestamp: new Date().toISOString(),
    };

    const templateOptions = {
      interpolate: /\$\{([\s\S]+?)\}/g,
    };

    // TODO: Implement a state management solution
    const templateContext = {};

    const compiledParamsString = template(JSON.stringify(step.params), templateOptions)(templateContext);
    const compiledParams = JSON.parse(compiledParamsString);

    try {
      const startTime = Date.now();
      await this.hre.run(step.task, compiledParams);
      stepResult.duration = Date.now() - startTime;

      if (step.shouldFail) {
        stepResult.status = 'failed';
        stepResult.error = `Operation ${step.task} was expected to fail, but it succeeded.`;
      } else {
        stepResult.status = 'passed';
      }
    } catch (error: any) {
      const startTime = Date.now();
      stepResult.duration = Date.now() - startTime;
      if (!step.shouldFail) {
        stepResult.status = 'failed';
        stepResult.error = error.message;
      } else {
        if (step.expectedError && !error.message.includes(step.expectedError)) {
          stepResult.status = 'failed';
          stepResult.error = `Operation ${step.task} failed with an unexpected error. Expected: '${step.expectedError}', Got: '${error.message}'`;
        } else {
          stepResult.status = 'passed';
          stepResult.logs.push(`Operation ${step.task} failed as expected.`);
        }
      }
    }
    return stepResult;
  }

  private async runTeardown(teardown: EnhancedScenario["teardown"]) {
    if (!teardown?.hooks) return;

    for (const hook of teardown.hooks) {
      await this.hre.run(hook.task, hook.params);
    }
  }
}
