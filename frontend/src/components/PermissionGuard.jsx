import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const PermissionGuard = ({ permission, children, fallback = null, showWarning = false }) => {
  const { hasPermission } = useAuth();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  if (showWarning) {
    return (
      <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-300 flex items-start gap-3 my-4">
        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">Access Restricted</h4>
          <p className="text-xs text-red-400/80 mt-1">
            You do not have the required permission (<code className="font-mono">{permission}</code>) to access this feature.
          </p>
        </div>
      </div>
    );
  }

  return fallback;
};

export default PermissionGuard;
