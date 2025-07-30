import React, { useState, useEffect } from 'react';
import useWebSocket from '../../../../hooks/useWebSocket';

const ContractDetailsCard = ({ deployment }) => {
  const { messages, sendMessage } = useWebSocket('ws://localhost:8080');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Check if we're on a localhost/development network
  const isLocalNetwork = deployment?.network && ['localhost', 'hardhat', '127.0.0.1'].includes(deployment.network.toLowerCase());

  useEffect(() => {
    const verificationMessage = messages.find(
      (msg) =>
        msg.type === 'verificationStatus' &&
        msg.data.contractName === deployment.contractName
    );

    if (verificationMessage) {
      setVerificationStatus(verificationMessage.data.status);
      if (verificationMessage.data.status !== 'Verifying...') {
        setIsVerifying(false);
      }
    }
  }, [messages, deployment.contractName]);

  const handleVerify = () => {
    setIsVerifying(true);
    setVerificationStatus('Sending verification request...');
    sendMessage({ type: 'verifyContract', data: { contractName: deployment.contractName } });
  };

  return (
    <div className="artifact-card bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <i className="fas fa-info-circle text-primary mr-2"></i>
        Contract Details
      </h3>
      <div className="space-y-3">
        <div>
          <p className="text-gray-400 text-sm">Contract Name</p>
          <p className="font-mono text-blue-300">{deployment.contractName}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Contract Address</p>
          <p className="font-mono text-purple-300">{deployment.address}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Deployment Transaction</p>
          <p className="font-mono text-amber-300">{deployment.receipt.transactionHash}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Deployed At Block</p>
          <p className="text-green-300">{deployment.receipt.blockNumber}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Deployer</p>
          <p className="font-mono text-indigo-300">{deployment.receipt.from}</p>
        </div>
        <div className="pt-4">
            <button
                onClick={handleVerify}
                disabled={isVerifying || isLocalNetwork}
                className={`w-full px-4 py-2 rounded-lg ${
                  isLocalNetwork
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600'
                }`}
                title={isLocalNetwork ? 'Contract verification is not available for localhost networks' : ''}
            >
                {isLocalNetwork
                  ? 'Verification Unavailable'
                  : isVerifying
                    ? 'Verifying...'
                    : 'Verify Contract'
                }
            </button>
            {isLocalNetwork && (
                <p className="text-sm text-gray-400 mt-2">Contract verification is only available on public networks</p>
            )}
            {verificationStatus && !isLocalNetwork && (
                <p className="text-sm text-gray-400 mt-2">{verificationStatus}</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ContractDetailsCard;
