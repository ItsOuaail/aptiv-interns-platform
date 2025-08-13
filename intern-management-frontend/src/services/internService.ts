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

// Message-related functions
export const getNotifications = (page = 0, size = 20) => {
  return api.get('/messages/my', { params: { page, size } });
};

// Get a single message by ID
export const getMessage = (messageId: number) => {
  return api.get(`/messages/${messageId}`);
};

// Delete a message by ID
export const deleteMessage = (messageId: number) => {
  return api.delete(`/messages/${messageId}`);
};

// Mark message as read
export const markMessageAsRead = (messageId: number) => {
  return api.patch(`/messages/${messageId}/read`);
};

// Get unread message count
export const getUnreadMessageCount = () => {
  return api.get('/messages/unread/count');
};

// Get HR users (for interns to choose who to send message to)
export const getHRUsers = (page = 0, size = 20) => {
  return api.get('/messages/hr-users', { params: { page, size } });
};

// Get conversation between intern and HR (HR only)
export const getConversation = (internId: number, hrUserId: number, page = 0, size = 20) => {
  return api.get('/messages/conversation', { 
    params: { internId, hrUserId, page, size } 
  });
};

// New functions for Intern Dashboard
export const getInternDetails = () => {
  return api.get('/interns/my'); // Assuming '/interns/current' fetches the current intern's details
};

export const getMessagesFromHR = (page = 0, size = 20) => {
  return api.get('/messages/my', { params: { page, size } });
};

export const sendMessageToHR = (data: { hrUserId: number; subject: string; content: string }) => {
  console.log('Sending message to HR', data);
  return api.post('/messages/to-hr', data);
};

// HR sends message to intern
export const sendMessageToIntern = (data: { internId: number; subject: string; content: string }) => {
  console.log('Sending message to intern', data);
  return api.post('/messages/to-intern', data);
};

export const checkIn = () => {
  return api.post('/attendance/checkin');
};

export const checkOut = () => {
  return api.post('/attendance/checkout');
};

// upload a document (multipart/form-data)
export const uploadDocument = (formData: FormData) =>
  api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// get current intern's documents (pageable)
export const getMyDocuments = (page = 0, size = 20) =>
  api.get('/documents/my', { params: { page, size } });

// download helper (returns a URL you can open)
export const downloadDocument = (id: number) =>
  api.get(`/documents/${id}/download`, { responseType: 'blob' });

export const getAllDocuments = (page = 0, size = 20) =>
  api.get('/documents', { params: { page, size } });
