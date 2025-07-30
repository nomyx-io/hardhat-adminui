import React from 'react';
import OverviewTab from '../TabPanels/OverviewTab/OverviewTab';
import ABITab from '../TabPanels/ABITab';
import BytecodeTab from '../TabPanels/BytecodeTab';
import MethodsTab from '../TabPanels/MethodsTab/MethodsTab';
import StorageTab from '../TabPanels/StorageTab';
import TransactionsTab from '../TabPanels/TransactionsTab';
import DiamondTab from '../TabPanels/DiamondTab';
import DocsTab from '../TabPanels/DocsTab';
import EventsTab from '../TabPanels/EventsTab';

const TabContent = ({ activeTab, deployment, onTransactionClick }) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab deployment={deployment} onTransactionClick={onTransactionClick} />;
      case 'abi':
        return <ABITab abi={deployment.abi} />;
      case 'bytecode':
        return <BytecodeTab bytecode={deployment.bytecode} />;
      case 'methods':
        return <MethodsTab deployment={deployment} />;
      case 'storage':
        return <StorageTab storageLayout={deployment.storageLayout} deployment={deployment} />;
      case 'transactions':
        return <TransactionsTab deployment={deployment} onTransactionClick={onTransactionClick} />;
      case 'docs':
        return <DocsTab deployment={deployment} />;
      case 'events':
        return <EventsTab deployment={deployment} />;
      case 'diamond':
        return <DiamondTab deployment={deployment} />;
      default:
        return null;
    }
  };

  return <div className="tab-content active">{renderTabContent()}</div>;
};

export default TabContent;
