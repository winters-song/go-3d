import React from 'react';

interface NavigationButtonProps {
  onClick: () => void;
  path: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ onClick, path }) => {
  return (
    <button 
      className="p-2 text-white opacity-80 hover:opacity-100 rounded-md transition-colors border-2 border-gray-200 cursor-pointer"
      onClick={onClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d={path} />
      </svg>
    </button>
  );
};

export default NavigationButton; 