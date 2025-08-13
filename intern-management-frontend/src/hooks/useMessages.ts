import { useState, useEffect } from 'react';
import { 
  getMessage, 
  deleteMessage, 
  markMessageAsRead, 
  getMessagesFromHR,
  getUnreadMessageCount 
} from '../services/internService';

interface Message {
  id: number;
  subject: string;
  content: string;
  isRead: boolean;
  sentAt: string;
  messageType: string;
  internId: number;
  internName: string;
  senderId: number;
  senderName: string;
  recipientId?: number;
  recipientName?: string;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch all messages
  const fetchMessages = async (page = 0, size = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMessagesFromHR(page, size);
      setMessages(response.data.content || []);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get single message
  const fetchMessage = async (messageId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMessage(messageId);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteMessage(messageId);
      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      // Update unread count
      await fetchUnreadCount();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mark message as read
  const handleMarkAsRead = async (messageId: number) => {
    setError(null);
    try {
      await markMessageAsRead(messageId);
      // Update message in local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
      // Update unread count
      await fetchUnreadCount();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to mark message as read');
      throw err;
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadMessageCount();
      setUnreadCount(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Failed to fetch unread count:', err);
      return 0;
    }
  };

  // Initialize unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return {
    messages,
    loading,
    error,
    unreadCount,
    fetchMessages,
    fetchMessage,
    handleDeleteMessage,
    handleMarkAsRead,
    fetchUnreadCount,
    setError
  };
};

export default useMessages;