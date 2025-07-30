# Hardhat Admin UI

A comprehensive Hardhat plugin providing a web-based admin UI for deployed smart contracts with Diamond proxy support, contract interaction, event monitoring, and deployment dashboard.

## Features

- 🌐 **Web-based Dashboard** - Comprehensive overview of all deployments, statistics, and blockchain activity
- 💎 **Diamond Proxy Support** - Full EIP-2535 Diamond standard support with facet navigation and method aggregation
- 🔍 **Contract Interaction** - Read/write contract methods with automatic ABI parsing and type validation
- 📊 **Event Monitoring** - Real-time event log viewing with deployment event tracking
- 🔧 **Multi-Network Support** - Works with any Hardhat-supported network (localhost, testnets, mainnet)
- ✅ **Contract Verification** - Integrated contract verification for supported networks
- 📱 **Responsive UI** - Modern, mobile-friendly interface built with React and Tailwind CSS

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

The Admin UI will automatically start on `http://localhost:3001` and open in your browser.

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

- `PORT` - Admin UI server port (default: 3000)
- `HARDHAT_ADMINUI_NO_LAUNCH` - Set to `'true'` to disable auto-browser launch

#### Hardhat Config Options

```typescript
// hardhat.config.ts
export default {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // Add other networks as needed
  },
  // Your other config...
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
- Check if port 3001 is available
- Set `HARDHAT_ADMINUI_NO_LAUNCH=true` to disable auto-launch
- Manually visit `http://localhost:3001`

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
