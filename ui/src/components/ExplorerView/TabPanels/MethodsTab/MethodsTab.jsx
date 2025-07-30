import React, { useMemo } from 'react';
import { ethers } from 'ethers';
import FunctionInteractor from './FunctionInteractor';

const MethodsTab = ({ deployment }) => {
  const contract = useMemo(() => {
    if (!deployment) return null;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new ethers.Contract(deployment.address, deployment.abi, provider);
  }, [deployment]);

  if (!contract) {
    return <p>Contract not loaded.</p>;
  }

  const functions = contract.interface.fragments.filter(f => f.type === 'function');
  const readFunctions = functions.filter(f => f.stateMutability === 'view' || f.stateMutability === 'pure');
  const writeFunctions = functions.filter(f => f.stateMutability !== 'view' && f.stateMutability !== 'pure');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-bold mb-4">Read Methods</h3>
        <div className="space-y-4">
          {readFunctions.map(func => (
            <FunctionInteractor key={func.name} func={func} contract={contract} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-4">Write Methods</h3>
        <div className="space-y-4">
          {writeFunctions.map(func => (
            <FunctionInteractor key={func.name} func={func} contract={contract} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MethodsTab;
