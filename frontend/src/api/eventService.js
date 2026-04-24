import apiClient from './client';

export const getEvents = async () => {
  const { data } = await apiClient.get('/events');
  return data;
};

export const getMyEvents = async () => {
  const { data } = await apiClient.get('/events/organizer/my');
  return data;
};

export const getEventById = async (id) => {
  const { data } = await apiClient.get(`/events/${id}`);
  return data;
};

export const createEvent = async (eventData) => {
  // eventData might be FormData because of the image upload
  const isFormData = eventData instanceof FormData;
  
  const { data } = await apiClient.post('/events', eventData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return data;
};

export const updateEvent = async (id, eventData) => {
  const isFormData = eventData instanceof FormData;

  const { data } = await apiClient.put(`/events/${id}`, eventData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return data;
};

export const deleteEvent = async (id) => {
  const { data } = await apiClient.delete(`/events/${id}`);
  return data;
};

// Admin Endpoints
export const getPendingEvents = async () => {
  const { data } = await apiClient.get('/events/admin/pending');
  return data;
};

export const approveEvent = async (id) => {
  const { data } = await apiClient.put(`/events/admin/${id}/approve`);
  return data;
};

export const rejectEvent = async (id) => {
  const { data } = await apiClient.put(`/events/admin/${id}/reject`);
  return data;
};
