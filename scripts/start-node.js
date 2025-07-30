const { spawn } = require('child_process');

const child = spawn('npx', ['hardhat', 'node'], {
  stdio: 'inherit',
  shell: true,
});

child.on('error', (error) => {
  console.error(`Error starting Hardhat node: ${error}`);
});

child.on('exit', (code) => {
  console.log(`Hardhat node exited with code ${code}`);
});
