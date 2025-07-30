import React from 'react';

const TabButton = ({ id, label, activeTab, onTabClick, icon }) => (
  <button
    className={`tab-button px-4 py-3 font-medium flex items-center space-x-2 ${
      activeTab === id
        ? 'border-b-2 border-primary text-primary highlight-text'
        : 'text-gray-400 hover:text-blue-300'
    }`}
    onClick={() => onTabClick(id)}
  >
    {icon && <i className={`${icon} text-sm`}></i>}
    <span>{label}</span>
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
      { id: 'diamond-overview', label: 'Diamond Overview', icon: 'fas fa-gem' },
      { id: 'diamond-contract', label: 'Contract', icon: 'fas fa-file-contract' },
      { id: 'diamond-methods', label: 'Methods', icon: 'fas fa-cogs' },
      ...facets.map(facet => ({
        id: `facet-${facet.address}`,
        label: facet.name,
        icon: 'fas fa-puzzle-piece',
        facetData: facet
      }))
    ];
  } else {
    // Standard contract tabs
    tabs = [
      { id: 'overview', label: 'Overview', icon: 'fas fa-info-circle' },
      { id: 'abi', label: 'ABI', icon: 'fas fa-code' },
      { id: 'bytecode', label: 'Bytecode', icon: 'fas fa-binary' },
      { id: 'methods', label: 'Methods', icon: 'fas fa-cogs' },
      { id: 'storage', label: 'Storage', icon: 'fas fa-database' },
      { id: 'transactions', label: 'Transactions', icon: 'fas fa-exchange-alt' },
      { id: 'docs', label: 'Docs', icon: 'fas fa-book' },
      { id: 'events', label: 'Events', icon: 'fas fa-calendar-alt' },
    ];

    if (isDiamond) {
      tabs.push({ id: 'diamond', label: 'Diamond', icon: 'fas fa-gem' });
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
            icon={tab.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
