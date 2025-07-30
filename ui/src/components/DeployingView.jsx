import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';

const DeployingView = ({ onDeploymentComplete }) => {
  const { messages, status } = useWebSocket('ws://localhost:8080');
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    // Process all new artifact messages
    const newArtifacts = messages.filter(msg => msg.type === 'artifact');
    if (newArtifacts.length > 0) {
      // Get the artifacts that aren't already in deployments
      const currentNames = deployments.map(d => d.contractName);
      const uniqueArtifacts = newArtifacts.filter(msg =>
        msg.data.contractName && !currentNames.includes(msg.data.contractName)
      );
      
      if (uniqueArtifacts.length > 0) {
        setDeployments(prev => [...prev, ...uniqueArtifacts.map(msg => msg.data)]);
      }
    }

    // Check for deployment completion (only process once)
    const deploymentCompleteMessage = messages.find(msg => msg.type === 'deploymentComplete');
    if (deploymentCompleteMessage) {
      console.log('🎉 Deployment complete, transitioning to explorer...');
      onDeploymentComplete(deploymentCompleteMessage.data);
    }
  }, [messages, deployments, onDeploymentComplete]);

  const statusInfo = {
    connecting: { text: 'Connecting to Hardhat...', color: 'text-yellow-400', icon: 'fa-spin fa-spinner' },
    open: { text: 'Watching for deployments...', color: 'text-green-400', icon: 'fa-eye' },
    closed: { text: 'Connection closed. Please restart Hardhat.', color: 'text-red-400', icon: 'fa-times-circle' },
    error: { text: 'Connection error.', color: 'text-red-400', icon: 'fa-exclamation-triangle' },
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 highlight-text">Deployment in Progress</h1>
        <div className={`flex items-center justify-center text-lg ${statusInfo[status].color}`}>
          <i className={`fas ${statusInfo[status].icon} mr-2`}></i>
          <span>{statusInfo[status].text}</span>
        </div>
      </div>
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Deployed Contracts</h2>
        <div className="space-y-4">
          {deployments.map((deployment, index) => (
            <div key={index} className="p-4 bg-gray-700 rounded-lg">
              <p className="font-bold text-lg">{deployment.contractName}</p>
              <p className="font-mono text-sm text-gray-400">{deployment.address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeployingView;
