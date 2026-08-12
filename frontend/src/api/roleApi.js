import api from './axios';

export const roleApi = {
  getRoles: async (params = {}) => {
    const response = await api.get('/roles', { params });
    return response.data;
  },

  getRolesList: async () => {
    const response = await api.get('/roles/list');
    return response.data;
  },

  getRoleById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  createRole: async (role) => {
    const response = await api.post('/roles', role);
    return response.data;
  },

  updateRole: async (id, role) => {
    const response = await api.put(`/roles/${id}`, role);
    return response.data;
  },

  deleteRole: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  assignPermissions: async (roleId, permissionIds) => {
    const response = await api.post(`/roles/${roleId}/permissions`, { permissionIds });
    return response.data;
  },

  removePermission: async (roleId, permissionId) => {
    const response = await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
    return response.data;
  },
};
