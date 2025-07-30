import React, { useState, useMemo } from 'react';
import { ethers } from 'ethers';

// A single function UI component
const FunctionInteractor = ({ func, contract, provider }) => {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRead = func.stateMutability === 'view' || func.stateMutability === 'pure';

  const handleInputChange = (paramName, value) => {
    setInputs(prev => ({ ...prev, [paramName]: value }));
  };

  const execute = async () => {
    setLoading(true);
    setResult('');
    setError('');
    
    const args = func.inputs.map(input => inputs[input.name] || '');

    try {
      if (isRead) {
        const res = await contract[func.name](...args);
        // Format result for display
        if (Array.isArray(res) || typeof res === 'object') {
            setResult(JSON.stringify(res, null, 2));
        } else {
            setResult(res.toString());
        }
      } else { // It's a write transaction
        if (!window.ethereum) {
          throw new Error("MetaMask or a similar wallet is not installed.");
        }
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);
        
        const txOptions = {};
        if (func.payable) {
            const ethValue = inputs['payableValue'];
            if (!ethValue || isNaN(ethValue)) throw new Error("A valid ETH value is required for payable function.");
            txOptions.value = ethers.utils.parseEther(ethValue);
        }

        const tx = await contractWithSigner[func.name](...args, txOptions);
        setResult(`Transaction sent! Hash: ${tx.hash}`);
        await tx.wait();
        setResult(`Transaction confirmed! Hash: ${tx.hash}`);
      }
    } catch (e) {
      console.error(e);
      setError(e.reason || e.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="function-card">
      <h4>{func.name}</h4>
      <div className="function-inputs">
        {func.inputs.map((input, index) => (
          <input
            key={index}
            type="text"
            placeholder={`${input.type} ${input.name}`}
            onChange={(e) => handleInputChange(input.name, e.target.value)}
          />
        ))}
        {func.payable && (
             <input
                type="text"
                placeholder="ETH Value"
                onChange={(e) => handleInputChange('payableValue', e.target.value)}
            />
        )}
      </div>
      <button onClick={execute} disabled={loading}>
        {loading ? 'Executing...' : (isRead ? 'Call' : 'Transact')}
      </button>
      {result && <pre className="result-display success">{result}</pre>}
      {error && <pre className="result-display error">{error}</pre>}
    </div>
  );
};


// The main component to render all functions for a contract
const ContractInteractor = ({ contractInfo, deploymentInfo }) => {
  const provider = useMemo(() => new ethers.providers.Web3Provider(window.ethereum || new ethers.providers.JsonRpcProvider("http://localhost:8545")), []);
  const contract = useMemo(() => {
    if (!deploymentInfo || !contractInfo) return null;
    return new ethers.Contract(deploymentInfo.address, contractInfo.abi, provider);
  }, [contractInfo, deploymentInfo, provider]);

  if (!contract) {
    return <div className="message">Deployment information is required to interact with the contract.</div>;
  }

  const { readFunctions, writeFunctions } = useMemo(() => {
    const read = [];
    const write = [];
    contract.interface.fragments.forEach(fragment => {
      if (fragment.type === 'function') {
        if (fragment.stateMutability === 'view' || fragment.stateMutability === 'pure') {
          read.push(fragment);
        } else {
          write.push(fragment);
        }
      }
    });
    return { readFunctions: read, writeFunctions: write };
  }, [contract]);

  return (
    <div className="interactor-container">
      <h3>Interact with {contractInfo.contractName}</h3>
      <p><strong>Address:</strong> {contract.address}</p>
      
      <div className="function-section">
        <h4 className="function-section-title">Read Functions</h4>
        {readFunctions.length > 0 ? readFunctions.map((func, i) => (
          <FunctionInteractor key={i} func={func} contract={contract} provider={provider} />
        )) : <p>No read functions found.</p>}
      </div>

      <div className="function-section">
        <h4 className="function-section-title">Write Functions</h4>
        {writeFunctions.length > 0 ? writeFunctions.map((func, i) => (
          <FunctionInteractor key={i} func={func} contract={contract} provider={provider} />
        )) : <p>No write functions found.</p>}
      </div>
    </div>
  );
};

export default ContractInteractor;
