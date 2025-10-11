import React from 'react';

/**
 * Simple Markdown renderer for AI analysis
 * Safely converts markdown to HTML without dangerouslySetInnerHTML
 */
export const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = [];
  let currentTable = [];
  let inTable = false;

  const processLine = (line, index) => {
    // Headers
    if (line.startsWith('## ')) {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc pl-5 my-2">
            {currentList}
          </ul>
        );
        currentList = [];
      }
      return (
        <h2 key={index} className="text-lg font-bold mt-4 mb-2">
          {line.substring(3)}
        </h2>
      );
    }

    // Tables
    if (line.includes('|') && line.trim().startsWith('|')) {
      if (!inTable) {
        inTable = true;
        currentTable = [];
      }
      const cells = line
        .split('|')
        .filter(cell => cell.trim())
        .map(cell => cell.trim());
      
      currentTable.push(cells);
      return null;
    } else if (inTable) {
      inTable = false;
      const table = (
        <table key={`table-${index}`} className="min-w-full border-collapse border border-gray-300 my-4">
          <tbody>
            {currentTable.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="border border-gray-300 px-4 py-2"
                  >
                    {processBold(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      currentTable = [];
      return table;
    }

    // List items
    if (line.trim().startsWith('- ')) {
      currentList.push(
        <li key={`li-${index}`}>{processBold(line.substring(2))}</li>
      );
      return null;
    } else if (currentList.length > 0) {
      const list = (
        <ul key={`list-${index}`} className="list-disc pl-5 my-2">
          {currentList}
        </ul>
      );
      currentList = [];
      elements.push(list);
    }

    // Bold text and regular paragraphs
    if (line.trim()) {
      return (
        <p key={index} className="my-2">
          {processBold(line)}
        </p>
      );
    }

    return null;
  };

  const processBold = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  lines.forEach((line, index) => {
    const element = processLine(line, index);
    if (element) {
      elements.push(element);
    }
  });

  // Flush remaining list items
  if (currentList.length > 0) {
    elements.push(
      <ul key="list-final" className="list-disc pl-5 my-2">
        {currentList}
      </ul>
    );
  }

  // Flush remaining table
  if (currentTable.length > 0) {
    elements.push(
      <table key="table-final" className="min-w-full border-collapse border border-gray-300 my-4">
        <tbody>
          {currentTable.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="border border-gray-300 px-4 py-2"
                >
                  {processBold(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return <div className="prose dark:prose-invert max-w-none text-sm">{elements}</div>;
};
