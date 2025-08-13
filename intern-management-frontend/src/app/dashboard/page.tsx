'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getInternCount,
  getActiveInternCount,
  getUpcomingEndDatesCount,
  getAllInterns,
  deleteIntern,
  updateIntern,
  batchImport,
  getMessagesFromHR,
  getAllDocuments,
  downloadDocument,
} from '../../services/internService';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import MessageForm from '../../components/MessageForm';
import HeroSection from '../../components/HeroSection';
import SearchFilters from '../../components/SearchFilters';

const DashboardPage = () => {
  const token = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [messageInternIds, setMessageInternIds] = useState<number[] | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedInternIds, setSelectedInternIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<string>('active');
  const size = 10;

  const queryClient = useQueryClient();

  // Notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getMessagesFromHR(),
  });

  const internshipEndingNotifications = useMemo(() => {
    return (
      notificationsData?.data?.content?.filter(
        (notif: any) => notif.messageType === 'INTERNSHIP_ENDING' || notif.messageType === 'INTERN_TO_HR'
      ) || []
    );
  }, [notificationsData]);

  // Sync viewMode with URL query parameter (support docs view)
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'all' || view === 'active' || view === 'upcoming' || view === 'docs') {
      setViewMode(view);
    } else {
      setViewMode('active');
      router.replace('/dashboard?view=active#table', undefined, { shallow: true });
    }
  }, [searchParams, router]);

  // handle success query param
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'created') {
      setSuccessMessage('Intern added successfully!');
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        router.replace('/dashboard', undefined, { shallow: true });
      }, 5000);
      return () => clearTimeout(timer);
    } else if (success === 'updated') {
      setSuccessMessage('Intern updated successfully!');
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        router.replace('/dashboard', undefined, { shallow: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  // Stats & interns queries
  const { data: totalInterns } = useQuery({ queryKey: ['totalInterns'], queryFn: getInternCount });
  const { data: activeInterns } = useQuery({ queryKey: ['activeInterns'], queryFn: getActiveInternCount });
  const { data: upcomingEndDates } = useQuery({ queryKey: ['upcomingEndDates'], queryFn: getUpcomingEndDatesCount });

  const { data: allInternsData, isLoading } = useQuery({
    queryKey: ['allInterns'],
    queryFn: getAllInterns,
  });

  // --- NEW: documents for HR ---
  const [docsPage, setDocsPage] = useState(0);
  const [docsSize, setDocsSize] = useState(20);
  const {
    data: docsData,
    isLoading: docsLoading,
    isError: docsError,
  } = useQuery({
    queryKey: ['allDocuments', docsPage, docsSize],
    queryFn: () => getAllDocuments(docsPage, docsSize),
    enabled: viewMode === 'docs', // only fetch when in docs view
    keepPreviousData: true,
  });

  // terminate intern mutation
  const terminateInternMutation = useMutation({
    mutationFn: async (id: number) => {
      const today = new Date().toISOString().split('T')[0];
      const data = { status: 'TERMINATED', endDate: today };
      await updateIntern(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allInterns']);
      queryClient.invalidateQueries(['activeInterns']);
      queryClient.invalidateQueries(['upcomingEndDates']);
      setSuccessMessage('Intern terminated successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error) => {
      console.error('Error terminating intern:', error);
      alert('Failed to terminate intern. Please try again.');
    },
  });

  // batch import mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return batchImport(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allInterns']);
      queryClient.invalidateQueries(['totalInterns']);
      queryClient.invalidateQueries(['activeInterns']);
      queryClient.invalidateQueries(['upcomingEndDates']);
      setSuccessMessage('Interns added successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
      setErrorMessage(null);
    },
    onError: (error: any) => {
      setErrorMessage(error?.response?.data?.message || 'Failed to upload Excel file. Please try again.');
      console.log('Error uploading file:', error?.response?.data);
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to terminate this intern?')) {
      terminateInternMutation.mutate(id);
    }
  };

  const handleFileDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      uploadMutation.mutate(file);
    }
  };

  // Filter + paginate interns (keeps same logic)
  const { paginatedInterns, totalPages, filteredCount } = useMemo(() => {
    if (!allInternsData?.data) return { paginatedInterns: [], totalPages: 0, filteredCount: 0 };

    let filtered = Array.isArray(allInternsData.data)
      ? allInternsData.data
      : Array.isArray(allInternsData.data.content)
      ? allInternsData.data.content
      : Array.isArray(allInternsData.data.interns)
      ? allInternsData.data.interns
      : [];

    if (!Array.isArray(filtered)) {
      return { paginatedInterns: [], totalPages: 0, filteredCount: 0 };
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(
        (intern) =>
          intern.name?.toLowerCase().includes(searchLower) ||
          intern.university?.toLowerCase().includes(searchLower) ||
          intern.department?.toLowerCase().includes(searchLower) ||
          intern.email?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.university?.trim()) {
      filtered = filtered.filter((intern) =>
        intern.university?.toLowerCase().includes(filters.university.toLowerCase().trim())
      );
    }

    if (filters.department?.trim()) {
      filtered = filtered.filter((intern) =>
        intern.department?.toLowerCase().includes(filters.department.toLowerCase().trim())
      );
    }

    if (filters.startDateFrom) {
      filtered = filtered.filter((intern) => new Date(intern.startDate) >= new Date(filters.startDateFrom));
    }

    if (viewMode === 'active') {
      filtered = filtered.filter((intern) => intern.status === 'ACTIVE');
    } else if (viewMode === 'upcoming') {
      const today = new Date();
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(
        (intern) =>
          intern.status === 'ACTIVE' && new Date(intern.endDate) >= today && new Date(intern.endDate) <= sevenDaysFromNow
      );
    }

    const totalPages = Math.ceil(filtered.length / size);
    const startIndex = page * size;
    const paginatedInterns = filtered.slice(startIndex, startIndex + size);

    return { paginatedInterns, totalPages, filteredCount: filtered.length };
  }, [allInternsData?.data, search, filters, page, size, viewMode]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  if (!token) return null;

  if (isLoading && viewMode !== 'docs') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar notifications={internshipEndingNotifications} />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-900 text-lg font-medium">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  // --- helper: download doc ---
  const handleDownloadDoc = async (id: number, filename?: string) => {
    try {
      const res = await downloadDocument(id);
      const blob = new Blob([res.data], { type: res.data.type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Download failed');
    }
  };

  const handleEdit = (id: number) => router.push(`/interns/${id}`);
  const handleSendMessage = (id: number) => setMessageInternIds([id]);

  const onToggleSelect = (id: number) => {
    setSelectedInternIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const onSelectAll = (select: boolean) => {
    if (select) {
      setSelectedInternIds((prev) => {
        const newSelected = new Set(prev);
        paginatedInterns.forEach((intern) => newSelected.add(intern.id));
        return Array.from(newSelected);
      });
    } else {
      setSelectedInternIds((prev) => prev.filter((id) => !paginatedInterns.some((intern) => intern.id === id)));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar notifications={internshipEndingNotifications} />

      {/* Only show HeroSection if not in docs view */}
      {viewMode !== 'docs' && (
        <HeroSection
          totalInterns={totalInterns}
          activeInterns={activeInterns}
          upcomingEndDates={upcomingEndDates}
          viewMode={viewMode}
          setViewMode={(v: string) => {
            setViewMode(v);
            // update url
            router.replace(`/dashboard?view=${v}#table`, undefined, { shallow: true });
          }}
          successMessage={successMessage}
          errorMessage={errorMessage}
        />
      )}

      {/* Documents view - full page layout */}
      {viewMode === 'docs' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success/Error messages for docs view */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{errorMessage}</p>
            </div>
          )}

          <div className="bg-gray-950 backdrop-blur-sm border border-gray-600 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">Documents</h1>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-300">Page {docsPage + 1}</div>
                <select 
                  value={docsSize} 
                  onChange={(e) => { setDocsSize(Number(e.target.value)); setDocsPage(0); }} 
                  className="bg-gray-800 text-white rounded px-2 py-1"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {docsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white text-lg font-medium">Loading documents...</span>
                </div>
              </div>
            ) : docsError ? (
              <div className="text-center py-12">
                <div className="text-red-400 text-lg">Failed to load documents</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-400 border-b border-gray-700">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Original name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Intern</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Uploaded At</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docsData?.data?.content?.length ? (
                      docsData.data.content.map((doc: any, idx: number) => (
                        <tr key={doc.id} className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                          <td className="py-4 px-4 text-gray-300">{docsPage * docsSize + idx + 1}</td>
                          <td className="py-4 px-4 text-white font-medium">{doc.originalFileName}</td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                              {doc.type}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-300">{doc.internName}</td>
                          <td className="py-4 px-4 text-gray-300">{(doc.fileSize / 1024).toFixed(2)} KB</td>
                          <td className="py-4 px-4 text-gray-300">{new Date(doc.uploadedAt).toLocaleString()}</td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleDownloadDoc(doc.id, doc.originalFileName)}
                              className="px-4 py-2 border border-gray-600 rounded-md text-sm text-white hover:bg-gray-800 transition-colors"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-12 px-4 text-center text-gray-400" colSpan={7}>
                          <div className="flex flex-col items-center">
                            <div className="text-lg mb-2">No documents found</div>
                            <div className="text-sm">Documents will appear here once interns upload them.</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination controls */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
                  <div className="text-sm text-gray-300">
                    Total: {docsData?.data?.totalElements ?? 0} documents
                  </div>
                  <div className="flex gap-2">
                    <button 
                      disabled={docsPage === 0} 
                      onClick={() => setDocsPage((p) => Math.max(0, p - 1))} 
                      className="px-4 py-2 bg-white text-gray-900 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex items-center px-4 py-2 text-white">
                      Page {docsPage + 1} of {docsData?.data?.totalPages ?? 1}
                    </div>
                    <button 
                      disabled={(docsPage + 1) >= (docsData?.data?.totalPages ?? 1)} 
                      onClick={() => setDocsPage((p) => p + 1)} 
                      className="px-4 py-2 bg-white text-gray-900 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Regular dashboard layout
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {selectedInternIds.length > 0 && (
            <div className="mb-4 p-4 bg-gray-950 rounded-2xl border border-gray-700 flex items-center justify-between">
              <span className="text-white">{selectedInternIds.length} interns selected</span>
              <button
                onClick={() => setMessageInternIds(selectedInternIds)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Send Message to Selected
              </button>
            </div>
          )}

          <SearchFilters 
            search={search} 
            onSearchChange={handleSearchChange} 
            onFilterChange={handleFilterChange} 
            onFileDrop={handleFileDrop} 
          />

          <div className="bg-gray-950 backdrop-blur-sm border border-gray-600 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {viewMode === 'all'
                  ? 'All Interns'
                  : viewMode === 'active'
                  ? 'Active Interns'
                  : 'Interns with Upcoming End Dates'}
              </h2>

              <div className="text-sm text-gray-300">
                Showing {paginatedInterns.length} of {filteredCount} filtered interns ({totalInterns?.data || 0} total)
              </div>
            </div>

            <DataTable
              interns={paginatedInterns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSendMessage={handleSendMessage}
              selectedInternIds={selectedInternIds}
              onToggleSelect={onToggleSelect}
              onSelectAll={onSelectAll}
            />

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-300">
              <div className="text-sm text-gray-900">Page {page + 1} of {totalPages}</div>
              <div className="flex space-x-4">
                <button 
                  disabled={page === 0} 
                  onClick={() => setPage(page - 1)} 
                  className="p-2 bg-white hover:bg-gray-900 text-gray-900 rounded-lg disabled:opacity-50"
                >
                  Prev
                </button>
                <button 
                  disabled={page === totalPages - 1} 
                  onClick={() => setPage(page + 1)} 
                  className="p-2 bg-white hover:bg-gray-900 text-gray-900 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {messageInternIds && (
        <MessageForm
          internIds={messageInternIds}
          onClose={() => setMessageInternIds(null)}
          onSuccess={() => {
            setSuccessMessage(messageInternIds.length > 1 ? 'Bulk message sent successfully!' : 'Message sent successfully!');
            setTimeout(() => setSuccessMessage(null), 5000);
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;