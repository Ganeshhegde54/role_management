import api from './axios';

export const permissionApi = {
  getPermissions: async (params = {}) => {
    const response = await api.get('/permissions', { params });
    return response.data;
  },

  getPermissionsList: async () => {
    const response = await api.get('/permissions/list');
    return response.data;
  },

  getPermissionById: async (id) => {
    const response = await api.get(`/permissions/${id}`);
    return response.data;
  },

  createPermission: async (permission) => {
    const response = await api.post('/permissions', permission);
    return response.data;
  },

  updatePermission: async (id, permission) => {
    const response = await api.put(`/permissions/${id}`, permission);
    return response.data;
  },

  deletePermission: async (id) => {
    const response = await api.delete(`/permissions/${id}`);
    return response.data;
  },
};
