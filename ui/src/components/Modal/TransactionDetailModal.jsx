import React, { useState, useEffect, useCallback } from 'react';
import CopyButton from '../ExplorerView/common/CopyButton';
import CodeBlock from '../ExplorerView/common/CodeBlock';
import './TransactionDetailModal.css';

const TransactionDetailModal = ({ isOpen, onClose, transactionHash, network }) => {
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchTransactionDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/transactions/${transactionHash}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch transaction details: ${response.statusText}`);
      }
      const data = await response.json();
      setTransactionData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [transactionHash]);

  useEffect(() => {
    if (isOpen && transactionHash) {
      fetchTransactionDetails();
    }
  }, [isOpen, transactionHash, network, fetchTransactionDetails]);

  const formatValue = (value, decimals = 18) => {
    if (!value || value === '0') return '0';
    const ethValue = parseFloat(value) / Math.pow(10, decimals);
    return ethValue.toFixed(6);
  };

  const formatGas = (gasValue) => {
    if (!gasValue) return '0';
    return parseInt(gasValue).toLocaleString();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const truncateAddress = (address, length = 10) => {
    if (!address) return '';
    return `${address.slice(0, length)}...${address.slice(-8)}`;
  };

  const getStatusColor = (status) => {
    return status === 1 ? '#10b981' : '#ef4444';
  };

  const getStatusText = (status) => {
    return status === 1 ? 'Success' : 'Failed';
  };

  if (!isOpen) return null;

  return (
    <div className="transaction-modal-overlay" onClick={onClose}>
      <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
        <div className="transaction-modal-header">
          <h2>Transaction Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {loading && (
          <div className="transaction-modal-loading">
            <div className="loading-spinner"></div>
            <p>Loading transaction details...</p>
          </div>
        )}

        {error && (
          <div className="transaction-modal-error">
            <p>Error: {error}</p>
            <button onClick={fetchTransactionDetails}>Retry</button>
          </div>
        )}

        {transactionData && (
          <div className="transaction-modal-content">
            {/* Hash and Status Header */}
            <div className="transaction-header">
              <div className="transaction-hash">
                <span className="label">Transaction Hash:</span>
                <div className="hash-container">
                  <code>{transactionData.hash}</code>
                  <CopyButton text={transactionData.hash} />
                </div>
              </div>
              <div 
                className="transaction-status"
                style={{ backgroundColor: getStatusColor(transactionData.status) }}
              >
                {getStatusText(transactionData.status)}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="transaction-tabs">
              <button 
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              {transactionData.decodedFunction && (
                <button 
                  className={`tab ${activeTab === 'function' ? 'active' : ''}`}
                  onClick={() => setActiveTab('function')}
                >
                  Function Call
                </button>
              )}
              {transactionData.decodedEvents && transactionData.decodedEvents.length > 0 && (
                <button 
                  className={`tab ${activeTab === 'events' ? 'active' : ''}`}
                  onClick={() => setActiveTab('events')}
                >
                  Events ({transactionData.decodedEvents.length})
                </button>
              )}
              <button 
                className={`tab ${activeTab === 'raw' ? 'active' : ''}`}
                onClick={() => setActiveTab('raw')}
              >
                Raw Data
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="label">Block Number:</span>
                      <span className="value">{transactionData.blockNumber?.toLocaleString()}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Confirmations:</span>
                      <span className="value">{transactionData.confirmations}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Timestamp:</span>
                      <span className="value">{formatTimestamp(transactionData.timestamp)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">From:</span>
                      <div className="address-container">
                        <code>{transactionData.from}</code>
                        <CopyButton text={transactionData.from} />
                      </div>
                    </div>
                    <div className="info-row">
                      <span className="label">To:</span>
                      <div className="address-container">
                        <code>{transactionData.to || 'Contract Creation'}</code>
                        {transactionData.to && <CopyButton text={transactionData.to} />}
                      </div>
                    </div>
                    <div className="info-row">
                      <span className="label">Value:</span>
                      <span className="value">{formatValue(transactionData.value)} ETH</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Gas Limit:</span>
                      <span className="value">{formatGas(transactionData.gasLimit)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Gas Used:</span>
                      <span className="value">{formatGas(transactionData.gasUsed)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Gas Price:</span>
                      <span className="value">{formatValue(transactionData.gasPrice, 9)} Gwei</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Transaction Fee:</span>
                      <span className="value">{formatValue(transactionData.transactionFee)} ETH</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Nonce:</span>
                      <span className="value">{transactionData.nonce}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'function' && transactionData.decodedFunction && (
                <div className="function-tab">
                  <div className="function-info">
                    <h3>Function Call: {transactionData.decodedFunction.name}</h3>
                    <p className="function-signature">
                      <strong>Signature:</strong> {transactionData.decodedFunction.signature}
                    </p>
                  </div>
                  
                  {transactionData.decodedFunction.inputs && (
                    <div className="function-inputs">
                      <h4>Parameters:</h4>
                      <div className="inputs-list">
                        {transactionData.decodedFunction.inputs.map((input, index) => (
                          <div key={index} className="input-item">
                            <div className="input-header">
                              <span className="input-name">{input.name || `param${index}`}</span>
                              <span className="input-type">{input.type}</span>
                            </div>
                            <div className="input-value">
                              <CodeBlock code={JSON.stringify(input.value, null, 2)} language="json" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'events' && transactionData.decodedEvents && (
                <div className="events-tab">
                  <h3>Events & Logs</h3>
                  <div className="events-list">
                    {transactionData.decodedEvents.map((event, index) => (
                      <div key={index} className="event-item">
                        <div className="event-header">
                          <div className="event-info">
                            <h4>{event.decoded?.name || 'Unknown Event'}</h4>
                            <div className="event-address">
                              <span>Contract: </span>
                              <code>{truncateAddress(event.address)}</code>
                              <CopyButton text={event.address} />
                            </div>
                          </div>
                        </div>
                        
                        {event.decoded?.signature && (
                          <p className="event-signature">
                            <strong>Signature:</strong> {event.decoded.signature}
                          </p>
                        )}

                        {event.decoded?.inputs && (
                          <div className="event-inputs">
                            <h5>Parameters:</h5>
                            {event.decoded.inputs.map((input, inputIndex) => (
                              <div key={inputIndex} className="input-item">
                                <div className="input-header">
                                  <span className="input-name">{input.name || `param${inputIndex}`}</span>
                                  <span className="input-type">{input.type}</span>
                                  {input.indexed && <span className="indexed-badge">indexed</span>}
                                </div>
                                <div className="input-value">
                                  <CodeBlock code={JSON.stringify(input.value, null, 2)} language="json" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!event.decoded && (
                          <div className="raw-log">
                            <h5>Raw Log Data:</h5>
                            <div className="log-topics">
                              <strong>Topics:</strong>
                              {event.topics.map((topic, topicIndex) => (
                                <div key={topicIndex} className="topic">
                                  <code>{topic}</code>
                                </div>
                              ))}
                            </div>
                            <div className="log-data">
                              <strong>Data:</strong>
                              <CodeBlock code={event.data || '0x'} language="text" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'raw' && (
                <div className="raw-tab">
                  <h3>Raw Transaction Data</h3>
                  <div className="raw-data">
                    <div className="raw-section">
                      <h4>Input Data:</h4>
                      <CodeBlock code={transactionData.data || '0x'} language="text" />
                    </div>
                    <div className="raw-section">
                      <h4>Complete Transaction Object:</h4>
                      <CodeBlock 
                        code={JSON.stringify({
                          hash: transactionData.hash,
                          blockNumber: transactionData.blockNumber,
                          blockHash: transactionData.blockHash,
                          from: transactionData.from,
                          to: transactionData.to,
                          value: transactionData.value,
                          gasLimit: transactionData.gasLimit,
                          gasUsed: transactionData.gasUsed,
                          gasPrice: transactionData.gasPrice,
                          nonce: transactionData.nonce,
                          data: transactionData.data,
                          status: transactionData.status
                        }, null, 2)} 
                        language="json" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetailModal;