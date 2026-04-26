import apiClient from './client';

export const getUsers = async () => {
  const { data } = await apiClient.get('/admin/users');
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await apiClient.delete(`/admin/users/${id}`);
  return data;
};
