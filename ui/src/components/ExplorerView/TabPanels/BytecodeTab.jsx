import React from 'react';
import CodeBlock from '../common/CodeBlock';
import CopyButton from '../common/CopyButton';

const BytecodeTab = ({ bytecode }) => {
  return (
    <div className="artifact-card bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <i className="fas fa-microchip text-secondary mr-2"></i>
          Contract Bytecode
        </h3>
        <CopyButton textToCopy={bytecode} />
      </div>
      <CodeBlock code={bytecode} />
    </div>
  );
};

export default BytecodeTab;
