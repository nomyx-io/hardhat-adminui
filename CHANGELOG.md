# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-30

### Added
- **Comprehensive Scenario Testing System**
  - New scenario runner interface with dedicated UI panel
  - Batch execution capability for running multiple scenarios simultaneously
  - Real-time progress monitoring with live status updates
  - Rich visual report viewer with detailed analytics
  - Persistent execution history with searchable results
  - Export functionality for downloading reports in JSON format
  - Built-in scenario editor with syntax highlighting
  - Template system for common testing patterns
  - Real-time validation and error checking

- **Enhanced Dashboard Features**
  - Recent Scenario Runs panel showing last 5 executions
  - "Run All Scenarios" button for one-click execution
  - Enhanced metrics integrating scenario statistics
  - Improved navigation with shortcuts to scenario runner
  - Professional empty states and loading indicators
  - Better error handling and user feedback

- **Advanced Scenario Management**
  - Automatic file discovery in `scenarios/` directory
  - Support for complex scenario structures with metadata
  - State management with variable substitution
  - Account role management and funding
  - Setup and teardown hooks
  - Error testing with expected failure conditions
  - Environment variable support
  - Network-agnostic scenario design

- **Improved Navigation and UX**
  - Scenario Runner menu item in main sidebar
  - Integrated navigation between contracts, scenarios, and reports
  - Consistent styling with artifact-card design system
  - Enhanced visual feedback and status indicators
  - Professional placeholder content replacement
  - Improved responsive design

- **Backend Infrastructure**
  - New scenario history service with JSON persistence
  - Enhanced scenario engine with batch execution support
  - Comprehensive API endpoints for scenario management
  - Real-time polling system for execution monitoring
  - Robust error handling and timeout management
  - UUID-based execution tracking

- **API Enhancements**
  - `GET /api/scenarios` - List available scenarios
  - `GET /api/scenarios/:name` - Get specific scenario details
  - `POST /api/scenarios` - Create new scenarios
  - `PUT /api/scenarios/:name` - Update existing scenarios
  - `POST /api/scenarios/run-batch` - Execute scenario batches
  - `GET /api/scenarios/history` - Get execution history
  - `GET /api/scenarios/history/:id` - Get detailed reports

### Enhanced
- **Dashboard Integration**
  - Added scenario statistics to main dashboard
  - Integrated recent runs panel alongside contract metrics
  - Enhanced contract type overview with better navigation
  - Improved dashboard loading states and error handling

- **User Interface Polish**
  - Replaced placeholder content with professional guidance
  - Enhanced error states with retry mechanisms
  - Improved loading animations and visual feedback
  - Better disabled states during operations
  - Consistent icon usage throughout the interface

- **Code Quality Improvements**
  - Removed unused variables and functions
  - Fixed ESLint warnings
  - Enhanced error boundary handling
  - Improved component structure and modularity
  - Better TypeScript type definitions

### Fixed
- Removed mock data and placeholder text throughout the application
- Fixed navigation issues between different views
- Improved error handling in scenario execution
- Enhanced responsive design for mobile devices
- Fixed potential memory leaks in polling operations
- **Fixed WebSocket Port Conflicts** - Resolved EADDRINUSE errors with dynamic WebSocket port assignment
- **Fixed Scenario Discovery** - Enhanced scenario file detection to prevent "Scenario not found" errors
- **Fixed Legacy Scenario Support** - Backward compatibility with existing .js scenario files

### Documentation
- **Comprehensive README Updates**
  - Added detailed scenario testing documentation
  - Included complete API reference for scenarios
  - Added advanced configuration examples
  - Provided best practices for scenario organization
  - Enhanced troubleshooting section
  - Added performance optimization tips

- **API Documentation**
  - Complete endpoint documentation with examples
  - Scenario execution flow diagrams
  - Request/response format specifications
  - Error code definitions

- **Development Documentation**
  - Enhanced setup instructions
  - Improved contribution guidelines
  - Added development workflow documentation
  - Created comprehensive changelog

### Technical Improvements
- Enhanced build process for production deployment
- Improved error logging and debugging capabilities
- Better separation of concerns in component architecture
- Enhanced state management for complex operations
- Optimized bundle size and performance
- **Smart Port Management** - Automatic port detection and fallback mechanisms
- **Configuration System** - Flexible port configuration via environment variables or config files
- **Enhanced Error Messages** - Better user guidance when ports are unavailable
- **Network Resilience** - Improved handling of port conflicts and network issues

### Dependencies
- Added `uuid` package for unique execution ID generation
- Added `@types/uuid` for TypeScript support
- Updated existing dependencies for security and compatibility

### Infrastructure Improvements
- **Dynamic Port Assignment** - Automatic port detection with intelligent fallback for both HTTP and WebSocket servers
- **Flexible Configuration** - Support for environment variables and Hardhat config
- **Enhanced Error Handling** - Better error messages and recovery guidance
- **Smart Port Discovery** - Automatically finds next available port when default is occupied
- **WebSocket Port Management** - Automatic WebSocket server port detection to prevent EADDRINUSE errors
- **Configuration Priority** - Environment variable > Hardhat config > Default (3000 for HTTP, 8080 for WebSocket)
- **Scenario File Discovery** - Improved scenario loading with support for both .scenario.json and legacy .js files

## [0.9.0] - Previous Release

### Added
- Initial web-based dashboard
- Diamond proxy support (EIP-2535)
- Contract interaction interface
- Event monitoring capabilities
- Multi-network support
- Contract verification integration
- Responsive UI with React and Tailwind CSS

### Core Features
- Contract deployment tracking
- Method execution with parameter validation
- Real-time event streaming
- Network switching capabilities
- Comprehensive contract inspection

---

## Release Notes

### Version 1.0.0 - Major Feature Release

This release introduces a comprehensive scenario testing system that transforms the Hardhat Admin UI into a complete development and testing platform. The new scenario runner enables automated testing workflows with visual reporting and persistent history tracking.

**Key Highlights:**
- 🧪 Complete scenario testing framework
- 🚀 Dedicated scenario runner interface  
- 📈 Rich visual reporting with analytics
- 📋 Persistent execution history
- ⚡ Batch execution capabilities
- 🔄 Real-time progress monitoring

**Breaking Changes:** None - This release is fully backward compatible.

**Migration Guide:** No migration required. New features are additive and work alongside existing functionality.

**System Requirements:**
- Node.js 16+
- npm or yarn
- Hardhat project with deployed contracts
- Modern web browser with ES6 support
- Available network port (default: 3000, auto-detects if occupied)

**Performance Improvements:**
- Optimized UI rendering for large scenario suites
- Enhanced polling mechanisms for real-time updates
- Improved memory management for long-running executions
- Better error handling and recovery mechanisms
- Smart port detection for faster startup times
- Reduced network conflicts through intelligent port management

**Configuration Enhancements:**
- Support for `HARDHAT_ADMINUI_PORT` environment variable
- Hardhat config integration with `adminUI.port` setting
- Automatic port increment when configured port is occupied
- Clear console feedback about port selection and conflicts

This release represents a significant milestone in making the Hardhat Admin UI a comprehensive development tool suitable for both simple contract interaction and complex automated testing workflows. The enhanced port management ensures seamless deployment in various development environments.
