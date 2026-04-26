import apiClient from './client';

export const getUsers = async () => {
  const { data } = await apiClient.get('/admin/users');
  return data;
};
