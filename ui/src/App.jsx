import React, { useState, useEffect } from 'react';
import DeployingView from './components/DeployingView';
import ExplorerView from './components/ExplorerView/ExplorerView';
import './index.css';

function App() {
  const [view, setView] = useState('loading'); // 'loading', 'deploying', or 'explorer'
  const [deployments, setDeployments] = useState([]);

  // Check for existing deployments on app startup
  useEffect(() => {
    const checkExistingDeployments = async () => {
      try {
        // Try common networks in order of likelihood
        const networksToTry = ['localhost', 'hardhat', 'mainnet', 'sepolia', 'goerli', 'polygon', 'arbitrum'];
        let foundDeployments = null;
        let activeNetwork = null;

        for (const network of networksToTry) {
          try {
            const response = await fetch(`/api/deployments/${network}`);
            if (response.ok) {
              const deployments = await response.json();
              if (deployments && deployments.length > 0) {
                foundDeployments = deployments;
                activeNetwork = network;
                break;
              }
            }
          } catch (networkError) {
            // Continue to next network
            continue;
          }
        }
        
        if (foundDeployments && foundDeployments.length > 0) {
          console.log(`🎯 Found existing deployments on ${activeNetwork} network, loading Admin UI directly`);
          setDeployments(foundDeployments);
          setView('explorer');
          return;
        }
        
        // No deployments found on any network, show deploying view
        console.log('📦 No existing deployments found on any network, showing deployment view');
        setView('deploying');
      } catch (error) {
        console.log('⚠️ Could not check for existing deployments, showing deployment view');
        setView('deploying');
      }
    };

    checkExistingDeployments();
  }, []);

  const handleDeploymentComplete = (finalDeployments) => {
    setDeployments(finalDeployments);
    setView('explorer');
  };

  // Show loading state while checking for deployments
  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Loading Hardhat Admin UI...</h2>
          <p className="text-slate-400 mt-2">Checking for existing deployments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {view === 'deploying' ? (
        <DeployingView onDeploymentComplete={handleDeploymentComplete} />
      ) : (
        <ExplorerView initialDeployments={deployments} />
      )}
    </div>
  );
}

export default App;
