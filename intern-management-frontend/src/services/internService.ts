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
  return api.get('/interns/search'); // Fixed: "returnDeux" -> "return"
};

export const getInternCount = () => api.get('/interns/count');
export const getActiveInternCount = () => api.get('/interns/active/count');
export const getUpcomingEndDatesCount = () => api.get('/interns/upcoming-end-dates/count');
export const createIntern = (data: any) => api.post('/interns', data);

export const updateIntern = (id: number, data: any) => {
  console.log(id, data);
  return api.patch(`/interns/${id}`, data); // Fixed: Added return statement
};

export const deleteIntern = (id: number) => api.delete(`/interns/${id}`);

export const sendMessage = (id: number, data: { subject: string; content: string }) => {
  console.log(data);
  return api.post(`/interns/${id}/message`, data); // Fixed: Added return statement
};

export const sendBulkMessage = (data: { internIds: number[]; subject: string; content: string }) => {
  console.log(data.internIds);
  return api.post('/interns/message/batch', data); // Fixed: Added return statement
};

export const batchImport = (formData: FormData) =>
  api.post('/interns/batch', formData, { headers: { 'Content-Type': 'multipart/form-data' } });