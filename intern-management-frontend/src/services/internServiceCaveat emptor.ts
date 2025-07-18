import api from './api';

export const getInterns = (page: number, size: number, search?: string, filters?: Record<string, string>) =>
  api.get('/interns', { params: { page, size, search, ...filters } });

export const getInternCount = () => api.get('/interns/count');
export const getActiveInternCount = () => api.get('/interns/active/count');
export const getUpcomingEndDatesCount = () => api.get('/interns/upcoming-end-dates/count');
export const createIntern = (data: any) => api.post('/interns', data);
export const updateIntern = (id: number, data: any) => api.put(`/interns/${id}`, data);
export const deleteIntern = (id: number) => api.delete(`/interns/${id}`);
export const sendMessage = (id: number, data: { subject: string; content: string }) =>
  api.post(`/interns/${id}/message`, data);
export const sendBulkMessage = (data: { internIds: number[]; subject: string; content: string }) =>
  api.post('/interns/message/all', data);
export const batchImport = (formData: FormData) =>
  api.post('/interns/batch', formData, { headers: { 'Content-Type': 'multipart/form-data' } });