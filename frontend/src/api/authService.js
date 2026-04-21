import apiClient from './client';

export const login = async (email, password) => {
  const { data } = await apiClient.post('/auth/login', { email, password });
  if (data) {
    localStorage.setItem('userInfo', JSON.stringify(data));
  }
  return data;
};

export const register = async (userData) => {
  const { data } = await apiClient.post('/auth/register', userData);
  if (data) {
    localStorage.setItem('userInfo', JSON.stringify(data));
  }
  return data;
};

export const updateProfile = async (userData) => {
  const { data } = await apiClient.put('/auth/profile', userData);
  if (data) {
    localStorage.setItem('userInfo', JSON.stringify(data));
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem('userInfo');
};
