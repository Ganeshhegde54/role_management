import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Shield, Key, UserCheck, ChevronRight } from 'lucide-react';

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const { hasPermission } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'User Management',
      path: '/users',
      icon: Users,
      show: hasPermission('USER_READ'),
    },
    {
      name: 'Role Management',
      path: '/roles',
      icon: Shield,
      show: hasPermission('ROLE_READ'),
    },
    {
      name: 'Permission Management',
      path: '/permissions',
      icon: Key,
      show: hasPermission('PERMISSION_READ'),
    },
    {
      name: 'My Profile',
      path: '/profile',
      icon: UserCheck,
      show: true,
    },
  ];

  const filteredItems = navItems.filter((item) => item.show);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-md transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between p-4">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Main Navigation
              </p>
              <nav className="space-y-1">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onMobileClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-md shadow-brand-500/10'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 text-xs text-slate-400">
            <p className="font-semibold text-slate-300">RBAC System v1.0</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Stateless JWT Auth Active</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
