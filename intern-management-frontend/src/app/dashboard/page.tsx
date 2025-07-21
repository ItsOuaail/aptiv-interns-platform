"use client";
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInternCount, getActiveInternCount, getUpcomingEndDatesCount, getAllInterns, deleteIntern } from '../../services/internService';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import FileDropzone from '../../components/FileDropzone';
import MessageForm from '../../components/MessageForm';

const DashboardPage = () => {
  const token = useRequireAuth();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [messageInternId, setMessageInternId] = useState<number | null>(null);
  
  const size = 10;

  // Fetch all data once - no dependency on search/filters
  const { data: totalInterns } = useQuery({ queryKey: ['totalInterns'], queryFn: getInternCount });
  const { data: activeInterns } = useQuery({ queryKey: ['activeInterns'], queryFn: getActiveInternCount });
  const { data: upcomingEndDates } = useQuery({ queryKey: ['upcomingEndDates'], queryFn: getUpcomingEndDatesCount });
  
  // Fetch ALL interns once (you'll need to create this service function)
  const { data: allInternsData, isLoading, refetch } = useQuery({
    queryKey: ['allInterns'], // No dependency on search/filters
    queryFn: getAllInterns, // Fetch all interns at once
  });

  // Client-side filtering and pagination using useMemo to prevent unnecessary recalculations
  const { paginatedInterns, totalPages, filteredCount } = useMemo(() => {
    if (!allInternsData?.data) return { paginatedInterns: [], totalPages: 0, filteredCount: 0 };
    
    // Handle different possible data structures
    let filtered = Array.isArray(allInternsData.data) 
      ? allInternsData.data 
      : Array.isArray(allInternsData.data.content) 
      ? allInternsData.data.content 
      : Array.isArray(allInternsData.data.interns)
      ? allInternsData.data.interns
      : [];

    // Safety check to ensure filtered is an array
    if (!Array.isArray(filtered)) {
      console.error('Expected array but got:', typeof filtered, filtered);
      return { paginatedInterns: [], totalPages: 0, filteredCount: 0 };
    }
    
    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(intern => 
        intern.name?.toLowerCase().includes(searchLower) ||
        intern.university?.toLowerCase().includes(searchLower) ||
        intern.department?.toLowerCase().includes(searchLower) ||
        intern.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply other filters
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
    
    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / size);
    const startIndex = page * size;
    const paginatedInterns = filtered.slice(startIndex, startIndex + size);
    
    return { 
      paginatedInterns, 
      totalPages, 
      filteredCount: filtered.length 
    };
  }, [allInternsData?.data, search, filters, page, size]);

  // Reset page when search or filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0); // Reset to first page
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page
  };

  if (!token) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-900 text-lg font-medium">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = (id: number) => router.push(`/interns/${id}`);
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this intern?')) {
      await deleteIntern(id);
      refetch(); // This will refetch all interns
    }
  };
  const handleSendMessage = (id: number) => setMessageInternId(id);
  const handleCreate = () => router.push('/interns/new');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-300/10 to-blue-300/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Intern Management
              <span className="text-orange-500 ml-2">Dashboard</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Streamline your internship program with advanced analytics and seamless management tools
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-950 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:bg-gray-800 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm uppercase tracking-wide font-medium">Total Interns</p>
                  <p className="text-4xl font-bold text-white mt-2">{totalInterns?.data || 0}</p>
                </div>
                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-950 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:bg-gray-800 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm uppercase tracking-wide font-medium">Active Interns</p>
                  <p className="text-4xl font-bold text-white mt-2">{activeInterns?.data || 0}</p>
                </div>
                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-950 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:bg-gray-800 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm uppercase tracking-wide font-medium">Upcoming End Dates</p>
                  <p className="text-4xl font-bold text-white mt-2">{upcomingEndDates?.data || 0}</p>
                </div>
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Search and Filters */}
        <div className="relative bg-gray-950 shadow-xl border border-orange-500/50 rounded-2xl p-8 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10 rounded-2xl"></div>
          <div className="relative">
            <h2 className="text-2xl font-semibold text-white mb-6">Search & Filters</h2>
            
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search interns by name, university, or department..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-orange-500/70 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
                />
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-100 mb-2">University</label>
                  <input
                    type="text"
                    placeholder="Filter by university"
                    onChange={(e) => handleFilterChange('university', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-orange-500/70 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-100 mb-2">Start Date</label>
                  <input
                    type="date"
                    onChange={(e) => handleFilterChange('startDateFrom', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-orange-500/70 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-100 mb-2">Department</label>
                  <input
                    type="text"
                    placeholder="Filter by department"
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-orange-500/70 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCreate}
                  className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <div className="flex-1">
                  <FileDropzone />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-gray-950 backdrop-blur-sm border border-gray-600 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Interns Directory</h2>
            <div className="text-sm text-gray-300">
              Showing {paginatedInterns.length} of {filteredCount} filtered interns ({totalInterns?.data || 0} total)
            </div>
          </div>
          
          <DataTable
            interns={paginatedInterns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSendMessage={handleSendMessage}
          />

          {/* Pagination */}
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

      {/* Message Modal */}
      {messageInternId && (
        <MessageForm 
          internId={messageInternId} 
          onClose={() => setMessageInternId(null)} 
        />
      )}
    </div>
  );
};

export default DashboardPage;