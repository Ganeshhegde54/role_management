import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roleApi } from '../api/roleApi';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Shield, Key, Users, ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';

const RoleDetail = () => {
  const { id } = useParams();
  const [roleData, setRoleData] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const fetchRoleDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await roleApi.getRoleById(id);
      setRoleData(data);

      // Fetch users assigned to this role
      const usersList = await userApi.getUsersList();
      const roleUsers = usersList.filter((u) => u.roles?.some((r) => r.id === data.id));
      setAssignedUsers(roleUsers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch role details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleDetail();
  }, [id]);

  const handleRemovePermission = async (permissionId) => {
    try {
      const updated = await roleApi.removePermission(id, permissionId);
      setRoleData(updated);
    } catch (err) {
      alert('Failed to remove permission');
    }
  };

  if (loading) return <LoadingSpinner text="Loading role detail..." />;
  if (error) return <ErrorMessage title="Role Not Found" message={error} onRetry={fetchRoleDetail} />;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/roles')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Roles List
      </button>

      {/* Role Banner Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-purple-600/20 border border-white/10">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{roleData.name}</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {roleData.description || 'No description provided for this role.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              ID: #{roleData.id}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center gap-3">
            <Key className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Permissions</p>
              <p className="text-sm font-bold text-slate-200">{roleData.permissions?.length || 0} permissions</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center gap-3">
            <Users className="w-5 h-5 text-brand-400" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assigned Users</p>
              <p className="text-sm font-bold text-slate-200">{assignedUsers.length} active users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Grid & Assigned Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permissions List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-amber-400" />
            Assigned Permissions ({roleData.permissions?.length || 0})
          </h3>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {roleData.permissions && roleData.permissions.length > 0 ? (
              roleData.permissions.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-mono font-semibold text-slate-200">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.description}</p>
                    </div>
                  </div>

                  {hasPermission('ROLE_UPDATE') && (
                    <button
                      onClick={() => handleRemovePermission(p.id)}
                      title="Remove Permission from Role"
                      className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No permissions assigned to this role.</p>
            )}
          </div>
        </div>

        {/* Assigned Users List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-brand-400" />
            Users with this Role ({assignedUsers.length})
          </h3>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {assignedUsers.length > 0 ? (
              assignedUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => navigate(`/users/${u.id}`)}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-brand-500/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-brand-400">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{u.username}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.enabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {u.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No users currently assigned to this role.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetail;
