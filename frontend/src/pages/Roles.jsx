import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { roleApi } from '../api/roleApi';
import { permissionApi } from '../api/permissionApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { Shield, Plus, Search, Eye, Edit2, Trash2, Key, Users, Check } from 'lucide-react';

const Roles = () => {
  const [rolesData, setRolesData] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', description: '', permissionIds: [] });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await roleApi.getRoles({ page: 0, size: 50, search });
      setRolesData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchPermissions = async () => {
    try {
      const perms = await permissionApi.getPermissionsList();
      setAllPermissions(perms);
    } catch (err) {
      console.error('Failed to load permissions list');
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setFormError('Role name is required');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await roleApi.createRole(formData);
      setIsCreateOpen(false);
      setFormData({ name: '', description: '', permissionIds: [] });
      setToast({ message: 'Role created successfully', type: 'success' });
      fetchRoles();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await roleApi.updateRole(selectedRole.id, formData);
      setIsEditOpen(false);
      setToast({ message: 'Role updated successfully', type: 'success' });
      fetchRoles();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;
    setSubmitting(true);
    try {
      await roleApi.deleteRole(selectedRole.id);
      setIsDeleteOpen(false);
      setToast({ message: `Role '${selectedRole.name}' deleted`, type: 'success' });
      fetchRoles();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete role', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermissionCheckbox = (permId) => {
    const currentIds = formData.permissionIds || [];
    if (currentIds.includes(permId)) {
      setFormData({ ...formData, permissionIds: currentIds.filter((id) => id !== permId) });
    } else {
      setFormData({ ...formData, permissionIds: [...currentIds, permId] });
    }
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions ? role.permissions.map((p) => p.id) : [],
    });
    setFormError('');
    setIsEditOpen(true);
  };

  // Group permissions by category for clean UI rendering
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const cat = perm.category || 'GENERAL';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-purple-400" />
            Role Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Define system roles and configure granular permission access policies.
          </p>
        </div>

        {hasPermission('ROLE_CREATE') && (
          <button
            onClick={() => {
              setFormData({ name: '', description: '', permissionIds: [] });
              setFormError('');
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            Create New Role
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles by name or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>

      {/* Roles Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching roles..." />
      ) : error ? (
        <ErrorMessage title="Failed to Load Roles" message={error} onRetry={fetchRoles} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rolesData?.content && rolesData.content.length > 0 ? (
            rolesData.content.map((role) => (
              <div
                key={role.id}
                className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {role.name.replace('ROLE_', '')}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {role.usersCount || 0} Users
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 mb-1">{role.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {role.description || 'No description provided for this role.'}
                  </p>

                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-slate-300 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        Permissions ({role.permissions?.length || 0})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {role.permissions && role.permissions.length > 0 ? (
                        role.permissions.map((p) => (
                          <span
                            key={p.id}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300"
                          >
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No permissions assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => navigate(`/roles/${role.id}`)}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </button>

                  <div className="flex items-center gap-1">
                    {hasPermission('ROLE_UPDATE') && (
                      <button
                        onClick={() => openEditModal(role)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {hasPermission('ROLE_DELETE') && (
                      <button
                        onClick={() => {
                          setSelectedRole(role);
                          setIsDeleteOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 glass-panel rounded-2xl border border-slate-800">
              <Shield className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No roles found matching query</p>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Role Modal */}
      <Modal
        isOpen={isCreateOpen || isEditOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setIsEditOpen(false);
        }}
        title={isCreateOpen ? 'Create New System Role' : `Edit Role: ${selectedRole?.name}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={isCreateOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Role Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. ROLE_MANAGER or MANAGER"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100"
            />
            <p className="text-[10px] text-slate-500 mt-1">Prefix 'ROLE_' will be automatically formatted.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the responsibility and access level of this role..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Assign Permissions Matrix</label>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2 border border-slate-800 rounded-xl p-3 bg-slate-950/50">
              {Object.keys(groupedPermissions).map((category) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider border-b border-slate-800/80 pb-1">
                    {category} Permissions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupedPermissions[category].map((perm) => {
                      const isChecked = (formData.permissionIds || []).includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          onClick={() => togglePermissionCheckbox(perm.id)}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-purple-600/20 border-purple-500/40 text-purple-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <p className="font-mono font-semibold">{perm.name}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{perm.description}</p>
                          </div>
                          {isChecked && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setIsEditOpen(false);
              }}
              className="px-4 py-2 text-xs font-medium bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg"
            >
              {submitting ? 'Saving...' : isCreateOpen ? 'Create Role' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Role"
        message={`Are you sure you want to delete role '${selectedRole?.name}'? Users assigned to this role will lose its permissions.`}
        loading={submitting}
      />
    </div>
  );
};

export default Roles;
