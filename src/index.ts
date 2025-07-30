import { extendEnvironment, task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { AdminUIDeployment } from "./hre-extension";
import express from "express";
import path from "path";
import * as fs from "fs-extra";
import cors from "cors";
import open from "open";

// Import plugins to extend HRE
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";

import "./hre-extension";

// Import modular route handlers
import { createProjectRoutes } from "./routes/project";
import { createContractsRoutes } from "./routes/contracts";
import { createDeploymentsRoutes } from "./routes/deployments";
import { createStorageRoutes } from "./routes/storage";
import { createTransactionsRoutes } from "./routes/transactions";
import { createDiamondsRoutes } from "./routes/diamonds";
import { createDashboardRoutes } from "./routes/dashboard";
import { createStaticRoutes } from "./routes/static";

/**
 * Creates and configures the Express app with all routes
 */
function createApp(hre: HardhatRuntimeEnvironment): express.Application {
    const app = express();
    
    app.use(cors());
    app.use(express.json());

    // Register modular routes
    app.use(createProjectRoutes(hre));
    app.use(createContractsRoutes(hre));
    app.use(createDeploymentsRoutes(hre));
    app.use(createStorageRoutes(hre));
    app.use(createTransactionsRoutes(hre));
    app.use(createDiamondsRoutes(hre));
    app.use(createDashboardRoutes(hre));
    
    // Static routes should be last to handle fallbacks
    app.use(createStaticRoutes());

    return app;
}

// --- NEW COMMAND-LINE TASK ---
task("admin:contracts", "Lists all deployed contracts on a given network")
  .addOptionalParam("targetNetwork", "The network to check", "localhost", types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
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
task("admin-ui", "Starts the Admin UI server").setAction(async (_, hre: HardhatRuntimeEnvironment) => {
    const app = createApp(hre);
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`\nHardhat Admin UI server started on http://localhost:${port}`);
    });

    await new Promise(() => {});
});

// --- OVERRIDE NODE TASK TO INCLUDE ADMIN UI ---
task("node", "Starts a JSON-RPC server with the Admin UI")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment, runSuper) => {
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
                await open(uiUrl);
                console.log(`✅ Browser launched successfully`);
            } catch (error) {
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
