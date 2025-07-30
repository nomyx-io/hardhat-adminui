import * as fs from "fs";
import * as path from "path";
import { EnhancedScenario } from "./types";

export class ScenarioDiscovery {
  constructor(private scenariosPath: string) {}

  public async listScenarios(): Promise<string[]> {
    const scenarioFiles = this.findScenarioFiles(this.scenariosPath);
    return scenarioFiles.map(file => {
      const baseName = path.basename(file);
      // Remove extensions to get the scenario name
      return baseName.replace(/\.(scenario\.json|js|ts)$/, '');
    });
  }

  public async loadScenario(name: string): Promise<EnhancedScenario> {
    const scenarioFiles = this.findScenarioFiles(this.scenariosPath);
    
    // Look for the scenario file - prefer .scenario.json, fallback to .js/.ts
    const scenarioFile = scenarioFiles.find(file => {
      const baseName = path.basename(file);
      return baseName === `${name}.scenario.json` || 
             baseName === `${name}.js` ||
             baseName === `${name}.ts` ||
             baseName.replace(/\.(scenario\.json|js|ts)$/, '') === name;
    });

    if (!scenarioFile) {
      throw new Error(`Scenario not found: ${name} (looking for ${name}.scenario.json, ${name}.js, or ${name}.ts)`);
    }

    const content = fs.readFileSync(scenarioFile, "utf-8");
    
    if (scenarioFile.endsWith('.scenario.json')) {
      try {
        return JSON.parse(content) as EnhancedScenario;
      } catch (parseError) {
        throw new Error(`Failed to parse scenario file ${scenarioFile}: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`);
      }
    } else {
      // For JS/TS files, try to evaluate and extract the module.exports
      try {
        // Create a minimal context to evaluate the JS file
        const moduleObj = { exports: {} };
        const requireFn = (dep: string) => {
          // Basic require implementation for common modules
          if (dep === 'path') return require('path');
          if (dep === 'fs') return require('fs');
          throw new Error(`Module not supported in scenario context: ${dep}`);
        };
        
        // Use Function constructor to safely evaluate the JS content
        const evalFunction = new Function('module', 'exports', 'require', content);
        evalFunction(moduleObj, moduleObj.exports, requireFn);
        
        return moduleObj.exports as EnhancedScenario;
      } catch (evalError) {
        throw new Error(`Failed to evaluate scenario file ${scenarioFile}: ${evalError instanceof Error ? evalError.message : 'Evaluation error'}`);
      }
    }
  }

  public async saveScenario(name: string, content: string): Promise<void> {
    // Ensure scenarios directory exists
    if (!fs.existsSync(this.scenariosPath)) {
      fs.mkdirSync(this.scenariosPath, { recursive: true });
    }

    // Save as scenario.json file
    const filePath = path.join(this.scenariosPath, `${name}.scenario.json`);
    fs.writeFileSync(filePath, content, "utf-8");
  }

  private findScenarioFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) {
      return [];
    }

    let files: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files = files.concat(this.findScenarioFiles(fullPath));
      } else if (fullPath.endsWith(".scenario.json") || 
                 (fullPath.endsWith(".js") && item.includes("test")) ||
                 (fullPath.endsWith(".js") && item.includes("scenario"))) {
        files.push(fullPath);
      }
    }

    return files;
  }
}
