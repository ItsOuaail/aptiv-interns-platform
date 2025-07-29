"use client";

import { useState } from 'react';

const MessageFormIntern = ({ onSubmit, allowFileUpload }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('content', content);
    if (file) {
      formData.append('file', file);
    }

    try {
      await onSubmit(formData);
      setSubject('');
      setContent('');
      setFile(null);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Send a Message to HR</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          rows="4"
          required
        ></textarea>
      </div>

      {allowFileUpload && (
        <div className="mb-4">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            Attach Document (optional)
          </label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
          />
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          Send Message
        </button>
      </div>
    </form>
  );
};

export default MessageFormIntern;