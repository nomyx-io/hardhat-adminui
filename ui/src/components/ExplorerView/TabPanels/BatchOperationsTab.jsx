import React, { useState } from 'react';
import { ethers } from 'ethers';
import { multicallAbi } from '../../../abis/multicall';

// This is a common address for the Multicall3 contract
const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

const BatchOperationsTab = ({ contract }) => {
  const [batch, setBatch] = useState([]);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addToBatch = (funcName, args) => {
    const calldata = contract.interface.encodeFunctionData(funcName, args);
    const newCall = {
      target: contract.address,
      callData: calldata,
      funcName,
      args,
    };
    setBatch(prev => [...prev, newCall]);
  };

  const executeBatch = async () => {
    setLoading(true);
    setResult('');
    setError('');

    try {
      const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
      const multicall = new ethers.Contract(MULTICALL_ADDRESS, multicallAbi, signer);

      const calls = batch.map(item => ({
        target: item.target,
        callData: item.callData,
      }));

      const tx = await multicall.aggregate(calls);
      setResult(`Batch transaction sent: ${tx.hash}`);
      await tx.wait();
      setResult(`Batch transaction confirmed: ${tx.hash}`);
      setBatch([]);
    } catch (e) {
      console.error(e);
      setError(e.reason || e.message);
    } finally {
      setLoading(false);
    }
  };

const AddFunctionForm = ({ contract, onAddToBatch }) => {
    const [selectedFunc, setSelectedFunc] = useState('');
    const [args, setArgs] = useState('');

    const handleAdd = () => {
        if (!selectedFunc) return;
        const parsedArgs = args ? args.split(',').map(arg => arg.trim()) : [];
        onAddToBatch(selectedFunc, parsedArgs);
        setArgs('');
    }

    return (
        <div className="p-4 border rounded-lg border-gray-700 space-y-2">
            <h4 className="font-semibold">Add to Batch</h4>
            <select onChange={(e) => setSelectedFunc(e.target.value)} defaultValue="" className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm">
                <option value="" disabled>Select a function</option>
                {contract.interface.fragments
                    .filter(frag => frag.type === 'function' && frag.stateMutability !== 'view' && frag.stateMutability !== 'pure')
                    .map(frag => <option key={frag.name} value={frag.name}>{frag.name}</option>)
                }
            </select>
            <input 
                type="text"
                placeholder="Arguments (comma-separated)"
                value={args}
                onChange={(e) => setArgs(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            />
            <button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded-lg text-sm">Add</button>
        </div>
    )
}

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-xl font-bold">Batch Operations</h3>
      <AddFunctionForm contract={contract} onAddToBatch={addToBatch} />

      <div className="space-y-2">
        <h4 className="font-semibold">Current Batch ({batch.length})</h4>
        {batch.map((item, index) => (
          <div key={index} className="bg-gray-800 p-2 rounded text-sm">
            <p><strong>{item.funcName}</strong>({item.args.join(', ')})</p>
          </div>
        ))}
      </div>

      <button
        onClick={executeBatch}
        disabled={loading || batch.length === 0}
        className="bg-primary hover:bg-indigo-700 px-4 py-2 rounded-lg disabled:bg-gray-600"
      >
        {loading ? 'Executing Batch...' : 'Execute Batch'}
      </button>

      {result && <pre className="text-green-400 mt-2">{result}</pre>}
      {error && <pre className="text-red-400 mt-2">{error}</pre>}
    </div>
  );
};

export default BatchOperationsTab;
