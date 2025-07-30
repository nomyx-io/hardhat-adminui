import { extendEnvironment, task } from "hardhat/config";
import { HardhatUserConfig, HardhatRuntimeEnvironment } from "hardhat/types";
import express from "express";
import path from "path";
import fs from "fs-extra";
import cors from "cors";

import "./hre-extension";

task("admin-ui", "Starts the Admin UI server").setAction(async (_, hre: HardhatRuntimeEnvironment) => {
    const app = express();
    const port = process.env.PORT || 3000;

    // Use CORS to allow requests from the React dev server (on a different port)
    app.use(cors());
    app.use(express.json());

    // --- API Endpoints ---

    // API endpoint to get a list of all contract artifacts
    app.get("/api/contracts", async (req, res) => {
        try {
            const artifactsPath = hre.config.paths.artifacts;
            const contractNames = await hre.artifacts.getAllFullyQualifiedNames();

            const contracts = await Promise.all(contractNames.map(async (name) => {
                const artifact = await hre.artifacts.readArtifact(name);
                // Filter out debug files
                if (artifact.sourceName.endsWith('.dbg.json')) {
                    return null;
                }
                return {
                    contractName: artifact.contractName,
                    sourceName: artifact.sourceName,
                    abi: artifact.abi,
                };
            }));

            res.json(contracts.filter(c => c !== null)); // Filter out nulls before sending
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to read contract artifacts." });
        }
    });

    // API endpoint to get deployment information for a specific contract
    app.get("/api/deployments/:network/:contractName", (req, res) => {
        const { network, contractName } = req.params;
        const deploymentsPath = path.join(hre.config.paths.deployments, network, `${contractName}.json`);

        try {
            if (fs.existsSync(deploymentsPath)) {
                const deployment = fs.readJSONSync(deploymentsPath);
                res.json(deployment);
            } else {
                res.status(404).json({ error: `Deployment not found for ${contractName} on network ${network}` });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to read deployment file." });
        }
    });

    // --- Static UI Serving ---

    // Define the path to the built React app
    const uiBuildPath = path.join(__dirname, '..', 'ui', 'build');

    // Serve the static files from the React app build directory
    app.use(express.static(uiBuildPath));

    // For any other request, serve the index.html file so client-side routing works
    app.get('*', (req, res) => {
        const indexPath = path.join(uiBuildPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send(
                `<h1>Hardhat Admin UI</h1>
                 <p>UI not found. Please run <strong>npm run build</strong> in the plugin directory.</p>
                 <p>Expected path: ${uiBuildPath}</p>`
            );
        }
    });


    app.listen(port, () => {
        console.log(`\nHardhat Admin UI server started on http://localhost:${port}`);
        console.log(`Serving artifacts from: ${hre.config.paths.artifacts}`);
        console.log(`Serving deployments from: ${hre.config.paths.deployments}\n`);
    });

    // Keep the task running so the server stays up
    await new Promise(() => {});
});

// Extend the Hardhat Runtime Environment
extendEnvironment((hre: HardhatRuntimeEnvironment) => {
  hre.adminUI = {
    getProjectInfo: () => {
      return {
        name: "Hardhat Project", // In a real scenario, you might parse package.json
        hardhatVersion: hre.version,
        networks: Object.keys(hre.config.networks),
      };
    },
  };
});
