import React from 'react';
import CodeBlock from '../common/CodeBlock';

const DocsTab = ({ deployment }) => {
  const { devdoc, userdoc } = deployment;

  const renderDocSection = (title, doc, type) => {
    if (!doc || Object.keys(doc).length === 0) {
      return (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
              <i className="fas fa-book text-white text-sm"></i>
            </div>
            <span className="gradient-text">{title}</span>
          </h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-file-alt text-slate-500 text-xl"></i>
            </div>
            <p className="text-slate-400">No {type} documentation available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
            <i className="fas fa-book text-white text-sm"></i>
          </div>
          <span className="gradient-text">{title}</span>
        </h3>
        
        {doc.title && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-blue-400 mb-2">Title</h4>
            <p className="text-gray-300">{doc.title}</p>
          </div>
        )}
        
        {doc.details && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-blue-400 mb-2">Details</h4>
            <p className="text-gray-300">{doc.details}</p>
          </div>
        )}
        
        {doc.methods && Object.keys(doc.methods).length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-blue-400 mb-4">Methods</h4>
            <div className="space-y-4">
              {Object.entries(doc.methods).map(([methodName, methodDoc]) => (
                <div key={methodName} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
                  <h5 className="text-md font-semibold text-purple-400 mb-2 font-mono">{methodName}</h5>
                  
                  {methodDoc.details && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-400">Details:</span>
                      <p className="text-gray-300 mt-1">{methodDoc.details}</p>
                    </div>
                  )}
                  
                  {methodDoc.params && Object.keys(methodDoc.params).length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-400">Parameters:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(methodDoc.params).map(([param, desc]) => (
                          <div key={param} className="text-sm">
                            <span className="text-yellow-400 font-mono">{param}</span>
                            <span className="text-gray-300 ml-2">- {desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {methodDoc.returns && Object.keys(methodDoc.returns).length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-400">Returns:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(methodDoc.returns).map(([key, desc]) => (
                          <div key={key} className="text-sm">
                            <span className="text-green-400 font-mono">{key}</span>
                            <span className="text-gray-300 ml-2">- {desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {doc.version && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-blue-400 mb-2">Version</h4>
            <p className="text-gray-300">{doc.version}</p>
          </div>
        )}
        
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-blue-400 mb-2">Raw Documentation</h4>
          <CodeBlock code={JSON.stringify(doc, null, 2)} language="json" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderDocSection("Developer Documentation", devdoc, "developer")}
      {renderDocSection("User Documentation", userdoc, "user")}
    </div>
  );
};

export default DocsTab;