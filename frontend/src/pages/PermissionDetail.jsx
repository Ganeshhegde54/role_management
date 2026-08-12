import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { permissionApi } from '../api/permissionApi';
import { roleApi } from '../api/roleApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Key, Shield, ArrowLeft, Calendar, Tag, CheckCircle2 } from 'lucide-react';

const PermissionDetail = () => {
  const { id } = useParams();
  const [permissionData, setPermissionData] = useState(null);
  const [associatedRoles, setAssociatedRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchPermissionDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await permissionApi.getPermissionById(id);
      setPermissionData(data);

      // Fetch all roles to find which contain this permission
      const rolesList = await roleApi.getRolesList();
      const rolesWithPerm = rolesList.filter((r) => r.permissions?.some((p) => p.id === data.id));
      setAssociatedRoles(rolesWithPerm);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch permission details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissionDetail();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading permission detail..." />;
  if (error) return <ErrorMessage title="Permission Not Found" message={error} onRetry={fetchPermissionDetail} />;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/permissions')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Permissions List
      </button>

      {/* Permission Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center font-mono font-bold text-xl text-white shadow-xl shadow-amber-600/20 border border-white/10">
              <Key className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-mono font-bold text-amber-300">{permissionData.name}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {permissionData.category || 'GENERAL'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {permissionData.description || 'No detailed policy description configured.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            ID: #{permissionData.id}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center gap-3">
            <Tag className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Policy Domain</p>
              <p className="text-sm font-bold text-slate-200">{permissionData.category}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Created Timestamp</p>
              <p className="text-sm text-slate-200">
                {permissionData.createdAt ? new Date(permissionData.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Associated Roles Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-purple-400" />
          Roles Granting this Permission ({associatedRoles.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {associatedRoles.length > 0 ? (
            associatedRoles.map((role) => (
              <div
                key={role.id}
                onClick={() => navigate(`/roles/${role.id}`)}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100">{role.name.replace('ROLE_', '')}</p>
                    <p className="text-[10px] text-slate-400">{role.description}</p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-purple-300">View Role →</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic col-span-full">No system roles currently assign this permission.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionDetail;
