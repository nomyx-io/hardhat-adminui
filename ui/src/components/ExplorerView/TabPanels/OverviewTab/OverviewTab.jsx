import React from 'react';
import ContractDetailsCard from './ContractDetailsCard';
import DeploymentInfoCard from './DeploymentInfoCard';
import RecentTransactionsCard from './RecentTransactionsCard';

const OverviewTab = ({ deployment, onTransactionClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ContractDetailsCard deployment={deployment} />
      <DeploymentInfoCard deployment={deployment} />
      <RecentTransactionsCard
        recentTransactions={deployment.recentTransactions}
        onTransactionClick={onTransactionClick}
      />
    </div>
  );
};

export default OverviewTab;
