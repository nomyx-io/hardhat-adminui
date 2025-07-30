"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const open_1 = __importDefault(require("open"));
// Import plugins to extend HRE
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
require("./hre-extension");
// Import modular route handlers
const project_1 = require("./routes/project");
const contracts_1 = require("./routes/contracts");
const deployments_1 = require("./routes/deployments");
const storage_1 = require("./routes/storage");
const transactions_1 = require("./routes/transactions");
const diamonds_1 = require("./routes/diamonds");
const dashboard_1 = require("./routes/dashboard");
const static_1 = require("./routes/static");
/**
 * Creates and configures the Express app with all routes
 */
function createApp(hre) {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Register modular routes
    app.use((0, project_1.createProjectRoutes)(hre));
    app.use((0, contracts_1.createContractsRoutes)(hre));
    app.use((0, deployments_1.createDeploymentsRoutes)(hre));
    app.use((0, storage_1.createStorageRoutes)(hre));
    app.use((0, transactions_1.createTransactionsRoutes)(hre));
    app.use((0, diamonds_1.createDiamondsRoutes)(hre));
    app.use((0, dashboard_1.createDashboardRoutes)(hre));
    // Static routes should be last to handle fallbacks
    app.use((0, static_1.createStaticRoutes)());
    return app;
}
// --- NEW COMMAND-LINE TASK ---
(0, config_1.task)("admin:contracts", "Lists all deployed contracts on a given network")
    .addOptionalParam("targetNetwork", "The network to check", "localhost", config_1.types.string)
    .setAction(async (taskArgs, hre) => {
    // Manually set the network for the HRE functions to use
    hre.network.name = taskArgs.targetNetwork;
    console.log(`\nInspecting deployments on network: ${hre.network.name}`);
    const deployments = await hre.adminUI.listDeployments();
    if (deployments.length === 0) {
        console.log("No deployments found on this network.");
        return;
    }
    console.log("\n✅ Found Deployed Contracts:");
    // Simple table format
    const table = deployments.map(d => ({
        "Contract": d.contractName,
        "Address": d.address,
        "Deployed By": d.receipt?.from.substring(0, 10) + "...",
        "Gas Used": d.receipt?.gasUsed.toString(),
    }));
    console.table(table);
    console.log("\n");
});
// --- MAIN UI TASK ---
(0, config_1.task)("admin-ui", "Starts the Admin UI server").setAction(async (_, hre) => {
    const app = createApp(hre);
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`\nHardhat Admin UI server started on http://localhost:${port}`);
    });
    await new Promise(() => { });
});
// --- OVERRIDE NODE TASK TO INCLUDE ADMIN UI ---
(0, config_1.task)("node", "Starts a JSON-RPC server with the Admin UI")
    .setAction(async (taskArgs, hre, runSuper) => {
    console.log("🚀 Starting Hardhat development node with Admin UI...");
    // Start the original Hardhat node task in background
    const nodePromise = runSuper(taskArgs);
    // Give the node a moment to start up
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Start the Admin UI server using the modular app
    console.log("🌐 Starting Admin UI server...");
    const app = createApp(hre);
    const port = process.env.PORT || 3000;
    app.listen(port, async () => {
        const apiUrl = `http://localhost:${port}`;
        const uiUrl = `http://localhost:3001`;
        console.log(`\n✅ Hardhat Admin UI server started on ${apiUrl}`);
        console.log(`📊 Node RPC available at http://localhost:8545`);
        // Auto-launch browser unless disabled
        const shouldLaunch = process.env.HARDHAT_ADMINUI_NO_LAUNCH !== 'true';
        if (shouldLaunch) {
            try {
                console.log(`\n🌐 Opening browser at ${uiUrl}...`);
                await (0, open_1.default)(uiUrl);
                console.log(`✅ Browser launched successfully`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn(`⚠️  Failed to launch browser automatically: ${errorMessage}`);
                console.log(`Please open your browser manually and visit: ${uiUrl}`);
            }
        }
        console.log(`\n🎯 Your development environment is ready!`);
        if (!shouldLaunch) {
            console.log(`💡 Browser auto-launch disabled. Visit: ${uiUrl}`);
        }
    });
    // Wait for both the node and UI server to run
    await nodePromise;
});
// Note: HRE extension is implemented in ./hre-extension.ts and imported above
