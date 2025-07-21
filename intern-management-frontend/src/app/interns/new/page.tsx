"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { createIntern } from '../../../services/internService';
import Navbar from '../../../components/Navbar';

const NewInternPage = () => {
  const token = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
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

  if (!token) {
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
    try {
      await createIntern(formData);
      console.log('Intern created, redirecting...');
      queryClient.invalidateQueries({ queryKey: ['allInterns'] });
      queryClient.invalidateQueries({ queryKey: ['totalInterns'] });
      queryClient.invalidateQueries({ queryKey: ['activeInterns'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingEndDates'] });
      router.push('/dashboard?success=created');
    } catch (err) {
      console.error('Error creating intern:', err);
      setErrors([err.response?.data?.message || 'Error creating intern']);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative bg-gray-100/50 border border-gray-300 rounded-2xl p-8 max-w-lg mx-auto shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-300/10 to-blue-300/10 rounded-2xl"></div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xl font-bold tracking-wider text-gray-900">APTIV</span>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Create New Intern</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
              />
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
              />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
              />
              <input
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="University"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
              />
              <input
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder="Major"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
              />
              <input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
              />
              <input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
              />
              <input
                name="supervisor"
                value={formData.supervisor}
                onChange={handleChange}
                placeholder="Supervisor"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
              />
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Department"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
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
                className="w-full p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewInternPage;
