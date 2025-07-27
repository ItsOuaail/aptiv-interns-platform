"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import Navbar from '../../components/Navbar';
import MessageForm from '../../components/MessageForm';

// Mock services for intern-specific data (replace with actual API calls)
import { getInternDetails, getMessagesFromHR, sendMessageToHR, checkIn, checkOut } from '../../services/internService';

const InternDashboard = () => {
  const token = useRequireAuth();
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const queryClient = useQueryClient();

  // Fetch intern details
  const { data: internDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['internDetails'],
    queryFn: () => getInternDetails(token),
  });

  // Fetch messages from HR
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messagesFromHR'],
    queryFn: () => getMessagesFromHR(token),
  });

  // Mutation for sending message to HR
  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => sendMessageToHR(token, messageData),
    onSuccess: () => {
      setSuccessMessage('Message sent successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
      queryClient.invalidateQueries(['messagesFromHR']);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to send message. Please try again.');
    },
  });

  // Mutations for check-in and check-out
  const checkInMutation = useMutation({
    mutationFn: () => checkIn(token),
    onSuccess: () => {
      setSuccessMessage('Checked in successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to check in. Please try again.');
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => checkOut(token),
    onSuccess: () => {
      setSuccessMessage('Checked out successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to check out. Please try again.');
    },
  });

  if (!token) return null;

  if (detailsLoading || messagesLoading) {
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Intern Dashboard</h1>

        {successMessage && (
          <div className="mb-8 p-4 bg-green-500/20 border border-green-500 rounded-2xl text-center text-green-500 font-medium animate-fade-in">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-2xl text-center text-red-500 font-medium animate-fade-in">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Internship Information</h2>
            <InternshipInfo details={internDetails} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Messages from HR</h2>
            <MessagesList messages={messages} />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Send Message to HR</h2>
          <MessageForm onSubmit={sendMessageMutation.mutate} allowFileUpload />
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Check-in / Check-out</h2>
          <CheckInOut onCheckIn={checkInMutation.mutate} onCheckOut={checkOutMutation.mutate} />
        </div>
      </div>
    </div>
  );
};

// Component for displaying internship information
const InternshipInfo = ({ details }) => (
  <div className="bg-gray-100 p-6 rounded-lg shadow">
    <h3 className="text-xl font-semibold mb-4">{details.name}</h3>
    <p><strong>University:</strong> {details.university}</p>
    <p><strong>Department:</strong> {details.department}</p>
    <p><strong>Start Date:</strong> {details.startDate}</p>
    <p><strong>End Date:</strong> {details.endDate}</p>
    <p><strong>Status:</strong> {details.status}</p>
  </div>
);

// Component for displaying messages from HR
const MessagesList = ({ messages }) => (
  <div className="space-y-4">
    {messages.map((message) => (
      <div key={message.id} className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-semibold">{message.subject}</h4>
        <p className="text-gray-600">{message.date}</p>
        <p>{message.body}</p>
      </div>
    ))}
  </div>
);

// Component for check-in and check-out
const CheckInOut = ({ onCheckIn, onCheckOut }) => (
  <div className="flex space-x-4">
    <button onClick={onCheckIn} className="px-4 py-2 bg-green-500 text-white rounded">
      Check In
    </button>
    <button onClick={onCheckOut} className="px-4 py-2 bg-red-500 text-white rounded">
      Check Out
    </button>
  </div>
);

export default InternDashboard;