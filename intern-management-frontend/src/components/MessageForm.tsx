import { useState } from 'react';
import { sendMessage, sendBulkMessage } from '../services/internService';

interface MessageFormProps {
  internIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

const MessageForm = ({ internIds, onClose, onSuccess }: MessageFormProps) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      setError('Subject and content are required');
      return;
    }
    setIsSending(true);
    setError(null);
    try {
      if (internIds.length === 1) {
        await sendMessage(internIds[0], { subject, content });
      } else {
        await sendBulkMessage({ internIds, subject, content });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError('Error sending message');
    } finally {
      setIsSending(false);
    }
  };

  const title = internIds.length === 1
    ? `Send Message to Intern #${internIds[0]}`
    : `Send Message to ${internIds.length} Interns`;

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-30 flex justify-center items-center z-50">
      <div className="relative bg-white border border-gray-300 rounded-2xl p-8 w-full max-w-md">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {title}
          </h2>
          {error && (
            <div className="mb-4 p-2 bg-red-500/20 border border-red-500 text-red-500 rounded">
              {error}
            </div>
          )}
          <div className="space-y-6">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              disabled={isSending}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
              disabled={isSending}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 h-32 resize-none shadow-md hover:shadow-lg"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleSubmit}
                disabled={isSending || !subject.trim() || !content.trim()}
                className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
                  isSending || !subject.trim() || !content.trim()
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isSending}
                className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageForm;