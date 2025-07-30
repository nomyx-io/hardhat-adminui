import React from 'react';

const TabButton = ({ id, label, activeTab, onTabClick }) => (
  <button
    className={`tab-button px-4 py-3 font-medium ${
      activeTab === id
        ? 'border-b-2 border-primary text-primary highlight-text'
        : 'text-gray-400 hover:text-blue-300'
    }`}
    onClick={() => onTabClick(id)}
  >
    {label}
  </button>
);

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

const TabNavigation = ({ activeTab, onTabClick, deployment, isDiamondView, facets }) => {
  const isDiamond = isDiamondContract(deployment);

  let tabs = [];

  if (isDiamondView && facets) {
    // For Diamond views, create tabs for Diamond overview, contract view, methods, and each facet
    tabs = [
      { id: 'diamond-overview', label: 'Diamond Overview' },
      { id: 'diamond-contract', label: 'Contract' },
      { id: 'diamond-methods', label: 'Methods' },
      ...facets.map(facet => ({
        id: `facet-${facet.address}`,
        label: facet.name,
        facetData: facet
      }))
    ];
  } else {
    // Standard contract tabs
    tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'abi', label: 'ABI' },
      { id: 'bytecode', label: 'Bytecode' },
      { id: 'methods', label: 'Methods' },
      { id: 'storage', label: 'Storage' },
      { id: 'transactions', label: 'Transactions' },
      { id: 'docs', label: 'Docs' },
      { id: 'events', label: 'Events' },
    ];

    if (isDiamond) {
      tabs.push({ id: 'diamond', label: 'Diamond' });
    }
  }

  return (
    <div className="border-b border-gray-700">
      <div className="flex px-4">
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            activeTab={activeTab}
            onTabClick={onTabClick}
          />
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
