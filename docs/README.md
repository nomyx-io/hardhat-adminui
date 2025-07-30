# Hardhat Admin UI

The Hardhat Admin UI is a powerful and intuitive interface for managing and interacting with your smart contract deployments. It provides a comprehensive set of tools to streamline your development workflow, from real-time deployment monitoring to advanced contract interaction.

## Installation

To install the Hardhat Admin UI, run the following command in your Hardhat project's root directory:

```bash
npm install hardhat-admin-ui
```

Then, add the following to your `hardhat.config.js` file:

```javascript
require("hardhat-admin-ui");
```

## How to Use

To start the Admin UI for production, run the following command:

```bash
npx hardhat admin-ui
```

This will serve the built UI.

### Development Mode

For development, you can run the UI with hot-reloading. This will start the Hardhat node and the React dev server concurrently.

```bash
npm run dev
```

## Features

### Real-time Deployment View

When you run a deployment script, the Admin UI will automatically open to a "Deployment in Progress" view. This view monitors your `deployments` directory and displays new contract artifacts as they are created, providing real-time feedback on your deployment's progress.

### Contract Explorer

The main explorer view provides a comprehensive overview of your deployed contracts. It includes:

*   **Sidebar**: A list of all deployed contracts, with support for favorites and global search.
*   **Network Quick-Connect**: Easily switch between different networks to view their deployments.
*   **Contract Header**: Displays the name and address of the selected contract.
*   **Tabs**: A set of tabs for exploring different aspects of the contract:
    *   **Overview**: Displays key details about the contract and its deployment.
    *   **ABI**: The contract's ABI, with a copy button.
    *   **Bytecode**: The contract's bytecode, with a copy button.
    *   **Methods**: An interactive list of all contract methods, with support for complex data types.
    *   **Storage**: An interactive view of the contract's storage layout, allowing you to query any storage slot.
    *   **Diamond**: For Diamond contracts, this tab displays the facets and their functions.

### Interactive Storage Inspection

The "Storage" tab allows you to inspect the storage of your contracts. You can view the storage layout and query any storage slot to see its current value.

### Advanced Contract Interaction

The "Methods" tab provides a powerful interface for interacting with your contracts. It supports:

*   **Read and write methods**: Clearly separated for easy identification.
*   **Complex data types**: Input arrays and structs in JSON format.
*   **Payable functions**: An input field for specifying the amount of ETH to send with a transaction.

### Favorites System

You can mark contracts as favorites for easy access. Favorite contracts are displayed at the top of the sidebar.

### Global Search

The sidebar includes a search bar that allows you to filter deployments by name.
