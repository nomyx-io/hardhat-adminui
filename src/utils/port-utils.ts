import { createServer } from 'net';

/**
 * Check if a port is available
 */
export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Find the next available port starting from the given port
 */
export async function findAvailablePort(startPort: number, maxPort: number = 65535): Promise<number> {
  for (let port = startPort; port <= maxPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found between ${startPort} and ${maxPort}`);
}

/**
 * Get the configured port from environment or hardhat config
 */
export function getConfiguredPort(hre: any): number {
  // Check environment variable first
  if (process.env.HARDHAT_ADMINUI_PORT) {
    const envPort = parseInt(process.env.HARDHAT_ADMINUI_PORT, 10);
    if (!isNaN(envPort) && envPort > 0 && envPort <= 65535) {
      return envPort;
    }
  }

  // Check hardhat config
  if (hre.config?.adminUI?.port) {
    const configPort = parseInt(hre.config.adminUI.port, 10);
    if (!isNaN(configPort) && configPort > 0 && configPort <= 65535) {
      return configPort;
    }
  }

  // Default port
  return 3000;
}
