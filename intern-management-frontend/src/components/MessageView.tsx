"use client";

import React, { useState, useEffect } from 'react';
import { useMessages } from '../hooks/useMessages';
import MessageDetailModal from '../common/MessageDetailModal';

const MessageView = ({ onBack }) => {
  const { 
    messages, 
    loading, 
    error, 
    fetchMessages,
    fetchMessage,
    handleDeleteMessage,
    handleMarkAsRead
  } = useMessages();
  
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages(0, 100); // Fetch first 100 messages
  }, [fetchMessages]);

  const handleMessageClick = async (messageId: number) => {
    setSelectedMessageId(messageId);
    setShowMessageModal(true);
    
    // Mark as read when opened
    await handleMarkAsRead(messageId);
  };

  const handleMessageDeleted = (messageId: number) => {
    // Refetch messages after deletion
    fetchMessages(0, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-900 text-lg font-medium">Loading messages...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8">
          Error loading messages: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-orange-500 hover:text-orange-700 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

      {messages.length === 0 ? (
        <div className="bg-gray-50 text-gray-700 p-4 rounded-lg mb-8">
          No messages found.
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl shadow overflow-hidden border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {messages.map((message) => (
              <li 
                key={message.id} 
                className={`p-6 hover:bg-gray-100 cursor-pointer transition-colors ${!message.isRead ? 'bg-blue-50' : ''}`}
                onClick={() => handleMessageClick(message.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{message.subject}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      From: {message.senderName}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(message.sentAt).toLocaleString()}
                    </p>
                  </div>
                  {!message.isRead && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
                      New
                    </span>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-700 line-clamp-2">
                  {message.content}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <MessageDetailModal
        messageId={selectedMessageId}
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onDelete={handleMessageDeleted}
      />
    </div>
  );
};

export default MessageView;