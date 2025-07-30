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
  
  // Get contract-specific icon based on contract name
  const getContractIcon = (contractName) => {
    const name = contractName.toLowerCase();
    
    if (isDiamond) {
      return "fas fa-gem text-yellow-500";
    }
    
    // Contract-specific icons
    if (name.includes('token') || name.includes('erc20')) {
      return "fas fa-coins text-green-500";
    }
    if (name.includes('marketplace') || name.includes('market')) {
      return "fas fa-store text-purple-500";
    }
    if (name.includes('storage')) {
      return "fas fa-database text-blue-500";
    }
    if (name.includes('nft') || name.includes('erc721')) {
      return "fas fa-image text-indigo-500";
    }
    if (name.includes('registry')) {
      return "fas fa-address-book text-orange-500";
    }
    if (name.includes('factory')) {
      return "fas fa-industry text-gray-500";
    }
    if (name.includes('pool') || name.includes('liquidity')) {
      return "fas fa-swimming-pool text-cyan-500";
    }
    if (name.includes('vault') || name.includes('treasury')) {
      return "fas fa-vault text-amber-500";
    }
    if (name.includes('proxy')) {
      return "fas fa-random text-teal-500";
    }
    if (name.includes('oracle')) {
      return "fas fa-eye text-violet-500";
    }
    
    // Default contract icon
    return "fas fa-file-contract text-primary";
  };
  
  const iconClass = getContractIcon(deployment.contractName);

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
