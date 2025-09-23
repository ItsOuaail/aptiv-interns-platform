'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useAuth } from '../../context/AuthContext'; // Import useAuth for user
import Navbar from '../../components/InternNavbar';
import MessageFormIntern from '../../components/MessageFormIntern';
import InternDocuments from '../../components/InternDocuments';
import { getInternDetails, getMessagesFromHR, sendMessageToHR } from '../../services/internService';
import axios from 'axios';

const InternDashboard: React.FC = () => {
  const { token } = useRequireAuth();
  const { user, login } = useAuth(); // Get user and login (to update user)
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user?.shouldChangePassword) {
      setShowModal(true);
    }
  }, [user]);

  const {
    data: internDetails,
    isLoading: detailsLoading,
    isError: detailsError,
    error: detailsErrorMessage,
  } = useQuery({
    queryKey: ['internDetails'],
    queryFn: () => getInternDetails(),
    staleTime: 1000 * 60 * 2, // 2 mins
  });

  const {
    data: messagesResponse,
    isLoading: messagesLoading,
    isError: messagesError,
    error: messagesErrorMessage,
  } = useQuery({
    queryKey: ['messagesFromHR'],
    queryFn: () => getMessagesFromHR(),
    staleTime: 1000 * 30,
  });

  // Filter messages to only show HR_TO_INTERN messages and sort by date (newest first)
  const messages = useMemo(() => {
    if (!messagesResponse?.data?.content) return [];

    return messagesResponse.data.content
      .filter((message: any) => message.messageType === 'HR_TO_INTERN')
      .sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [messagesResponse]);

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: { hrUserId?: number; subject: string; content: string }) =>
      sendMessageToHR(messageData as any),
    onSuccess: () => {
      setSuccessMessage('Message sent successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
      queryClient.invalidateQueries(['messagesFromHR']);
    },
    onError: (error: any) => {
      setErrorMessage(error?.message || 'Failed to send message. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setModalError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('New passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/change-password',
        { currentPassword, newPassword, confirmPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setModalSuccess(response.data.message);
        // Update user in context and localStorage
        const updatedUser = { ...user, shouldChangePassword: false };
        login(token!, updatedUser); // Reuse login to update
        setTimeout(() => {
          setShowModal(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }, 2000);
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) return null;

  if (detailsLoading || messagesLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar setActiveSection={setActiveSection} />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-medium">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (detailsError) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar setActiveSection={setActiveSection} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-500/20 border border-red-500 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-300">{(detailsErrorMessage as any)?.message || 'Unknown error occurred'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (messagesError) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar setActiveSection={setActiveSection} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-500/20 border border-red-500 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Messages</h3>
            <p className="text-red-300">{(messagesErrorMessage as any)?.message || 'Unknown error occurred'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar setActiveSection={setActiveSection} />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-300/10 to-blue-300/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Intern
              <span className="text-orange-500 ml-2">Dashboard</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Welcome to your personalized internship portal - track your progress and stay connected
            </p>
          </div>

          {successMessage && (
            <div className="mb-8 p-4 bg-green-500/20 border border-green-500 rounded-2xl text-center text-green-400 font-medium animate-fade-in">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-2xl text-center text-red-400 font-medium animate-fade-in">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div
              className={`bg-gray-950/80 backdrop-blur-sm border ${activeSection === null ? 'border-orange-500' : 'border-gray-700'} rounded-2xl p-8 hover:bg-gray-800/80 transition-all duration-300 cursor-pointer transform hover:scale-105`}
              onClick={() => setActiveSection(null)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm uppercase tracking-wide font-medium">My Profile</p>
                  <p className="text-lg font-semibold text-white mt-2">Internship Details</p>
                </div>
                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className={`bg-gray-950/80 backdrop-blur-sm border ${activeSection === 'documents' ? 'border-purple-500' : 'border-gray-700'} rounded-2xl p-8 hover:bg-gray-800/80 transition-all duration-300 cursor-pointer transform hover:scale-105`}
              onClick={() => setActiveSection('documents')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm uppercase tracking-wide font-medium">Documents</p>
                  <p className="text-lg font-semibold text-white mt-2">My uploads</p>
                </div>
                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 11h10M7 15h6M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6" />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className={`bg-gray-950/80 backdrop-blur-sm border ${activeSection === 'messages' ? 'border-blue-500' : 'border-gray-700'} rounded-2xl p-8 hover:bg-gray-800/80 transition-all duration-300 cursor-pointer transform hover:scale-105`}
              onClick={() => setActiveSection('messages')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm uppercase tracking-wide font-medium">Inbox</p>
                  <p className="text-lg font-semibold text-white mt-2">Messages from HR</p>
                  {messages.length > 0 && (
                    <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded-full mt-1">
                      {messages.length} message{messages.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className={`bg-gray-950/80 backdrop-blur-sm border ${activeSection === 'sendMessage' ? 'border-green-500' : 'border-gray-700'} rounded-2xl p-8 hover:bg-gray-800/80 transition-all duration-300 cursor-pointer transform hover:scale-105`}
              onClick={() => setActiveSection('sendMessage')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm uppercase tracking-wide font-medium">Communication</p>
                  <p className="text-lg font-semibold text-white mt-2">Send Message</p>
                </div>
                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeSection === null && (
          <div className="bg-gray-950/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Internship Information</h2>
            </div>
            <InternshipInfo details={internDetails} />
          </div>
        )}

        {activeSection === 'documents' && (
          <div className="bg-gray-950/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">My Documents</h2>
            <InternDocuments />
          </div>
        )}

        {activeSection === 'messages' && (
          <div className="bg-gray-950/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Messages from HR</h2>
              </div>
              <div className="text-sm text-gray-300">
                {messages.length} HR message{messages.length !== 1 ? 's' : ''}
              </div>
            </div>
            <MessagesList messages={messages} />
          </div>
        )}

        {activeSection === 'sendMessage' && (
          <div className="bg-gray-950/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Send Message to HR</h2>
            </div>
            <MessageFormIntern onSubmit={(data: any) => sendMessageMutation.mutate(data)} allowFileUpload />
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Change Your Password</h2>
            <p className="text-gray-300 mb-6">For security, please change your password.</p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {modalError && <p className="text-red-500 text-sm">{modalError}</p>}
              {modalSuccess && <p className="text-green-500 text-sm">{modalSuccess}</p>}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600"
                  disabled={isSubmitting}
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Helper subcomponents (kept inline for single-file) ---------- */

const InternshipInfo: React.FC<{ details: any }> = ({ details }) => {
  const d = details?.data ?? {};
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10 rounded-2xl"></div>
      <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-600 rounded-2xl p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {d.firstName?.[0] ?? ''}{d.lastName?.[0] ?? ''}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              {d.firstName} {d.lastName}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                d.status === 'ACTIVE'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                {d.status}
              </span>
            </div>
          </div>
        </div>

        {/* Contact + details */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Contact Information</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600">
              <p className="text-sm font-medium text-gray-300 uppercase tracking-wide mb-2">Email</p>
              <p className="text-white font-semibold break-all">{d.email}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600">
              <p className="text-sm font-medium text-gray-300 uppercase tracking-wide mb-2">Phone</p>
              <p className="text-white font-semibold">{d.phone}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InfoCard title="University" value={d.university} />
            <InfoCard title="Department" value={d.department} />
            <InfoCard title="Major" value={d.major} />
          </div>

          <div className="space-y-4">
            <InfoCard title="Start Date" value={d.startDate ? new Date(d.startDate).toLocaleDateString() : ''} />
            <InfoCard title="End Date" value={d.endDate ? new Date(d.endDate).toLocaleDateString() : ''} />
            <InfoCard title="Supervisor" value={d.supervisor} />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ title: string; value?: any }> = ({ title, value }) => (
  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600">
    <div className="flex items-center space-x-3 mb-2">
      <span className="text-sm font-medium text-gray-300 uppercase tracking-wide">{title}</span>
    </div>
    <p className="text-white font-semibold">{value ?? '-'}</p>
  </div>
);

const MessagesList: React.FC<{ messages: any[] }> = ({ messages }) => (
  <div className="space-y-4">
    {messages.length > 0 ? (
      messages.map((message) => (
        <div key={message.id} className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
          <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-600 rounded-2xl p-6 hover:bg-gray-800/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{message.subject}</h4>
                  <p className="text-sm text-gray-400">{new Date(message.sentAt).toLocaleString()}</p>
                </div>
              </div>
              <span className="inline-block bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30">
                HR Message
              </span>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-600/50">
              <p className="text-gray-200 leading-relaxed">{message.content}</p>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No HR Messages Yet</h3>
        <p className="text-gray-400">You'll see messages from HR here when they're available.</p>
      </div>
    )}
  </div>
);

export default InternDashboard;