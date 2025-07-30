import React from 'react';

const CodeBlock = ({ code, language }) => {
  return (
    <div className="code-block">
      <pre>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
