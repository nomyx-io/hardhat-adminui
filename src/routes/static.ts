import { Router } from "express";
import path from "path";

export function createStaticRoutes(): Router {
  const router = Router();

  /**
   * Serve static files from the UI build directory
   */
  router.use("/", (req, res, next) => {
    // Only serve static files for non-API requests
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Serve static files from ui/build
    const staticHandler = require('express').static(path.join(__dirname, '../../ui/build'));
    staticHandler(req, res, next);
  });

  /**
   * Catch-all route for React Router
   * This should be the last route to handle client-side routing
   */
  router.get("*", (req, res) => {
    // Only handle non-API requests
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    
    // Serve index.html for all non-API routes (React Router)
    res.sendFile(path.join(__dirname, '../../ui/build/index.html'));
  });

  return router;
}