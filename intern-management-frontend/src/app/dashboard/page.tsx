import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInternCount, getActiveInternCount, getUpcomingEndDatesCount, getInterns, deleteIntern } from '../services/internService';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import FileDropzone from '../components/FileDropzone';
import MessageForm from '../components/MessageForm';

const DashboardPage = () => {
  const token = useRequireAuth();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [messageInternId, setMessageInternId] = useState<number | null>(null);
  const size = 10;

  if (!token) return null;

  const { data: totalInterns } = useQuery({ queryKey: ['totalInterns'], queryFn: getInternCount });
  const { data: activeInterns } = useQuery({ queryKey: ['activeInterns'], queryFn: getActiveInternCount });
  const { data: upcomingEndDates } = useQuery({ queryKey: ['upcomingEndDates'], queryFn: getUpcomingEndDatesCount });
  const { data: internsData, isLoading, refetch } = useQuery({
    queryKey: ['interns', page, size, search, filters],
    queryFn: () => getInterns(page, size, search, filters),
  });

  if (isLoading) return <div className="text-center p-4">Loading...</div>;

  const interns = internsData?.data.content || [];
  const totalPages = internsData?.data.totalPages || 0;

  const handleEdit = (id: number) => router.push(`/interns/${id}`);
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      await deleteIntern(id);
      refetch();
    }
  };
  const handleSendMessage = (id: number) => setMessageInternId(id);
  const handleCreate = () => router.push('/interns/new');

  return (
    <div className="min-h-screen bg-light-gray">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-dark-blue">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow-md">
            <p className="text-lg">Total Interns</p>
            <p className="text-2xl font-bold">{totalInterns?.data.count || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow-md">
            <p className="text-lg">Active Interns</p>
            <p className="text-2xl font-bold">{activeInterns?.data.count || 0}</p>
          </div>
          <div className="bg-white p-4 rounded shadow-md">
            <p className="text-lg">Upcoming End Dates</p>
            <p className="text-2xl font-bold">{upcomingEndDates?.data.count || 0}</p>
          </div>
        </div>
        <div className="mb-6 space-y-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search interns..."
            className="w-full p-2 border rounded"
          />
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="University"
              onChange={(e) => setFilters({ ...filters, university: e.target.value })}
              className="p-2 border rounded flex-1"
            />
            <input
              type="date"
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="p-2 border rounded flex-1"
            />
            <input
              type="text"
              placeholder="Department"
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="p-2 border rounded flex-1"
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleCreate}
              className="bg-dark-blue text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              Create New Intern
            </button>
            <FileDropzone />
          </div>
        </div>
        <DataTable
          interns={interns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSendMessage={handleSendMessage}
        />
        <div className="flex justify-between mt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="bg-dark-blue text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            Previous
          </button>
          <button
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="bg-dark-blue text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>
      {messageInternId && <MessageForm internId={messageInternId} onClose={() => setMessageInternId(null)} />}
    </div>
  );
};

export default DashboardPage;