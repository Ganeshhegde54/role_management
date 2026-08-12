import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Users, Shield, Key, UserCheck, Plus, ArrowUpRight, ShieldCheck, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard statistics from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching backend statistics..." />;
  }

  if (error) {
    return <ErrorMessage title="Dashboard Error" message={error} onRetry={fetchStats} />;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-600/20 to-indigo-600/10 border-blue-500/30 text-blue-400',
      badge: `${stats?.activeUsers || 0} active`,
      link: '/users',
      permission: 'USER_READ',
    },
    {
      title: 'Total Roles',
      value: stats?.totalRoles || 0,
      icon: Shield,
      color: 'from-purple-600/20 to-pink-600/10 border-purple-500/30 text-purple-400',
      badge: 'Defined',
      link: '/roles',
      permission: 'ROLE_READ',
    },
    {
      title: 'Total Permissions',
      value: stats?.totalPermissions || 0,
      icon: Key,
      color: 'from-amber-600/20 to-orange-600/10 border-amber-500/30 text-amber-400',
      badge: 'Granular',
      link: '/permissions',
      permission: 'PERMISSION_READ',
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: UserCheck,
      color: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-400',
      badge: `${Math.round(((stats?.activeUsers || 0) / (stats?.totalUsers || 1)) * 100)}% active rate`,
      link: '/users',
      permission: 'USER_READ',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 mb-3">
              <Activity className="w-3.5 h-3.5" />
              Live RBAC System Status
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-brand-400">{user?.username}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Real-time snapshot of system users, role allocations, granular permission policies, and system activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasPermission('USER_CREATE') && (
              <button
                onClick={() => navigate('/users?action=new')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20 border border-brand-400/30"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            )}

            {hasPermission('ROLE_CREATE') && (
              <button
                onClick={() => navigate('/roles?action=new')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Add Role
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => hasPermission(card.permission) && navigate(card.link)}
              className={`glass-panel p-6 rounded-2xl border bg-gradient-to-br ${card.color} glass-panel-hover cursor-pointer flex flex-col justify-between relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 shadow-inner">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {card.value}
                </span>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300">
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Distribution Chart / Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100">User Distribution by Role</h3>
              <p className="text-xs text-slate-400">Total users assigned to each system role</p>
            </div>
            {hasPermission('ROLE_READ') && (
              <button
                onClick={() => navigate('/roles')}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                Manage Roles
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-4 flex-1 justify-center flex flex-col">
            {stats?.roleDistribution && Object.keys(stats.roleDistribution).length > 0 ? (
              Object.entries(stats.roleDistribution).map(([roleName, count]) => {
                const total = stats.totalUsers || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={roleName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
                        {roleName.replace('ROLE_', '')}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {count} users ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No role distribution data available</p>
            )}
          </div>
        </div>

        {/* Recent Users List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100">Recent Users</h3>
              <p className="text-xs text-slate-400">Latest accounts registered</p>
            </div>
            {hasPermission('USER_READ') && (
              <button
                onClick={() => navigate('/users')}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                View All
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3 flex-1">
            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((rUser) => (
                <div
                  key={rUser.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-brand-400">
                      {rUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{rUser.username}</p>
                      <p className="text-[10px] text-slate-400">{rUser.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      rUser.enabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {rUser.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No recent users found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
