"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectRoutes = createProjectRoutes;
const express_1 = require("express");
function createProjectRoutes(hre) {
    const router = (0, express_1.Router)();
    /**
     * GET /api/project-info
     * Returns project information including Hardhat version, networks, etc.
     */
    router.get("/api/project-info", (req, res) => {
        try {
            const projectInfo = hre.adminUI.getProjectInfo();
            res.json(projectInfo);
        }
        catch (error) {
            console.error("Error getting project info:", error);
            res.status(500).json({ error: "Failed to get project information" });
        }
    });
    return router;
}
