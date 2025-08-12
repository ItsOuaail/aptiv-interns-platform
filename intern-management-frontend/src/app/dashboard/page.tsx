"use client";

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { getInternCount, getActiveInternCount, getUpcomingEndDatesCount, getAllInterns, deleteIntern, updateIntern, batchImport, getMessagesFromHR } from '../../services/internService';
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
  const [filters, setFilters] = useState({});
  const [messageInternIds, setMessageInternIds] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedInternIds, setSelectedInternIds] = useState([]);
  const [viewMode, setViewMode] = useState('active');
  const size = 10;

  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getMessagesFromHR(),
  });

  // Filter for INTERNSHIP_ENDING notifications
  const internshipEndingNotifications = useMemo(() => {
  return notificationsData?.data.content?.filter(
    notif => notif.messageType === 'INTERNSHIP_ENDING' || notif.messageType === 'INTERN_TO_HR'
  ) || [];
}, [notificationsData]);

  // Add this to your DashboardPage useEffect for handling success messages
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
  // Sync viewMode with URL query parameter
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'all' || view === 'active' || view === 'upcoming') {
      setViewMode(view);
    } else {
      setViewMode('active');
      router.replace('/dashboard?view=active#table', undefined, { shallow: true });
    }
  }, [searchParams, router]);

  // Handle success message from URL (e.g., after creating an intern)
  useEffect(() => {
    if (searchParams.get('success') === 'created') {
      setSuccessMessage('Intern added successfully!');
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        router.replace('/dashboard', undefined, { shallow: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  // Reset page when viewMode changes
  useEffect(() => {
    setPage(0);
  }, [viewMode]);

  // Fetch intern statistics
  const { data: totalInterns } = useQuery({ queryKey: ['totalInterns'], queryFn: getInternCount });
  const { data: activeInterns } = useQuery({ queryKey: ['activeInterns'], queryFn: getActiveInternCount });
  const { data: upcomingEndDates } = useQuery({ queryKey: ['upcomingEndDates'], queryFn: getUpcomingEndDatesCount });
  
  // Fetch all interns
  const { data: allInternsData, isLoading } = useQuery({
    queryKey: ['allInterns'],
    queryFn: getAllInterns,
  });

  // Mutation for terminating an intern
  const terminateInternMutation = useMutation({
    mutationFn: async (id) => {
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

  // Mutation for batch import
  const uploadMutation = useMutation({
    mutationFn: (file) => {
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
    onError: (error) => {
      setErrorMessage(error.response.data.message || 'Failed to upload Excel file. Please try again.');
      console.log('Error uploading file:', error.response.data);
    },
  });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to terminate this intern?')) {
      terminateInternMutation.mutate(id);
    }
  };

  const handleFileDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      uploadMutation.mutate(file);
    }
  };

  // Filter and paginate intern data
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
      console.error('Expected array but got:', typeof filtered, filtered);
      return { paginatedInterns: [], totalPages: 0, filteredCount: 0 };
    }
    
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(intern => 
        intern.name?.toLowerCase().includes(searchLower) ||
        intern.university?.toLowerCase().includes(searchLower) ||
        intern.department?.toLowerCase().includes(searchLower) ||
        intern.email?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.university?.trim()) {
      filtered = filtered.filter(intern => 
        intern.university?.toLowerCase().includes(filters.university.toLowerCase().trim())
      );
    }
    
    if (filters.department?.trim()) {
      filtered = filtered.filter(intern => 
        intern.department?.toLowerCase().includes(filters.department.toLowerCase().trim())
      );
    }
    
    if (filters.startDateFrom) {
      filtered = filtered.filter(intern => 
        new Date(intern.startDate) >= new Date(filters.startDateFrom)
      );
    }
    
    if (viewMode === 'active') {
      filtered = filtered.filter(intern => intern.status === 'ACTIVE');
    } else if (viewMode === 'upcoming') {
      const today = new Date();
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(intern => 
        intern.status === 'ACTIVE' &&
        new Date(intern.endDate) >= today &&
        new Date(intern.endDate) <= sevenDaysFromNow
      );
    }

    const totalPages = Math.ceil(filtered.length / size);
    const startIndex = page * size;
    const paginatedInterns = filtered.slice(startIndex, startIndex + size);
    
    return { paginatedInterns, totalPages, filteredCount: filtered.length };
  }, [allInternsData?.data, search, filters, page, size, viewMode]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  if (!token) return null;

  if (isLoading) {
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

  const handleEdit = (id) => router.push(`/interns/${id}`);
  const handleSendMessage = (id) => setMessageInternIds([id]);

  const onToggleSelect = (id) => {
    setSelectedInternIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const onSelectAll = (select) => {
    if (select) {
      setSelectedInternIds(prev => {
        const newSelected = new Set(prev);
        paginatedInterns.forEach(intern => newSelected.add(intern.id));
        return Array.from(newSelected);
      });
    } else {
      setSelectedInternIds(prev => prev.filter(id => !paginatedInterns.some(intern => intern.id === id)));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar notifications={internshipEndingNotifications} />
      
      <HeroSection 
        totalInterns={totalInterns}
        activeInterns={activeInterns}
        upcomingEndDates={upcomingEndDates}
        viewMode={viewMode}
        setViewMode={setViewMode}
        successMessage={successMessage}
        errorMessage={errorMessage}
      />

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
              {viewMode === 'all' ? 'All Interns' : viewMode === 'active' ? 'Active Interns' : 'Interns with Upcoming End Dates'}
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
            <div className="text-sm text-gray-100">
              Page {page + 1} of {totalPages}
            </div>
            <div className="flex space-x-4">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="p-2 bg-white hover:bg-gray-900 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="p-2 bg-white hover:bg-gray-900 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

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