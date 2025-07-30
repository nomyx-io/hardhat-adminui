import React, { createContext, useState, useContext } from "react";

const ScenarioContext = createContext();

export const useScenarios = () => {
  return useContext(ScenarioContext);
};

export const ScenarioProvider = ({ children }) => {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [report, setReport] = useState(null);

  const value = {
    selectedScenario,
    setSelectedScenario,
    report,
    setReport,
  };

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
};
