import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { batchImport } from '../services/internService';

const FileDropzone = () => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await batchImport(formData);
      alert('Batch import successful');
      console.log(response.data); // Show per-row feedback
    } catch (err) {
      alert('Batch import failed');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
  });

  return (
    <div
      {...getRootProps()}
      className={`flex items-center justify-center space-x-3 px-4 py-3 bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-xl text-gray-300 hover:bg-gray-600/50 hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 cursor-pointer ${
        isDragActive ? 'bg-gray-600/70 border-orange-500' : ''
      }`}
    >
      <input {...getInputProps()} />
      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <span className="text-sm font-medium">
        {isDragActive ? 'Drop the .xlsx file here...' : 'Drag and drop an .xlsx file here, or click to select'}
      </span>
    </div>
  );
};

export default FileDropzone;