import React, { useState } from 'react';

const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm flex items-center"
      onClick={handleCopy}
    >
      <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} mr-1`}></i>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

export default CopyButton;
