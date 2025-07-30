import { Router } from "express";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { AppRequest } from "../types";

export function createProjectRoutes(hre: HardhatRuntimeEnvironment): Router {
  const router = Router();

  /**
   * GET /api/project-info
   * Returns project information including Hardhat version, networks, etc.
   */
  router.get("/api/project-info", (req: AppRequest, res) => {
    try {
      const projectInfo = hre.adminUI.getProjectInfo();
      res.json(projectInfo);
    } catch (error) {
      console.error("Error getting project info:", error);
      res.status(500).json({ error: "Failed to get project information" });
    }
  });

  return router;
}