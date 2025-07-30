import React, { useMemo } from 'react';
import { ethers } from 'ethers';
import DiamondCut from './Diamond/DiamondCut';

const DiamondTab = ({ deployment }) => {
  const isDiamond = deployment.abi.some(item => item.name === 'diamondCut');

  const contract = useMemo(() => {
    if (!deployment) return null;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new ethers.Contract(deployment.address, deployment.abi, provider);
  }, [deployment]);

  if (!isDiamond) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="artifact-card bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <i className="fas fa-gem text-yellow-500 mr-2"></i>
          Diamond Facets
        </h3>
        <div className="space-y-4">
          {deployment.facets?.map(facet => (
            <div key={facet.name} className="diamond-item p-4 rounded-lg">
              <h4 className="font-bold text-pink-300">{facet.name}</h4>
              <p className="font-mono text-sm text-gray-400">{facet.address}</p>
              <div className="mt-2 space-y-1">
                {facet.functions.map(func => (
                  <p key={func} className="text-xs font-mono text-gray-300">{func}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {contract && <DiamondCut contract={contract} />}
    </div>
  );
};

export default DiamondTab;
