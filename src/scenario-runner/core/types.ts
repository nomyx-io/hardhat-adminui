import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Contract, BigNumber, Signer } from "ethers";

export interface EnhancedScenario {
  version: "2.0";
  metadata: {
    name: string;
    description: string;
    author?: string;
    tags?: string[];
    requirements?: string[];
  };
  
  config: {
    timeout?: number;
    retries?: number;
    parallel?: boolean;
    network?: string;
    environment?: Record<string, any>;
  };
  
  setup: {
    contracts?: ContractSetup[];
    accounts?: AccountSetup;
    fixtures?: FixtureSetup[];
    hooks?: {
      before?: Hook[];
      after?: Hook[];
    };
  };
  
  scenarios: ScenarioDefinition[];
  
  teardown?: TeardownConfig;
}

export interface ContractSetup {
  name: string;
  deployment: {
    contractName: string;
    args?: any[];
  };
}

export interface AccountSetup {
  count: number;
  roles?: string[];
  funding?: string;
}

export interface FixtureSetup {
  name: string;
  path: string;
}

export interface Hook {
  task: string;
  params?: Record<string, any>;
}

export interface ScenarioDefinition {
  name: string;
  description?: string;
  steps: OperationStep[];
}

export interface OperationStep {
  description?: string;
  task: string;
  params: { [key: string]: any };
  shouldFail?: boolean;
  expectedError?: string;
}

export interface TeardownConfig {
  hooks?: Hook[];
}
