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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } });

  return (
    <div {...getRootProps()} className="border-2 border-dashed p-4 bg-light-gray rounded">
      <input {...getInputProps()} />
      <p className="text-center">
        {isDragActive ? 'Drop the file here...' : 'Drag and drop an .xlsx file here, or click to select'}
      </p>
    </div>
  );
};

export default FileDropzone;