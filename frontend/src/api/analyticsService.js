import apiClient from './client';

export const getOrganizerAnalytics = async () => {
  const { data } = await apiClient.get('/analytics/organizer');
  return data;
};
