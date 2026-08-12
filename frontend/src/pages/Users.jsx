import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { roleApi } from '../api/roleApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import PermissionGuard from '../components/PermissionGuard';
import { Users as UsersIcon, Plus, Search, Eye, Edit2, Shield, Trash2, ToggleLeft, ToggleRight, Check } from 'lucide-react';

const Users = () => {
  const [usersData, setUsersData] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRoleAssignOpen, setIsRoleAssignOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form States
  const [formData, setFormData] = useState({ username: '', email: '', password: '', enabled: true, roleIds: [] });
  const [assignedRoleIds, setAssignedRoleIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userApi.getUsers({ page, size: 10, search });
      setUsersData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchRoles = async () => {
    try {
      const roles = await roleApi.getRolesList();
      setAllRoles(roles);
    } catch (err) {
      console.error('Failed to load roles list for selection');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setFormError('Username, email, and password are required');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await userApi.createUser(formData);
      setIsCreateOpen(false);
      setFormData({ username: '', email: '', password: '', enabled: true, roleIds: [] });
      setToast({ message: 'User created successfully', type: 'success' });
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await userApi.updateUser(selectedUser.id, {
        email: formData.email,
        password: formData.password || undefined,
        enabled: formData.enabled,
        roleIds: formData.roleIds,
      });
      setIsEditOpen(false);
      setToast({ message: 'User updated successfully', type: 'success' });
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleAssignSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userApi.assignRoles(selectedUser.id, assignedRoleIds);
      setIsRoleAssignOpen(false);
      setToast({ message: 'Roles updated successfully', type: 'success' });
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to assign roles');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await userApi.deleteUser(selectedUser.id);
      setIsDeleteOpen(false);
      setToast({ message: `User '${selectedUser.username}' deleted`, type: 'success' });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete user', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await userApi.toggleStatus(user.id);
      setToast({ message: `User status changed to ${!user.enabled ? 'Active' : 'Disabled'}`, type: 'success' });
      fetchUsers();
    } catch (err) {
      setToast({ message: 'Failed to update user status', type: 'error' });
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      enabled: user.enabled,
      roleIds: user.roles ? user.roles.map((r) => r.id) : [],
    });
    setFormError('');
    setIsEditOpen(true);
  };

  const openRoleAssignModal = (user) => {
    setSelectedUser(user);
    setAssignedRoleIds(user.roles ? user.roles.map((r) => r.id) : []);
    setFormError('');
    setIsRoleAssignOpen(true);
  };

  const toggleRoleSelection = (roleId) => {
    if (assignedRoleIds.includes(roleId)) {
      setAssignedRoleIds(assignedRoleIds.filter((id) => id !== roleId));
    } else {
      setAssignedRoleIds([...assignedRoleIds, roleId]);
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <UsersIcon className="w-6 h-6 text-brand-400" />
            User Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage system user accounts, toggle statuses, and assign roles.
          </p>
        </div>

        {hasPermission('USER_CREATE') && (
          <button
            onClick={() => {
              setFormData({ username: '', email: '', password: '', enabled: true, roleIds: [] });
              setFormError('');
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20"
          >
            <Plus className="w-4 h-4" />
            Add New User
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search users by username or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>
      </div>

      {/* Main Users Table */}
      {loading ? (
        <LoadingSpinner text="Fetching user records..." />
      ) : error ? (
        <ErrorMessage title="Failed to Load Users" message={error} onRetry={fetchUsers} />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Assigned Roles</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {usersData?.content && usersData.content.length > 0 ? (
                  usersData.content.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">#{user.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-brand-400">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100">{user.username}</p>
                            <p className="text-[11px] text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <span
                                key={role.id}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20"
                              >
                                {role.name.replace('ROLE_', '')}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">No Roles</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => hasPermission('USER_UPDATE') && handleToggleStatus(user)}
                          disabled={!hasPermission('USER_UPDATE')}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                            user.enabled
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                          }`}
                        >
                          {user.enabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          {user.enabled ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/users/${user.id}`)}
                            title="View User Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {hasPermission('USER_UPDATE') && (
                            <>
                              <button
                                onClick={() => openEditModal(user)}
                                title="Edit User"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openRoleAssignModal(user)}
                                title="Assign Roles"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                              >
                                <Shield className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {hasPermission('USER_DELETE') && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteOpen(true);
                              }}
                              title="Delete User"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500 text-xs">
                      No user records found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {usersData && usersData.totalPages > 1 && (
            <div className="px-4 py-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Page <span className="font-semibold text-slate-200">{usersData.page + 1}</span> of{' '}
                <span className="font-semibold text-slate-200">{usersData.totalPages}</span> ({usersData.totalElements} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={usersData.page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={usersData.last}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create User Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New User Account">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. johndoe"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. john@example.com"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-medium bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg"
            >
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit User: ${selectedUser?.username}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              New Password <span className="text-[10px] text-slate-500">(Leave blank to keep current)</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="enabledCheck"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-0"
            />
            <label htmlFor="enabledCheck" className="text-xs text-slate-300">
              Account Enabled Status
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-xs font-medium bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Role Assignment Modal */}
      <Modal isOpen={isRoleAssignOpen} onClose={() => setIsRoleAssignOpen(false)} title={`Assign Roles: ${selectedUser?.username}`}>
        <form onSubmit={handleRoleAssignSubmit} className="space-y-4">
          <p className="text-xs text-slate-400">Select system roles to assign to this user:</p>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {allRoles.map((role) => {
              const isSelected = assignedRoleIds.includes(role.id);
              return (
                <div
                  key={role.id}
                  onClick={() => toggleRoleSelection(role.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-600/20 border-brand-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold">{role.name.replace('ROLE_', '')}</p>
                    <p className="text-[10px] text-slate-400">{role.description}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-400 shrink-0" />}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsRoleAssignOpen(false)}
              className="px-4 py-2 text-xs font-medium bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg"
            >
              {submitting ? 'Saving...' : 'Update Roles'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        message={`Are you sure you want to delete user '${selectedUser?.username}'? This action cannot be undone.`}
        loading={submitting}
      />
    </div>
  );
};

export default Users;
