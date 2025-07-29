import api from './api'; // Assuming you have an api instance set up

export const getInterns = (page: number, size: number, search?: string, filters?: Record<string, string>) => {
  const params = {
    page,
    size,
    keyword: search,
    university: filters?.university,
    department: filters?.department,
    startDateFrom: filters?.startDate,
  };
  return api.get('/interns/search', { params });
};

export const getAllInterns = () => {
  return api.get('/interns/search');
};

export const getInternCount = () => api.get('/interns/count');
export const getActiveInternCount = () => api.get('/interns/active/count');
export const getUpcomingEndDatesCount = () => api.get('/interns/upcoming-end-dates/count');
export const createIntern = (data: any) => api.post('/interns', data);

export const updateIntern = (id: number, data: any) => {
  console.log(id, data);
  return api.patch(`/interns/${id}`, data);
};

export const deleteIntern = (id: number) => api.delete(`/interns/${id}`);

export const sendMessage = (id: number, data: { subject: string; content: string }) => {
  console.log(data);
  return api.post(`/interns/${id}/message`, data);
};

export const sendBulkMessage = (data: { internIds: number[]; subject: string; content: string }) => {
  console.log(data.internIds);
  return api.post('/interns/message/batch', data);
};

export const batchImport = (formData: FormData) =>
  api.post('/interns/batch', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// New function to fetch notifications
export const getNotifications = (page = 0, size = 20) => {
  return api.get('/notifications', { params: { page, size } });
};

// New functions for Intern Dashboard
export const getInternDetails = () => {
  return api.get('/interns/my'); // Assuming '/interns/current' fetches the current intern's details
};

export const getMessagesFromHR = (page = 0, size = 20) => {
  console.log('Fetching messages from HR', api.get('/messages/my', { params: { page, size } }));
  return api.get('/messages/my', { params: { page, size } });
};

export const sendMessageToHR = (data: { hrUserId: number; subject: string; content: string }) => {
  console.log('Sending message to HR', data);
  return api.post('/messages/to-hr', data);
};

export const checkIn = () => {
  return api.post('/attendance/checkin');
};

export const checkOut = () => {
  return api.post('/attendance/checkout');
};