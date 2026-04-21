import apiClient from './client';

export const registerForEvent = async (eventId) => {
  const { data } = await apiClient.post(`/registrations/${eventId}`);
  return data;
};

export const getMyRegistrations = async () => {
  const { data } = await apiClient.get('/registrations/my');
  return data;
};

export const getEventAttendees = async (eventId) => {
  const { data } = await apiClient.get(`/registrations/event/${eventId}`);
  return data;
};

export const cancelRegistration = async (registrationId) => {
  const { data } = await apiClient.put(`/registrations/${registrationId}/cancel`);
  return data;
};
