import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { permissionApi } from '../api/permissionApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { Key, Plus, Search, Eye, Edit2, Trash2, Shield, Folder } from 'lucide-react';

const Permissions = () => {
  const [permissionsData, setPermissionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', description: '', category: 'USER' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await permissionApi.getPermissions({ page: 0, size: 100, search });
      setPermissionsData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setFormError('Permission name is required');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await permissionApi.createPermission(formData);
      setIsCreateOpen(false);
      setFormData({ name: '', description: '', category: 'USER' });
      setToast({ message: 'Permission created successfully', type: 'success' });
      fetchPermissions();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create permission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await permissionApi.updatePermission(selectedPermission.id, formData);
      setIsEditOpen(false);
      setToast({ message: 'Permission updated successfully', type: 'success' });
      fetchPermissions();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update permission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPermission) return;
    setSubmitting(true);
    try {
      await permissionApi.deletePermission(selectedPermission.id);
      setIsDeleteOpen(false);
      setToast({ message: `Permission '${selectedPermission.name}' deleted`, type: 'success' });
      fetchPermissions();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete permission', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (perm) => {
    setSelectedPermission(perm);
    setFormData({
      name: perm.name,
      description: perm.description || '',
      category: perm.category || 'USER',
    });
    setFormError('');
    setIsEditOpen(true);
  };

  // Group permissions by category
  const grouped = (permissionsData?.content || []).reduce((acc, perm) => {
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
            <Key className="w-6 h-6 text-amber-400" />
            Permission Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System permissions defined for fine-grained authorization policies.
          </p>
        </div>

        {hasPermission('PERMISSION_CREATE') && (
          <button
            onClick={() => {
              setFormData({ name: '', description: '', category: 'USER' });
              setFormError('');
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            Create Permission
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
            placeholder="Search permissions by name, category, or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
      </div>

      {/* Grouped Category Listing */}
      {loading ? (
        <LoadingSpinner text="Fetching permission policies..." />
      ) : error ? (
        <ErrorMessage title="Failed to Load Permissions" message={error} onRetry={fetchPermissions} />
      ) : (
        <div className="space-y-6">
          {Object.keys(grouped).length > 0 ? (
            Object.keys(grouped).map((category) => (
              <div key={category} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Folder className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-extrabold text-amber-300 uppercase tracking-wider">
                    {category} Permissions ({grouped[category].length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[category].map((perm) => (
                    <div
                      key={perm.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-xs text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            {perm.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">#{perm.id}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                          {perm.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                        <button
                          onClick={() => navigate(`/permissions/${perm.id}`)}
                          className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Roles
                        </button>

                        <div className="flex items-center gap-1">
                          {hasPermission('PERMISSION_UPDATE') && (
                            <button
                              onClick={() => openEditModal(perm)}
                              className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {hasPermission('PERMISSION_DELETE') && (
                            <button
                              onClick={() => {
                                setSelectedPermission(perm);
                                setIsDeleteOpen(true);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800">
              <Key className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No permissions found matching search</p>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Permission Modal */}
      <Modal
        isOpen={isCreateOpen || isEditOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setIsEditOpen(false);
        }}
        title={isCreateOpen ? 'Create New Permission' : `Edit Permission: ${selectedPermission?.name}`}
      >
        <form onSubmit={isCreateOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Permission Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. USER_EXPORT or INVOICE_READ"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100"
            >
              <option value="USER">USER</option>
              <option value="ROLE">ROLE</option>
              <option value="PERMISSION">PERMISSION</option>
              <option value="GENERAL">GENERAL</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the action permitted by this authority key..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100"
            />
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
              className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-lg"
            >
              {submitting ? 'Saving...' : isCreateOpen ? 'Create Permission' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Permission"
        message={`Are you sure you want to delete permission '${selectedPermission?.name}'? Roles currently using this permission will be updated.`}
        loading={submitting}
      />
    </div>
  );
};

export default Permissions;
