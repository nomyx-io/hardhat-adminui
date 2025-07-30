"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStaticRoutes = createStaticRoutes;
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
function createStaticRoutes() {
    const router = (0, express_1.Router)();
    /**
     * Serve static files from the UI build directory
     */
    router.use("/", (req, res, next) => {
        // Only serve static files for non-API requests
        if (req.path.startsWith('/api/')) {
            return next();
        }
        // Serve static files from ui/build
        const staticHandler = require('express').static(path_1.default.join(__dirname, '../../ui/build'));
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
        res.sendFile(path_1.default.join(__dirname, '../../ui/build/index.html'));
    });
    return router;
}
