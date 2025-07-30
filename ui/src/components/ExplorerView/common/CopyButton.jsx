import React, { useState } from 'react';

const CopyButton = ({ textToCopy, text, size = 'default', variant = 'default', showLabel = true }) => {
  const [copied, setCopied] = useState(false);
  
  // Support both textToCopy and text props for backwards compatibility
  const copyText = textToCopy || text;

  const handleCopy = (e) => {
    e.stopPropagation(); // Prevent parent click events
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text:', err);
    });
  };

  // Size variants
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };

  // Style variants
  const variantClasses = {
    default: 'bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500',
    ghost: 'bg-transparent hover:bg-gray-700/50 border border-transparent hover:border-gray-600',
    primary: 'bg-blue-600 hover:bg-blue-500 border border-blue-500 hover:border-blue-400'
  };

  const iconSizeClass = size === 'small' ? 'text-xs' : size === 'large' ? 'text-lg' : 'text-sm';

  return (
    <button
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-lg flex items-center gap-1 transition-all duration-200
        text-white hover:scale-105 active:scale-95
        ${copied ? 'bg-green-600 border-green-500' : ''}
      `}
      onClick={handleCopy}
      title={`Copy ${copyText}`}
    >
      <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} ${iconSizeClass} ${copied ? 'text-green-200' : ''}`}></i>
      {showLabel && (
        <span className={copied ? 'text-green-200' : ''}>
          {copied ? 'Copied!' : 'Copy'}
        </span>
      )}
    </button>
  );
};

export default CopyButton;
