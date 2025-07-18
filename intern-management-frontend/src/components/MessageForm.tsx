import { useState } from 'react';
import { sendMessage } from '../services/internService';

interface MessageFormProps {
  internId: number;
  onClose: () => void;
}

const MessageForm = ({ internId, onClose }: MessageFormProps) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage(internId, { subject, content });
      onClose();
    } catch (err) {
      alert('Error sending message');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-dark-blue">Send Message to Intern {internId}</h2>
        <div className="space-y-4">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full p-2 border rounded"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            className="w-full p-2 border rounded h-32"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleSubmit}
              className="bg-dark-blue text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              Send
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageForm;