import React, { useState, useEffect } from 'react';
import useWebSocket from '../../../../hooks/useWebSocket';
import { ethers } from 'ethers';

const TransactionSimulator = ({ contract, func, args, value }) => {
  const { messages, sendMessage } = useWebSocket('ws://localhost:8080');
  const [simulationResult, setSimulationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const simMessage = messages.find(msg => msg.type === 'simulationResult');
    if (simMessage) {
      setLoading(false);
      if (simMessage.data.success) {
        setSimulationResult(simMessage.data);
      } else {
        setError(simMessage.data.error);
      }
    }
  }, [messages]);

  const simulateTransaction = async () => {
    setLoading(true);
    setError('');
    setSimulationResult(null);

    const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
    const from = await signer.getAddress();
    const data = contract.interface.encodeFunctionData(func.name, args);
    
    sendMessage({
      type: 'simulateTransaction',
      data: {
        from,
        to: contract.address,
        data,
        value,
      },
    });
  };

  return (
    <div className="p-4 mt-4 border-t border-gray-700">
      <h3 className="text-lg font-semibold mb-2">Transaction Simulation</h3>
      <button
        onClick={simulateTransaction}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded-lg text-sm"
      >
        {loading ? 'Simulating...' : 'Simulate Transaction'}
      </button>

      {error && <pre className="text-red-400 mt-2">{error}</pre>}

      {simulationResult && (
        <div className="mt-4 space-y-4">
          <h4 className="font-semibold">Simulation Result</h4>
          <div className={`p-2 rounded ${simulationResult.success ? 'bg-green-900' : 'bg-red-900'}`}>
            <p>Status: {simulationResult.success ? 'Success' : 'Failure'}</p>
          </div>

          <div>
            <h5 className="font-semibold">Return Data</h5>
            <pre className="bg-gray-800 p-2 rounded text-sm">
              {simulationResult.result}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionSimulator;
