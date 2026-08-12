import api from './axios';

export const userApi = {
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUsersList: async () => {
    const response = await api.get('/users/list');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (user) => {
    const response = await api.post('/users', user);
    return response.data;
  },

  updateUser: async (id, user) => {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  assignRoles: async (userId, roleIds) => {
    const response = await api.post(`/users/${userId}/roles`, { roleIds });
    return response.data;
  },

  removeRole: async (userId, roleId) => {
    const response = await api.delete(`/users/${userId}/roles/${roleId}`);
    return response.data;
  },

  toggleStatus: async (userId) => {
    const response = await api.patch(`/users/${userId}/toggle-status`);
    return response.data;
  },
};
