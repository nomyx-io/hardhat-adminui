/* eslint-disable no-eval */
/* eslint-disable no-new-func */
import React, { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const ScenarioEditor = ({ scenarioName, onSave, onCancel }) => {
  const [scenarioContent, setScenarioContent] = useState('');
  const [activeTab, setActiveTab] = useState('flowchart');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [parsedScenario, setParsedScenario] = useState(null);

  const loadScenario = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scenarios/${scenarioName}`);
      if (response.ok) {
        const data = await response.json();
        setScenarioContent(data.content || '');
        parseScenario(data.content || '');
      } else {
        setErrors({ load: 'Failed to load scenario' });
      }
    } catch (err) {
      setErrors({ load: err.message });
    } finally {
      setLoading(false);
    }
  }, [scenarioName]);

  useEffect(() => {
    if (scenarioName) {
      loadScenario();
    }
  }, [scenarioName, loadScenario]);

  const parseScenario = (content) => {
    try {
      // Simple parsing to extract scenario structure for flowchart
      const metadataMatch = content.match(/export\s+const\s+metadata\s*=\s*({[\s\S]*?});/);
      const scenariosMatch = content.match(/export\s+const\s+scenarios\s*=\s*(\[[\s\S]*?\]);/);

      let metadata = {};
      let scenarios = [];

      if (metadataMatch) {
        metadata = eval(`(${metadataMatch[1]})`);
      }

      if (scenariosMatch) {
        scenarios = eval(`(${scenariosMatch[1]})`);
      }

      setParsedScenario({ metadata, scenarios });
    } catch (e) {
      console.error('Error parsing scenario:', e);
      setParsedScenario(null);
    }
  };

  const handleContentChange = (value) => {
    setScenarioContent(value);
    parseScenario(value);
  };

  const validateScenario = () => {
    const newErrors = {};

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

      const response = await fetch(`/api/scenarios/${scenarioName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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

  const renderFlowchartView = () => {
    if (!parsedScenario || !parsedScenario.scenarios) {
      return (
        <div className="text-center py-16">
          <i className="fas fa-code text-gray-500 text-4xl mb-4"></i>
          <h3 className="text-xl text-gray-400 mb-2">Unable to Parse Scenario</h3>
          <p className="text-gray-500">Switch to the Code tab to edit the scenario</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Metadata */}
        <div className="artifact-card bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
          <h3 className="text-lg font-bold mb-4 flex items-center text-white">
            <i className="fas fa-info-circle text-blue-400 mr-2"></i>
            Scenario Metadata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-blue-300 text-sm font-medium">Name:</span>
              <p className="text-white">{parsedScenario.metadata.name || 'Unnamed'}</p>
            </div>
            <div>
              <span className="text-blue-300 text-sm font-medium">Version:</span>
              <p className="text-white">{parsedScenario.metadata.version || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-blue-300 text-sm font-medium">Description:</span>
              <p className="text-white">{parsedScenario.metadata.description || 'No description'}</p>
            </div>
            {parsedScenario.metadata.tags && (
              <div className="md:col-span-2">
                <span className="text-blue-300 text-sm font-medium">Tags:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {parsedScenario.metadata.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-600/20 text-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scenarios Flowchart */}
        {parsedScenario.scenarios.map((scenario, index) => (
          <div key={index} className="artifact-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-4 flex items-center text-white">
              <i className="fas fa-play text-green-400 mr-2"></i>
              {scenario.name || `Scenario ${index + 1}`}
            </h3>

            {scenario.description && (
              <p className="text-gray-400 mb-4">{scenario.description}</p>
            )}

            {/* Steps Flow */}
            <div className="space-y-3">
              {scenario.steps && scenario.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="relative">
                  {/* Step Card */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {stepIndex + 1}
                    </div>

                    <div className="flex-1 ml-4 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">
                            {step.name || `Step ${stepIndex + 1}`}
                          </h4>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center">
                              <span className="text-gray-400">Action:</span>
                              <span className="ml-1 px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                                {step.action}
                              </span>
                            </div>
                            {step.contract && (
                              <div className="flex items-center">
                                <span className="text-gray-400">Contract:</span>
                                <span className="ml-1 text-purple-300">{step.contract}</span>
                              </div>
                            )}
                            {step.function && (
                              <div className="flex items-center">
                                <span className="text-gray-400">Function:</span>
                                <span className="ml-1 text-green-300">{step.function}</span>
                              </div>
                            )}
                          </div>
                          {step.expect && (
                            <div className="mt-2 text-xs">
                              <span className="text-gray-400">Expected:</span>
                              <span className="ml-1 text-yellow-300">
                                {JSON.stringify(step.expect)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0 ml-4">
                          <i className={`fas ${getStepIcon(step.action)} text-gray-400`}></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connector */}
                  {stepIndex < scenario.steps.length - 1 && (
                    <div className="flex justify-start ml-4 py-2">
                      <div className="w-px h-6 bg-gradient-to-b from-purple-500 to-indigo-600"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getStepIcon = (action) => {
    switch (action) {
      case 'deploy': return 'fa-rocket';
      case 'call': return 'fa-play';
      case 'send': return 'fa-paper-plane';
      case 'wait': return 'fa-clock';
      case 'assert': return 'fa-check';
      case 'expect': return 'fa-eye';
      default: return 'fa-cog';
    }
  };

  const tabs = [
    { id: 'flowchart', label: 'Flowchart View', icon: 'fas fa-project-diagram' },
    { id: 'code', label: 'Code Editor', icon: 'fas fa-code' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-ping opacity-20"></div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading Scenario</h3>
            <p className="text-gray-400">Fetching {scenarioName}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
            <i className="fas fa-edit text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Scenario</h1>
            <p className="text-gray-400">{scenarioName}</p>
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
            disabled={saving}
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
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 p-1 bg-gray-900/50 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'flowchart' && renderFlowchartView()}

        {activeTab === 'code' && (
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
                onChange={handleContentChange}
                extensions={[javascript()]}
                theme={oneDark}
                style={{
                  fontSize: '14px',
                  minHeight: '500px'
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
          </div>
        )}
      </div>

      {/* Error Display */}
      {(errors.load || errors.save) && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
          <div className="flex items-center gap-2">
            <i className="fas fa-exclamation-triangle text-red-400"></i>
            <span className="text-red-300">{errors.load || errors.save}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioEditor;
