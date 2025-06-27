import React from 'react';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import { toBase64, fromBase64 } from '../utils';

export default function Breadcrumb({ path, setPath }) {
  const decodedPath = fromBase64(path);

  const parts = decodedPath.split('/').filter(Boolean);

  const handleClick = (index) => {
    const newPath = '/' + parts.slice(0, index + 1).join('/');
    setPath(toBase64(newPath));
  };

  return (
    <nav className="text-lg text-gray-600 dark:text-gray-300 overflow-x-auto">
      <ol className="flex space-x-2 whitespace-nowrap">
        <li className="flex items-center">
          <button onClick={() => setPath(toBase64('/'))} title="go to home">
            <HomeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 cursor-pointer" />
          </button>
        </li>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <li className="flex items-center">
              <ChevronRightIcon className="w-5 h-5" />
            </li>
            <li className="flex items-center">
              {index === parts.length - 1 ? (
                <span className="text-gray-500 dark:text-gray-400">{part}</span>
              ) : (
                <button 
                  onClick={() => handleClick(index)} className="cursor-pointer font-semibold"
                  title={`go to ${part}`}
                >
                  {part}
                </button>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
