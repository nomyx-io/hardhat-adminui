import React, { useState, useEffect } from 'react';

// Helper function to detect Diamond contracts consistently
const isDiamondContract = (deployment) => {
  return deployment.contractName === 'Diamond' ||
    deployment.abi.some(item =>
      item.name === 'diamondCut' ||
      item.name === 'facets' ||
      item.name === 'facetAddress' ||
      item.name === 'facetFunctionSelectors' ||
      (item.type === 'event' && item.name === 'DiamondCut') ||
      (item.type === 'fallback') ||
      (item.type === 'function' && item.name === 'diamondAddress')
    );
};

const DeploymentItem = ({ deployment, isSelected, onSelect, isFavorite, onToggleFavorite, onSelectFacet, selectedFacet }) => {
  const [facets, setFacets] = useState([]);
  const [loadingFacets, setLoadingFacets] = useState(false);
  
  const isDiamond = isDiamondContract(deployment);
  
  const iconClass = isDiamond ? "fas fa-gem text-yellow-500" : "fas fa-file-contract text-primary";

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(deployment.contractName);
  };

  // Fetch facets when diamond is selected
  useEffect(() => {
    if (isDiamond && isSelected && facets.length === 0) {
      setLoadingFacets(true);
      fetch(`/api/diamonds/${deployment.network}/${deployment.address}/facets`)
        .then(response => response.json())
        .then(data => {
          if (data.facets) {
            setFacets(data.facets);
          }
        })
        .catch(error => {
          console.error('Error fetching facets:', error);
        })
        .finally(() => {
          setLoadingFacets(false);
        });
    }
  }, [isDiamond, isSelected, deployment.network, deployment.address, facets.length]);

  const handleFacetClick = (facet) => {
    if (onSelectFacet) {
      onSelectFacet({
        ...deployment,
        selectedFacet: facet,
        isDiamond: true
      });
    }
  };

  return (
    <div>
      <div
        className={`sidebar-item p-2 rounded cursor-pointer flex items-center justify-between ${isSelected ? 'active' : ''}`}
        onClick={onSelect}
      >
        <div className="flex items-center">
          <i className={`${iconClass} mr-2`}></i>
          <span className="text-blue-300">{deployment.contractName}</span>
          {isDiamond && (
            <span className="ml-2 text-xs bg-yellow-600 px-1 rounded">DIAMOND</span>
          )}
        </div>
        <button onClick={handleFavoriteClick} className="text-gray-500 hover:text-yellow-400">
          <i className={`${isFavorite ? 'fas' : 'far'} fa-star`}></i>
        </button>
      </div>
      {isDiamond && isSelected && (
        <div className="ml-6 mt-1 space-y-1">
          {loadingFacets && (
            <div className="p-2 text-gray-400 text-sm flex items-center">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Loading facets...
            </div>
          )}
          {facets.map((facet) => (
            <div
              key={facet.address}
              className={`sidebar-item p-2 rounded cursor-pointer flex items-center justify-between hover:bg-gray-700 ${
                selectedFacet?.address === facet.address ? 'bg-gray-600' : ''
              }`}
              onClick={() => handleFacetClick(facet)}
            >
              <div className="flex items-center">
                <i className="fas fa-cube text-pink-400 mr-2 text-xs"></i>
                <span className="text-pink-300 text-sm">{facet.name}</span>
              </div>
              <span className="text-xs text-gray-500">{facet.selectorCount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeploymentItem;
