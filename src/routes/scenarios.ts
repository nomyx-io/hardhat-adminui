import { Router } from "express";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ScenarioService } from "../services/scenario-service";
import { ScenarioHistoryService } from "../services/scenario-history-service";
import { v4 as uuidv4 } from 'uuid';

export function createScenariosRoutes(hre: HardhatRuntimeEnvironment): Router {
  const router = Router();
  const scenarioService = new ScenarioService(hre);
  const historyService = new ScenarioHistoryService(hre.config.paths.root);

  router.get("/api/scenarios", async (req, res) => {
    try {
      const scenarios = await scenarioService.listScenarios();
      res.json(scenarios);
    } catch (error) {
      console.error('Error listing scenarios:', error);
      res.status(500).json({ error: 'Failed to list scenarios' });
    }
  });

  router.get("/api/scenarios/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const scenario = await scenarioService.getScenario(name);
      res.json(scenario);
    } catch (error) {
      console.error('Error getting scenario:', error);
      res.status(500).json({ error: 'Failed to get scenario' });
    }
  });

  router.post("/api/scenarios/run-batch", async (req, res) => {
    const { scenarios } = req.body;
    if (!scenarios || !Array.isArray(scenarios)) {
      return res.status(400).json({ error: 'Scenarios array is required' });
    }

    const executionId = `exec-${new Date().toISOString()}-${uuidv4()}`;
    
    // Don't await this, run in background
    scenarioService.runScenarioBatch(scenarios, executionId);

    res.status(202).json({
      message: "Scenario execution started",
      executionId,
    });
  });

  router.get("/api/scenarios/history", (req, res) => {
    try {
      const history = historyService.getAllExecutions();
      res.json(history);
    } catch (error) {
      console.error('Error getting scenario history:', error);
      res.status(500).json({ error: 'Failed to get scenario history' });
    }
  });

  router.get("/api/scenarios/history/:id", (req, res) => {
    try {
      const { id } = req.params;
      const execution = historyService.getExecutionById(id);
      if (execution) {
        res.json(execution);
      } else {
        res.status(404).json({ error: "Execution not found" });
      }
    } catch (error) {
      console.error('Error getting execution details:', error);
      res.status(500).json({ error: 'Failed to get execution details' });
    }
  });

  router.post("/api/scenarios", async (req, res) => {
    try {
      const { name, content } = req.body;
      
      if (!name || !content) {
        return res.status(400).json({ 
          error: 'Name and content are required' 
        });
      }
      
      await scenarioService.saveScenario(name, content);
      res.json({ 
        message: `Scenario ${name} created successfully`,
        name 
      });
    } catch (error) {
      console.error('Error creating scenario:', error);
      res.status(500).json({ 
        error: 'Failed to create scenario',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  router.put("/api/scenarios/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ 
          error: 'Content is required' 
        });
      }
      
      await scenarioService.saveScenario(name, content);
      res.json({ 
        message: `Scenario ${name} updated successfully`,
        name 
      });
    } catch (error) {
      console.error('Error updating scenario:', error);
      res.status(500).json({ 
        error: 'Failed to update scenario',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}
