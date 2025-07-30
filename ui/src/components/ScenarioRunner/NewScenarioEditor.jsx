/* eslint-disable no-new-func */
import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const NewScenarioEditor = ({ onSave, onCancel }) => {
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioContent, setScenarioContent] = useState(getDefaultTemplate());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function getDefaultTemplate() {
    return `export const metadata = {
  name: "New Scenario",
  description: "A new test scenario for smart contract testing",
  tags: ["integration", "basic"],
  version: "1.0.0"
};

export const scenarios = [
  {
    name: "Basic Contract Interaction",
    description: "Test basic contract deployment and interaction",
    steps: [
      {
        name: "Deploy Contract",
        action: "deploy",
        contract: "YourContract",
        args: []
      },
      {
        name: "Call Function",
        action: "call",
        function: "yourFunction",
        args: [],
        expect: {
          success: true
        }
      }
    ]
  }
];

export const setup = async (hre) => {
  // Setup code before running scenarios
  console.log("Setting up scenario environment...");
  
  // Return any setup data needed by scenarios
  return {};
};

export const teardown = async (hre, setupData) => {
  // Cleanup code after running scenarios
  console.log("Cleaning up scenario environment...");
};
`;
  }

  const validateScenario = () => {
    const newErrors = {};
    
    if (!scenarioName.trim()) {
      newErrors.name = 'Scenario name is required';
    } else if (!/^[a-zA-Z0-9-_]+$/.test(scenarioName)) {
      newErrors.name = 'Scenario name can only contain letters, numbers, hyphens, and underscores';
    }
    
    if (!scenarioContent.trim()) {
      newErrors.content = 'Scenario content is required';
    }
    
    // Basic syntax validation
    try {
      new Function(scenarioContent);
    } catch (e) {
      newErrors.content = `Syntax error: ${e.message}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateScenario()) {
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: scenarioName,
          content: scenarioContent
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save scenario');
      }
      
      onSave && onSave(scenarioName);
    } catch (error) {
      setErrors({ save: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
            <i className="fas fa-plus text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">New Scenario</h1>
            <p className="text-gray-400">Create a new test scenario for your contracts</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <i className="fas fa-times"></i>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !scenarioName.trim()}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Save Scenario
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 gap-6">
        {/* Scenario Name */}
        <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4 flex items-center text-white">
            <i className="fas fa-tag text-blue-400 mr-2"></i>
            Scenario Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Scenario Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="my-awesome-scenario"
                className={`w-full bg-gray-900/50 border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${
                  errors.name 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Use lowercase letters, numbers, hyphens, and underscores only
              </p>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center text-white">
              <i className="fas fa-code text-purple-400 mr-2"></i>
              Scenario Code
            </h3>
            <div className="text-xs text-gray-400">
              JavaScript/TypeScript
            </div>
          </div>
          
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <CodeMirror
              value={scenarioContent}
              onChange={(value) => setScenarioContent(value)}
              extensions={[javascript()]}
              theme={oneDark}
              style={{
                fontSize: '14px',
                minHeight: '400px'
              }}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                dropCursor: false,
                allowMultipleSelections: false,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightSelectionMatches: false
              }}
            />
          </div>
          
          {errors.content && (
            <p className="text-red-400 text-sm mt-2">{errors.content}</p>
          )}
          
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
            <div className="flex items-start gap-2">
              <i className="fas fa-info-circle text-blue-400 mt-1"></i>
              <div className="text-sm text-blue-200">
                <strong>Template Structure:</strong>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• <code>metadata</code> - Scenario information and tags</li>
                  <li>• <code>scenarios</code> - Array of test scenarios with steps</li>
                  <li>• <code>setup</code> - Initialization function (optional)</li>
                  <li>• <code>teardown</code> - Cleanup function (optional)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors.save && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
          <div className="flex items-center gap-2">
            <i className="fas fa-exclamation-triangle text-red-400"></i>
            <span className="text-red-300">{errors.save}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewScenarioEditor;
