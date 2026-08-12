import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield, Key } from 'lucide-react';

const Navbar = ({ onMobileMenuToggle }) => {
  const { user, roles, permissions, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-500/20">
            R
          </div>
          <span className="font-bold text-lg text-white tracking-tight hidden sm:inline">
            Role<span className="text-brand-400">Vault</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Badge */}
        {roles.length > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
            <Shield className="w-3.5 h-3.5" />
            {roles[0].replace('ROLE_', '')}
          </div>
        )}

        {/* Permission Count Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          <Key className="w-3.5 h-3.5 text-amber-400" />
          {permissions.length} Permissions
        </div>

        {/* User Info Avatar Dropdown / Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-semibold shadow-inner">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.username}</p>
              <p className="text-[10px] text-slate-400">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
