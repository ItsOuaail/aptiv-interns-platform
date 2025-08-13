'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyDocuments, uploadDocument, downloadDocument } from '../services/internService';

type Doc = {
  id: number;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  type: string;
  uploadedAt: string;
};

const TYPES = ['REPORT', 'CERTIFICATE', 'CV', 'OTHER'];

export default function InternDocuments() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<string>(TYPES[0]);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['myDocuments'],
    queryFn: () => getMyDocuments(0, 50), // adjust page/size if you want server pagination
    keepPreviousData: true,
  });

  const uploadMutation = useMutation({
    mutationFn: (fd: FormData) => uploadDocument(fd),
    onSuccess: () => {
      setFile(null);
      setType(TYPES[0]);
      setError(null);
      queryClient.invalidateQueries(['myDocuments']);
    },
    onError: (err: any) => {
      setError(err?.message || 'Upload failed');
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    uploadMutation.mutate(fd);
  };

  const handleDownload = async (docId: number, originalName: string) => {
    try {
      const res = await downloadDocument(docId);
      const blob = new Blob([res.data], { type: res.data.type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Download failed');
    }
  };

  function formatBytes(bytes = 0) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="bg-gray-950/80 p-6 rounded-2xl border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">My Documents</h3>

      <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-3 items-start mb-6">
        <input
          type="file"
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="file-input file-input-bordered bg-gray-800 text-gray-200"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-gray-800 text-gray-200 rounded-md px-3 py-2 border border-gray-600"
        >
          {TYPES.map((t) => (
            <option value={t} key={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          disabled={uploadMutation.isLoading}
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:opacity-95 disabled:opacity-50"
        >
          {uploadMutation.isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {error && <div className="text-red-400 mb-4">{error}</div>}
      {uploadMutation.isError && <div className="text-red-400">Upload failed.</div>}

      <div>
        {isLoading ? (
          <div className="text-gray-300">Loading documents...</div>
        ) : (
          <div className="space-y-3">
            {data?.data?.content?.length ? (
              data.data.content.map((doc: Doc) => (
                <div key={doc.id} className="flex items-center justify-between bg-gray-900/40 p-3 rounded-md border border-gray-700">
                  <div>
                    <div className="text-white font-medium">{doc.originalFileName}</div>
                    <div className="text-gray-400 text-sm">
                      {doc.type} • {formatBytes(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDownload(doc.id, doc.originalFileName)}
                      className="px-3 py-1 border border-gray-600 rounded-md text-sm text-white bg-transparent hover:bg-gray-800"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400">No documents uploaded yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
