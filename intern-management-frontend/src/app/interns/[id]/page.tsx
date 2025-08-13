"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { updateIntern } from '../../../services/internService';
import Navbar from '../../../components/Navbar';
import api from '../../../services/api';

const EditInternPage = () => {
  const token = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id;
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    university: '',
    major: '',
    startDate: '',
    endDate: '',
    supervisor: '',
    department: '',
  });
  const [errors, setErrors] = useState([]);

  // Fetch intern data
  const { data, isLoading } = useQuery({
    queryKey: ['intern', id],
    queryFn: () => api.get(`/interns/${id}`),
    enabled: !!id,
  });

  // Update mutation with proper cache invalidation
  const updateMutation = useMutation({
    mutationFn: (formData) => updateIntern(Number(id), formData),
    onSuccess: () => {
      // Invalidate and refetch all intern-related queries
      queryClient.invalidateQueries({ queryKey: ['intern', id] });
      queryClient.invalidateQueries({ queryKey: ['allInterns'] });
      queryClient.invalidateQueries({ queryKey: ['totalInterns'] });
      queryClient.invalidateQueries({ queryKey: ['activeInterns'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingEndDates'] });
      
      // Navigate back to dashboard with success message
      router.push('/dashboard?success=updated');
    },
    onError: (error) => {
      console.error('Error updating intern:', error);
      setErrors([error.response?.data?.message || 'Error updating intern']);
    },
  });

  useEffect(() => {
    if (data) {
      setFormData(data.data);
    }
  }, [data]);

  if (!token || isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-900 text-lg font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = [];
    if (!formData.firstName) newErrors.push('First name is required');
    if (!formData.lastName) newErrors.push('Last name is required');
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.push('Valid email is required');
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.push('End date must be after start date');
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Clear previous errors
    setErrors([]);
    
    // Execute the mutation
    updateMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative bg-gray-100/50 border border-gray-300 rounded-2xl p-8 max-w-lg mx-auto shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-300/10 to-blue-300/10 rounded-2xl"></div>
          <div className="relative">
            {/* Logo Section */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xl font-bold tracking-wider text-gray-900">APTIV</span>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
              Edit Intern <span className="text-orange-500">{id}</span>
            </h1>

            {/* Loading overlay when updating */}
            {updateMutation.isPending && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-900 text-lg font-medium">Updating intern...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                disabled={updateMutation.isPending}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                disabled={updateMutation.isPending}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                disabled={updateMutation.isPending}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                disabled={updateMutation.isPending}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="University"
                disabled={updateMutation.isPending}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder="Major"
                disabled={updateMutation.isPending}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                disabled={updateMutation.isPending}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                disabled={updateMutation.isPending}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                name="supervisor"
                value={formData.supervisor}
                onChange={handleChange}
                placeholder="Supervisor"
                disabled={updateMutation.isPending}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Department"
                disabled={updateMutation.isPending}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              {errors.length > 0 && (
                <ul className="text-red-500 text-sm">
                  {errors.map((err, idx) => (
                    <li key={idx} className="animate-pulse">{err}</li>
                  ))}
                </ul>
              )}
              
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInternPage;