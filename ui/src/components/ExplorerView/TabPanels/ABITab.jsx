import React from 'react';
import CodeBlock from '../common/CodeBlock';
import CopyButton from '../common/CopyButton';

const ABITab = ({ abi }) => {
  const abiString = JSON.stringify(abi, null, 2);

  return (
    <div className="artifact-card bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <i className="fas fa-file-code text-primary mr-2"></i>
          Contract ABI
        </h3>
        <CopyButton textToCopy={abiString} />
      </div>
      <CodeBlock code={abiString} language="json" />
    </div>
  );
};

export default ABITab;
