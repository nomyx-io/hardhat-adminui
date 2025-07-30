# Hardhat Admin UI

A comprehensive Hardhat plugin providing a web-based admin UI for deployed smart contracts with Diamond proxy support, contract interaction, event monitoring, and deployment dashboard.

## Features

### Core Functionality
- 🌐 **Web-based Dashboard** - Comprehensive overview of all deployments, statistics, and blockchain activity
- 💎 **Diamond Proxy Support** - Full EIP-2535 Diamond standard support with facet navigation and method aggregation
- 🔍 **Contract Interaction** - Read/write contract methods with automatic ABI parsing and type validation
- 📊 **Event Monitoring** - Real-time event log viewing with deployment event tracking
- 🔧 **Multi-Network Support** - Works with any Hardhat-supported network (localhost, testnets, mainnet)
- ✅ **Contract Verification** - Integrated contract verification for supported networks
- 📱 **Responsive UI** - Modern, mobile-friendly interface built with React and Tailwind CSS

### Advanced Testing & Automation
- 🧪 **Scenario Testing System** - Comprehensive automated test scenario execution framework
- 🚀 **Scenario Runner** - Dedicated interface for running and monitoring test scenarios
- 📈 **Execution Reporting** - Detailed test reports with visual analytics and export capabilities
- 📋 **Execution History** - Persistent history of all scenario runs with searchable results
- ⚡ **Batch Execution** - Run multiple scenarios simultaneously with real-time progress tracking
- 📝 **Scenario Editor** - Built-in editor for creating and modifying test scenarios
- 🔄 **Live Updates** - Real-time status updates during scenario execution

### Enhanced Dashboard Features
- 📊 **Recent Scenario Runs Panel** - Quick overview of recent test executions
- 🎯 **Quick Actions** - One-click scenario execution and batch operations
- 📈 **Enhanced Metrics** - Comprehensive statistics across contracts and test runs
- 🔗 **Integrated Navigation** - Seamless switching between contracts, scenarios, and reports

## Installation

```bash
npm install @nomyx/hardhat-adminui
```

## Quick Start

1. **Add the plugin to your Hardhat config:**

```typescript
// hardhat.config.ts
import "@nomyx/hardhat-adminui";

export default {
  // Your existing Hardhat config
};
```

2. **Start your development node with Admin UI:**

```bash
npx hardhat node
```

The Admin UI will automatically start on `http://localhost:3000` (or next available port) and open in your browser.

## Usage

### Starting the Admin UI

#### With Hardhat Node (Recommended)
```bash
npx hardhat node
```
This starts both the Hardhat node and Admin UI together.

#### Standalone Admin UI
```bash
npx hardhat admin-ui
```
This starts only the Admin UI server (requires existing node).

#### Command Line Contract Inspector
```bash
npx hardhat admin:contracts --target-network localhost
```
Lists all deployed contracts on the specified network.

### Configuration

#### Environment Variables

- `HARDHAT_ADMINUI_PORT` - Admin UI server port (default: 3000, auto-increments if port is in use)
- `HARDHAT_ADMINUI_NO_LAUNCH` - Set to `'true'` to disable auto-browser launch

#### Hardhat Config Options

```typescript
// hardhat.config.ts
export default {
  // Admin UI Configuration
  adminUI: {
    port: 3000, // Custom port for Admin UI (optional)
  },
  
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // Add other networks as needed
  },
  // Your other config...
};
```

#### Port Configuration

The Admin UI supports flexible port configuration with automatic port detection:

1. **Default Behavior**: Starts on port 3000, automatically finds next available port if occupied
2. **Environment Variable**: Set `HARDHAT_ADMINUI_PORT=4000` to specify a custom port
3. **Hardhat Config**: Configure `adminUI.port` in your hardhat.config.ts
4. **Priority Order**: Environment variable > Hardhat config > Default (3000)

**Examples:**

```bash
# Use environment variable
HARDHAT_ADMINUI_PORT=4000 npx hardhat node

# The Admin UI will try port 4000, then 4001, 4002, etc. until it finds an available port
```

```typescript
// hardhat.config.ts - Use config file
export default {
  adminUI: {
    port: 5000
  }
};
```

## Features Guide

### Dashboard

The dashboard provides an at-a-glance view of your project:

- **Contract Statistics** - Total contracts, verification status, deployment costs
- **Transaction Activity** - Transaction counts and gas usage analytics  
- **Event Monitoring** - Recent events across all contracts
- **Quick Actions** - Contract verification, network switching

### Contract Interaction

#### Standard Contracts
- View all contract methods (read/write)
- Interactive method execution with parameter validation
- Transaction history and event logs
- ABI viewer with method signatures

#### Diamond Contracts (EIP-2535)
- **Facet Navigation** - Browse individual facets and their methods
- **Method Aggregation** - Unified view of all Diamond methods
- **Facet Management** - View facet addresses and selectors
- **Diamond Inspector** - Comprehensive Diamond state analysis

### Event Monitoring

- **Real-time Event Logs** - Live event streaming from deployed contracts
- **Deployment Events** - Track contract deployment and initialization events
- **Event Filtering** - Filter by contract, event type, or time range
- **Transaction Context** - View events within their transaction context

### Scenario Testing System

The Admin UI includes a comprehensive scenario testing framework that enables automated testing workflows:

#### Scenario Runner Interface
- **Dedicated UI Panel** - Full-featured scenario management interface accessible from the main navigation
- **Batch Execution** - Select and run multiple test scenarios simultaneously
- **Real-time Progress Monitoring** - Live updates with execution status, progress indicators, and step-by-step tracking
- **Visual Report Viewer** - Rich, interactive test reports with detailed analytics
- **Execution History** - Persistent storage and browsing of all scenario runs
- **Export Functionality** - Download detailed reports in JSON format for external analysis

#### Dashboard Integration
- **Recent Runs Panel** - Quick overview of the last 5 scenario executions on the main dashboard
- **Run All Scenarios Button** - One-click execution of all available scenarios
- **Execution Metrics** - Integrated scenario statistics alongside contract deployment data
- **Navigation Shortcuts** - Quick access to scenario runner from multiple UI locations

#### Scenario Management
- **Smart File Discovery** - Automatic detection of scenario files in the `scenarios/` directory
  - Preferred: `.scenario.json` files for new scenarios
  - Legacy Support: `.js` files containing "test" or "scenario" in filename
- **Built-in Editor** - Create and modify scenarios directly in the UI with syntax highlighting
- **Template System** - Pre-built scenario templates for common testing patterns
- **Validation** - Real-time scenario validation and error checking

#### Creating and Structuring Scenarios

##### 1. Directory Structure
```
your-hardhat-project/
├── scenarios/
│   ├── simple-storage.scenario.json     # Preferred: JSON format
│   ├── erc20-token.scenario.json        # Preferred: JSON format
│   ├── legacy-tests.js                  # Legacy: JS files (must contain "test" or "scenario")
│   └── diamond-scenarios.js             # Legacy: JS files (must contain "test" or "scenario")
├── contracts/
└── deployments/
```

**File Naming Conventions:**
- **New scenarios**: Use `.scenario.json` extension (e.g., `token-tests.scenario.json`)
- **Legacy scenarios**: `.js` files must contain "test" or "scenario" in the filename
- **Ignored files**: Regular `.js` files without "test" or "scenario" keywords are ignored

##### 2. Scenario File Format

**New Format (.scenario.json):**
```json
{
  "version": "2.0",
  "metadata": {
    "name": "Comprehensive ERC20 Tests",
    "description": "Full test suite for ERC20 token functionality",
    "author": "Development Team",
    "tags": ["erc20", "tokens", "comprehensive"],
    "requirements": ["MyToken deployment"]
  },
  "config": {
    "timeout": 60000,
    "retries": 2,
    "parallel": false,
    "network": "localhost",
    "environment": {
      "INITIAL_SUPPLY": "1000000"
    }
  },
  "setup": {
    "contracts": [
      {
        "name": "MyToken",
        "deployment": {
          "contractName": "ERC20Token",
          "args": ["MyToken", "MTK", "1000000"]
        }
      }
    ]
  },
  "scenarios": [
    {
      "name": "Token Transfer Tests",
      "description": "Test basic token transfer functionality",
      "steps": [
        {
          "description": "Transfer tokens to user1",
          "task": "contract:call",
          "params": {
            "contract": "MyToken",
            "method": "transfer",
            "args": ["${accounts.user1}", "1000"],
            "from": "${accounts.owner}"
          }
        }
      ]
    }
  ]
}
```

**Legacy Format (.js files):**
```javascript
module.exports = {
  version: "2.0",
  metadata: {
    name: "Comprehensive ERC20 Tests",
    description: "Full test suite for ERC20 token functionality",
    author: "Development Team",
    tags: ["erc20", "tokens", "comprehensive"],
    requirements: ["MyToken deployment"]
  },
  
  config: {
    timeout: 60000,        // 60 second timeout
    retries: 2,            // Retry failed steps twice
    parallel: false,       // Run scenarios sequentially
    network: "localhost",  // Target network
    environment: {
      // Custom environment variables
      INITIAL_SUPPLY: "1000000"
    }
  },
  
  setup: {
    contracts: [
      {
        name: "MyToken",
        deployment: {
          contractName: "ERC20Token",
          args: ["MyToken", "MTK", "1000000"]
        }
      }
    ],
    accounts: {
      count: 5,
      roles: ["owner", "user1", "user2", "spender", "receiver"],
      funding: "10000" // ETH to fund each account
    },
    hooks: {
      before: [
        {
          task: "setup:accounts",
          params: { count: 5 }
        }
      ]
    }
  },
  
  scenarios: [
    {
      name: "Token Transfer Tests",
      description: "Test basic token transfer functionality",
      steps: [
        {
          description: "Check initial balance",
          task: "contract:call",
          params: {
            contract: "MyToken",
            method: "balanceOf",
            args: ["${accounts.owner}"]
          }
        },
        {
          description: "Transfer tokens to user1",
          task: "contract:call",
          params: {
            contract: "MyToken",
            method: "transfer",
            args: ["${accounts.user1}", "1000"],
            from: "${accounts.owner}"
          }
        },
        {
          description: "Verify transfer completed",
          task: "contract:call",
          params: {
            contract: "MyToken",
            method: "balanceOf",
            args: ["${accounts.user1}"]
          }
        }
      ]
    },
    {
      name: "Approval and TransferFrom Tests",
      description: "Test approval-based transfers",
      steps: [
        {
          description: "Approve spender",
          task: "contract:call",
          params: {
            contract: "MyToken",
            method: "approve",
            args: ["${accounts.spender}", "500"],
            from: "${accounts.user1}"
          }
        },
        {
          description: "Transfer on behalf",
          task: "contract:call",
          params: {
            contract: "MyToken",
            method: "transferFrom",
            args: ["${accounts.user1}", "${accounts.receiver}", "300"],
            from: "${accounts.spender}"
          }
        }
      ]
    },
    {
      name: "Error Condition Tests",
      description: "Test expected failure scenarios",
      steps: [
        {
          description: "Attempt transfer with insufficient balance",
          task: "contract:call",
          params: {
            contract: "MyToken",
            method: "transfer",
            args: ["${accounts.user2}", "999999999"],
            from: "${accounts.user1}"
          },
          shouldFail: true,
          expectedError: "insufficient balance"
        }
      ]
    }
  ],
  
  teardown: {
    hooks: [
      {
        task: "cleanup:contracts",
        params: {}
      }
    ]
  }
};
```

##### 3. Advanced Features

**State Management and Variables**
- Use `${variable}` syntax to reference dynamic values
- Access account addresses with `${accounts.roleName}`
- Store and retrieve values between steps
- Environment variable substitution

**Error Testing**
- `shouldFail: true` - Expect the operation to fail
- `expectedError: "message"` - Verify specific error messages
- Automatic failure detection and reporting

**Hooks and Lifecycle**
- `setup.hooks.before` - Run before scenario execution
- `setup.hooks.after` - Run after scenario completion  
- `teardown.hooks` - Cleanup operations
- Custom hook tasks for complex setups

#### Execution and Monitoring

##### Running Scenarios
1. **Via Dashboard**: Click "Run All Scenarios" or navigate to Scenario Runner
2. **Via Scenario Runner**: Select specific scenarios and click "Run Selected"
3. **Individual Execution**: Run single scenarios from the scenarios view

##### Real-time Monitoring
- **Progress Indicators**: Visual progress bars and status updates
- **Live Logs**: Real-time step execution logs and outputs
- **Status Tracking**: Per-step and overall execution status
- **Error Reporting**: Immediate error detection and detailed reporting

##### Execution Reports
- **Summary View**: High-level pass/fail statistics and timing
- **Detailed View**: Step-by-step execution details with logs
- **Raw Data**: Complete execution data in JSON format
- **Export Options**: Download reports for external analysis or CI integration

#### History and Analytics
- **Persistent Storage**: All execution history stored in `.scenarios-history.json`
- **Search and Filter**: Find specific executions by status, date, or scenario name
- **Trend Analysis**: Track test performance and reliability over time
- **CI Integration**: Export data for continuous integration reporting

### Multi-Network Support

Switch between networks seamlessly:
- Localhost development
- Ethereum testnets (Goerli, Sepolia, etc.)
- Ethereum mainnet
- Layer 2 networks (Polygon, Arbitrum, etc.)
- Custom networks

## Development Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Hardhat project with deployed contracts

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/nomyx-io/hardhat-adminui.git
cd hardhat-adminui
```

2. **Install dependencies:**
```bash
npm install
cd ui && npm install && cd ..
```

3. **Build the project:**
```bash
npm run build
```

4. **Start development mode:**
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

This builds both the backend TypeScript and frontend React application.

## API Reference

The Admin UI exposes several API endpoints for programmatic access:

### Deployments
- `GET /api/deployments/:network` - List all deployments
- `GET /api/deployments/:network/:contractName` - Get specific deployment

### Contracts  
- `GET /api/contracts/:network/:contractName` - Get contract details
- `POST /api/contracts/:network/:contractName/call` - Call contract method
- `GET /api/contracts/:network/:contractName/events` - Get contract events

### Dashboard
- `GET /api/dashboard/:network` - Get dashboard statistics
- `POST /api/verify-contracts/:network` - Verify contracts

### Diamonds
- `GET /api/diamonds/:network/:contractName/facets` - Get Diamond facets
- `GET /api/diamonds/:network/:contractName/methods` - Get aggregated methods

### Scenarios
- `GET /api/scenarios` - List available scenarios
- `GET /api/scenarios/:name` - Get specific scenario details
- `POST /api/scenarios` - Create a new scenario
- `PUT /api/scenarios/:name` - Update existing scenario
- `POST /api/scenarios/run-batch` - Execute multiple scenarios in batch
- `GET /api/scenarios/history` - Get complete execution history
- `GET /api/scenarios/history/:id` - Get detailed execution report

#### Scenario Execution Flow
```javascript
// 1. Start batch execution
POST /api/scenarios/run-batch
{
  "scenarios": ["token-tests", "marketplace-tests"]
}
// Returns: { executionId: "exec-2025-01-30-uuid", message: "Execution started" }

// 2. Poll for progress (or use WebSocket for real-time updates)
GET /api/scenarios/history/exec-2025-01-30-uuid
// Returns: Live execution status and progress

// 3. Get final results
GET /api/scenarios/history/exec-2025-01-30-uuid
// Returns: Complete execution report with all scenario results
```

## Plugin Integration

### Required Plugins

The Admin UI requires these Hardhat plugins:

```typescript
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
```

### Optional Integrations

#### Hardhat Deploy
Enhanced deployment tracking and artifact management.

#### OpenZeppelin Contracts
Automatic recognition of standard contract patterns.

#### Diamond Plugins
Improved Diamond contract detection and analysis.

## Troubleshooting

### Common Issues

**UI doesn't start automatically**
- Check if your configured port is available (default: 3000)
- The system automatically finds the next available port if the default is occupied
- Set `HARDHAT_ADMINUI_NO_LAUNCH=true` to disable auto-launch
- Check the console output for the actual port being used
- Manually visit the URL shown in the console output

**No contracts showing**
- Ensure contracts are deployed using `hardhat-deploy` or similar
- Check that deployment artifacts exist in `deployments/` directory
- Verify correct network selection

**Diamond contracts not detected**
- Ensure Diamond contracts implement EIP-2535 standard
- Check that facet interfaces are properly deployed
- Verify Diamond contract has `diamondCut` function

**Events not loading**
- Ensure your RPC provider supports event log queries
- Check that contracts have been deployed and have generated events
- Verify network connectivity

### Performance Tips

- Use `--max-old-space-size=4096` for large projects
- Consider using IPFS for large contract metadata
- Enable caching for frequently accessed contract data
- For large scenario suites, use selective execution rather than running all scenarios
- Monitor scenario execution history to identify performance bottlenecks
- Use parallel scenario execution when tests are independent

### Scenario Testing Best Practices

**Organizing Scenarios**
- Group related tests in the same scenario file
- Use descriptive names and comprehensive metadata
- Tag scenarios by functionality, priority, or test type
- Keep individual scenarios focused and atomic

**Writing Effective Tests**
- Use descriptive step descriptions for better reporting
- Test both success and failure conditions
- Verify state changes after each significant operation
- Include cleanup steps to maintain test isolation

**Managing Test Data**
- Use setup hooks for consistent test environments
- Leverage account roles for clear test intentions  
- Store commonly used values in environment variables
- Design scenarios to be network-agnostic when possible

**Continuous Integration**
- Export scenario reports for CI pipeline integration
- Set up automated scenario execution on deployment
- Monitor scenario success rates over time
- Use scenario tags to run different test suites for different environments

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📚 [Documentation](https://github.com/nomyx-io/hardhat-adminui/wiki)
- 🐛 [Issue Tracker](https://github.com/nomyx-io/hardhat-adminui/issues)
- 💬 [Discord Community](https://discord.gg/nomyx)
- 🐦 [Twitter](https://twitter.com/nomyx_io)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

---

Built with ❤️ by [Nomyx](https://nomyx.io)
