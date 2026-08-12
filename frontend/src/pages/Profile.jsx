import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Key, CheckCircle2, Lock } from 'lucide-react';

const Profile = () => {
  const { user, roles, permissions } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <User className="w-6 h-6 text-brand-400" />
          My Profile & Authorization
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your account profile details, security token claims, and active permissions.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-800">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-3xl text-white shadow-2xl shadow-brand-500/20 border border-white/10">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Authenticated
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Account ID: #{user?.id}</p>
          </div>
        </div>

        {/* Security Token Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center gap-3">
            <Lock className="w-5 h-5 text-brand-400" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Session Architecture</p>
              <p className="text-xs font-semibold text-slate-200">Stateless JWT (JJWTV0.12.5)</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center gap-3">
            <Key className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Authority Count</p>
              <p className="text-xs font-semibold text-slate-200">{permissions.length} Granular Authorities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Roles & Permissions breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roles */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-400" />
            Your Assigned System Roles ({roles.length})
          </h3>

          <div className="space-y-3">
            {roles.map((roleName) => (
              <div key={roleName} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-purple-300">{roleName.replace('ROLE_', '')}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{roleName}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-amber-400" />
            Granted Authorities & Permissions ({permissions.length})
          </h3>

          <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-1">
            {permissions.map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                {perm}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
