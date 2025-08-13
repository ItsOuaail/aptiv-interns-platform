"use client";

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getMessagesFromHR, markMessageAsRead, deleteMessage, getUnreadMessageCount } from '../../services/internService';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import Navbar from '../../components/Navbar';
import MessageDetailModal from '../../common/MessageDetailModal';

const MessagesPage = () => {
  const token = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, unread, sent, received
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const size = 20;

  // Fetch messages
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['messages', page],
    queryFn: () => getMessagesFromHR(page, size),
    enabled: !!token,
  });

  // Fetch unread count
  const { data: unreadCount } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: getUnreadMessageCount,
    enabled: !!token,
  });

  // Fetch notifications for navbar
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getMessagesFromHR(0, 10),
    enabled: !!token,
  });

  // Filter for navbar notifications
  const internshipEndingNotifications = useMemo(() => {
    return notificationsData?.data.content?.filter(
      notif => !notif.isRead && (notif.messageType === 'HR_TO_INTERN' || notif.messageType === 'INTERN_TO_HR')
    ) || [];
  }, [notificationsData]);

  // Filter messages based on search and type
  const filteredMessages = useMemo(() => {
    if (!messagesData?.data?.content) return [];
    
    let filtered = messagesData.data.content;

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(message => 
        message.subject?.toLowerCase().includes(searchLower) ||
        message.content?.toLowerCase().includes(searchLower) ||
        message.senderName?.toLowerCase().includes(searchLower) ||
        message.recipientName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'unread':
        filtered = filtered.filter(message => !message.isRead);
        break;
      case 'sent':
        filtered = filtered.filter(message => message.messageType === 'HR_TO_INTERN');
        break;
      case 'received':
        filtered = filtered.filter(message => message.messageType === 'INTERN_TO_HR');
        break;
      default:
        break;
    }

    return filtered;
  }, [messagesData?.data?.content, search, filterType]);

  const handleMessageClick = (messageId: number) => {
    setSelectedMessageId(messageId);
    setShowMessageModal(true);
  };

  const handleMessageDeleted = async (messageId: number) => {
    setSuccessMessage('Message deleted successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
    
    // Refresh queries
    await queryClient.invalidateQueries(['messages']);
    await queryClient.invalidateQueries(['unreadCount']);
    await queryClient.invalidateQueries(['notifications']);
  };

  const handleMarkAsRead = async (messageId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await markMessageAsRead(messageId);
      await queryClient.invalidateQueries(['messages']);
      await queryClient.invalidateQueries(['unreadCount']);
      await queryClient.invalidateQueries(['notifications']);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const getMessageTypeLabel = (messageType: string) => {
    switch (messageType) {
      case 'HR_TO_INTERN':
        return 'Sent';
      case 'INTERN_TO_HR':
        return 'Received';
      default:
        return messageType;
    }
  };

  const getMessageTypeColor = (messageType: string) => {
    switch (messageType) {
      case 'HR_TO_INTERN':
        return 'bg-blue-100 text-blue-800';
      case 'INTERN_TO_HR':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!token) return null;

  return (
    <>
      <div className="min-h-screen bg-white">
        <Navbar notifications={internshipEndingNotifications} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600 mt-2">
                  Manage your conversations with interns
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-600">
                    Unread: <span className="font-semibold text-orange-600">{unreadCount?.data || 0}</span>
                  </span>
                </div>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search messages..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'sent', label: 'Sent' },
                  { key: 'received', label: 'Received' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterType(filter.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterType === filter.key
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-gray-600">Loading messages...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || filterType !== 'all' ? 'Try adjusting your filters or search term.' : 'You have no messages yet.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message.id)}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !message.isRead ? 'bg-orange-50 border-l-4 border-orange-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        {/* Unread Indicator */}
                        {!message.isRead && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                        )}
                        
                        {/* Message Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {message.subject}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMessageTypeColor(message.messageType)}`}>
                              {getMessageTypeLabel(message.messageType)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              {message.messageType === 'HR_TO_INTERN' ? 'To:' : 'From:'} {message.messageType === 'HR_TO_INTERN' ? message.internName : message.senderName}
                            </span>
                            <span>•</span>
                            <span>{new Date(message.sentAt).toLocaleDateString()}</span>
                            <span>{new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {message.content}
                          </p>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!message.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(message.id, e)}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {messagesData?.data?.totalPages && messagesData.data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Page {page + 1} of {messagesData.data.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={page >= (messagesData.data.totalPages - 1)}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      <MessageDetailModal
        messageId={selectedMessageId}
        isOpen={showMessageModal}
        onClose={() => {
          setShowMessageModal(false);
          setSelectedMessageId(null);
        }}
        onDelete={handleMessageDeleted}
      />
    </>
  );
};

export default MessagesPage;