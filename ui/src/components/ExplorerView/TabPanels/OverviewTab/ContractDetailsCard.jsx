import React, { useState, useEffect } from 'react';
import CopyButton from '../../common/CopyButton';
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

  const formatGasUsed = (gasUsed) => {
    if (!gasUsed) return 'N/A';
    return Number(gasUsed).toLocaleString();
  };


  if (!deployment) {
    return (
      <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="text-center py-8">
          <i className="fas fa-exclamation-triangle text-gray-500 text-3xl mb-3"></i>
          <p className="text-gray-400">No deployment data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
      <h3 className="text-xl font-bold mb-6 flex items-center text-white">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          <i className="fas fa-info-circle text-white"></i>
        </div>
        Contract Details
      </h3>
      
      <div className="space-y-4">
        {/* Contract Name */}
        <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Contract Name</p>
          <div className="flex items-center justify-between">
            <p className="font-mono text-blue-300 font-semibold">{deployment.contractName}</p>
            <div className="flex items-center gap-2">
              {deployment.contractName === 'Diamond' && (
                <span className="text-xs bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-2 py-1 rounded-full font-medium">
                  DIAMOND
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contract Address */}
        <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Contract Address</p>
          <div className="flex items-center gap-2">
            <code className="font-mono text-purple-300 text-sm flex-1 break-all">{deployment.address}</code>
            <CopyButton text={deployment.address} size="small" variant="ghost" />
          </div>
        </div>

        {/* Deployment Transaction */}
        {deployment.receipt?.transactionHash && (
          <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Deployment Transaction</p>
            <div className="flex items-center gap-2">
              <code className="font-mono text-amber-300 text-sm flex-1 break-all">{deployment.receipt.transactionHash}</code>
              <CopyButton text={deployment.receipt.transactionHash} size="small" variant="ghost" />
            </div>
          </div>
        )}

        {/* Grid for smaller details */}
        <div className="grid grid-cols-2 gap-3">
          {/* Block Number */}
          {deployment.receipt?.blockNumber && (
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-center">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Block</p>
              <p className="text-green-300 font-bold text-lg">{Number(deployment.receipt.blockNumber).toLocaleString()}</p>
            </div>
          )}

          {/* Confirmations */}
          {deployment.receipt?.confirmations !== undefined && (
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-center">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Confirmations</p>
              <p className="text-blue-300 font-bold text-lg">{deployment.receipt.confirmations}</p>
            </div>
          )}

          {/* Gas Used */}
          {deployment.receipt?.gasUsed && (
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-center">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Gas Used</p>
              <p className="text-orange-300 font-bold text-sm">{formatGasUsed(deployment.receipt.gasUsed)}</p>
            </div>
          )}

          {/* Status */}
          <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-center">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Status</p>
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                <i className="fas fa-check-circle mr-1"></i>
                Deployed
              </span>
            </div>
          </div>
        </div>

        {/* Deployer */}
        {deployment.receipt?.from && (
          <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Deployer Address</p>
            <div className="flex items-center gap-2">
              <code className="font-mono text-indigo-300 text-sm flex-1 break-all">{deployment.receipt.from}</code>
              <CopyButton text={deployment.receipt.from} size="small" variant="ghost" />
            </div>
          </div>
        )}

        {/* Contract Verification */}
        <div className="pt-2 border-t border-gray-700">
          <button
            onClick={handleVerify}
            disabled={isVerifying || isLocalNetwork}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isLocalNetwork
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : isVerifying
                  ? 'bg-blue-600 cursor-wait text-white'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white hover:shadow-lg hover:scale-[1.02]'
            }`}
            title={isLocalNetwork ? 'Contract verification is not available for localhost networks' : ''}
          >
            {isVerifying ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Verifying Contract...
              </>
            ) : isLocalNetwork ? (
              <>
                <i className="fas fa-exclamation-triangle"></i>
                Verification Unavailable
              </>
            ) : (
              <>
                <i className="fas fa-shield-check"></i>
                Verify Contract
              </>
            )}
          </button>
          
          {isLocalNetwork && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Contract verification is only available on public networks
            </p>
          )}
          
          {verificationStatus && !isLocalNetwork && (
            <div className="mt-3 p-2 bg-blue-900/30 border border-blue-700 rounded-lg">
              <p className="text-sm text-blue-300 text-center">{verificationStatus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractDetailsCard;
