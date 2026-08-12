import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <div
        className={`${sizeClasses[size]} border-brand-500/30 border-t-brand-500 rounded-full animate-spin`}
      />
      {text && <p className="text-sm font-medium text-slate-400 animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
