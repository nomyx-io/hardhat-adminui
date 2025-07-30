import React from 'react';
import DeploymentItem from './DeploymentItem';

const DeploymentList = ({
  deployments,
  selectedDeployment,
  onSelectDeployment,
  favorites,
  onToggleFavorite,
  onSelectFacet,
  selectedFacet,
  currentView
}) => {
  const favoriteDeployments = deployments.filter(d => favorites.includes(d.contractName));
  const otherDeployments = deployments.filter(d => !favorites.includes(d.contractName));

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-gray-300">Contracts</h2>
        <span className="text-xs bg-gray-700 px-2 py-1 rounded">{deployments.length} artifacts</span>
      </div>
      <div className="space-y-1">
        {favoriteDeployments.map((deployment) => (
          <DeploymentItem
            key={deployment.contractName}
            deployment={deployment}
            isSelected={currentView === 'contract' && selectedDeployment?.contractName === deployment.contractName}
            onSelect={() => onSelectDeployment(deployment)}
            isFavorite={true}
            onToggleFavorite={onToggleFavorite}
            onSelectFacet={onSelectFacet}
            selectedFacet={selectedFacet}
          />
        ))}
        {otherDeployments.map((deployment) => (
          <DeploymentItem
            key={deployment.contractName}
            deployment={deployment}
            isSelected={currentView === 'contract' && selectedDeployment?.contractName === deployment.contractName}
            onSelect={() => onSelectDeployment(deployment)}
            isFavorite={false}
            onToggleFavorite={onToggleFavorite}
            onSelectFacet={onSelectFacet}
            selectedFacet={selectedFacet}
          />
        ))}
      </div>
    </div>
  );
};

export default DeploymentList;
