import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ title = 'Error', message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-200 flex items-start gap-3 my-4 glass-panel">
      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-red-300">{title}</h4>
        <p className="text-xs text-red-300/80 mt-1 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-900/40 hover:bg-red-900/60 border border-red-700/50 rounded-lg transition-colors text-red-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
