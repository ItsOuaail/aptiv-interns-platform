import React, { useState, useEffect } from 'react';
import { getMessage, deleteMessage, markMessageAsRead } from '../services/internService';

interface MessageDetailModalProps {
  messageId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (messageId: number) => void;
}

const MessageDetailModal: React.FC<MessageDetailModalProps> = ({
  messageId,
  isOpen,
  onClose,
  onDelete
}) => {
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && messageId) {
      loadMessage();
    }
  }, [isOpen, messageId]);

  const loadMessage = async () => {
    if (!messageId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const messageData = await getMessage(messageId);
      setMessage(messageData.data);
      
      // Mark as read if it's unread
      if (!messageData.data.isRead) {
        await markMessageAsRead(messageId);
        setMessage(prev => ({ ...prev, isRead: true }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load message');
      console.error('Failed to load message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!messageId) return;
    
    setDeleting(true);
    try {
      await deleteMessage(messageId);
      setShowDeleteConfirm(false);
      onDelete?.(messageId);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete message');
      console.error('Failed to delete message:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getMessageTypeLabel = (messageType: string) => {
    switch (messageType) {
      case 'HR_TO_INTERN':
        return 'Sent to Intern';
      case 'INTERN_TO_HR':
        return 'Received from Intern';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Message Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-gray-600">Loading message...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-semibold">Error loading message</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
              <button
                onClick={loadMessage}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : message ? (
            <div className="space-y-6">
              {/* Message Header Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <p className="text-gray-900 font-semibold">{message.subject}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getMessageTypeColor(message.messageType)}`}>
                      {getMessageTypeLabel(message.messageType)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <p className="text-gray-900">{message.senderName}</p>
                  </div>

                  {message.recipientName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                      <p className="text-gray-900">{message.recipientName}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                    <p className="text-gray-900">
                      {new Date(message.sentAt).toLocaleDateString()} at {' '}
                      {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      message.isRead 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {message.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Message Content</label>
                <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[200px]">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info if it's an intern message */}
              {message.messageType === 'INTERN_TO_HR' && message.internName && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Intern Information</h4>
                  <p className="text-sm text-blue-700">
                    This message was sent by <strong>{message.internName}</strong>
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading || deleting}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Delete Message
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Message?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this message? This action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDetailModal;