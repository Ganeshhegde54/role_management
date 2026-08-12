import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { User, Mail, Shield, Key, Calendar, ArrowLeft, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';

const UserDetail = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const fetchUserDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userApi.getUserById(id);
      setUserData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const handleToggleStatus = async () => {
    try {
      const updated = await userApi.toggleStatus(id);
      setUserData(updated);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner text="Loading user detail..." />;
  if (error) return <ErrorMessage title="User Not Found" message={error} onRetry={fetchUserDetail} />;

  return (
    <div className="space-y-6">
      {/* Top Back Navigation */}
      <button
        onClick={() => navigate('/users')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users List
      </button>

      {/* Main Profile Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-brand-600/20 border border-white/10">
              {userData.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{userData.username}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    userData.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {userData.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />
                {userData.email}
              </p>
            </div>
          </div>

          {hasPermission('USER_UPDATE') && (
            <button
              onClick={handleToggleStatus}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                userData.enabled
                  ? 'bg-red-950/30 border-red-500/30 text-red-300 hover:bg-red-900/40'
                  : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
              }`}
            >
              {userData.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {userData.enabled ? 'Disable Account' : 'Enable Account'}
            </button>
          )}
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">User ID</p>
            <p className="text-sm font-mono text-slate-200">#{userData.id}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Registration Date</p>
            <p className="text-sm text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {userData.createdAt ? new Date(userData.createdAt).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Updated</p>
            <p className="text-sm text-slate-200">
              {userData.updatedAt ? new Date(userData.updatedAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Roles & Permissions Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roles Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-400" />
            Assigned Roles ({userData.roles?.length || 0})
          </h3>
          <div className="space-y-3">
            {userData.roles && userData.roles.length > 0 ? (
              userData.roles.map((role) => (
                <div key={role.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-100">{role.name.replace('ROLE_', '')}</span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: #{role.id}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{role.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No roles assigned to this user.</p>
            )}
          </div>
        </div>

        {/* Effective Permissions Matrix */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-amber-400" />
            Effective Permissions ({userData.permissions?.length || 0})
          </h3>
          <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-1">
            {userData.permissions && userData.permissions.length > 0 ? (
              userData.permissions.map((perm) => (
                <span
                  key={perm}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  {perm}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No permissions derived for this user.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
