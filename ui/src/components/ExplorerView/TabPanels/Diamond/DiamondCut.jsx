import React, { useState } from 'react';
import { ethers } from 'ethers';

const DiamondCut = ({ contract }) => {
  const [facetAddress, setFacetAddress] = useState('');
  const [action, setAction] = useState(0); // 0: ADD, 1: REPLACE, 2: REMOVE
  const [functionSigs, setFunctionSigs] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDiamondCut = async () => {
    setLoading(true);
    setResult('');
    setError('');

    try {
      const diamondCut = [
        {
          facetAddress,
          action,
          functionSelectors: functionSigs.split(',').map(s => s.trim()),
        },
      ];

      const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.diamondCut(diamondCut, ethers.constants.AddressZero, '0x');
      setResult(`Diamond cut transaction sent: ${tx.hash}`);
      await tx.wait();
      setResult(`Diamond cut transaction confirmed: ${tx.hash}`);
    } catch (e) {
      console.error(e);
      setError(e.reason || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-700 rounded-lg">
      <h4 className="text-lg font-bold mb-2">Diamond Cut</h4>
      <div className="space-y-2">
        <select
          value={action}
          onChange={(e) => setAction(parseInt(e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
        >
          <option value={0}>Add</option>
          <option value={1}>Replace</option>
          <option value={2}>Remove</option>
        </select>
        <input
          type="text"
          placeholder="Facet Address"
          value={facetAddress}
          onChange={(e) => setFacetAddress(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
        />
        <textarea
          placeholder="Function signatures, comma-separated"
          value={functionSigs}
          onChange={(e) => setFunctionSigs(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
        />
      </div>
      <button
        onClick={handleDiamondCut}
        disabled={loading}
        className="mt-2 bg-primary hover:bg-indigo-700 px-4 py-1 rounded-lg text-sm"
      >
        {loading ? 'Executing...' : 'Execute Diamond Cut'}
      </button>
      {result && <pre className="text-green-400 mt-2">{result}</pre>}
      {error && <pre className="text-red-400 mt-2">{error}</pre>}
    </div>
  );
};

export default DiamondCut;
