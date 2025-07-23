import { useDropzone } from 'react-dropzone';

const FileDropzone = ({ onDrop }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-orange-500 bg-orange-500/10' : 'border-gray-500 hover:border-orange-400'
      }`}
    >
      <input {...getInputProps()} />
      <p className="text-gray-100">
        {isDragActive
          ? 'Drop the Excel file here...'
          : 'Drag & drop an Excel file here, or click to select one'}
      </p>
    </div>
  );
};

export default FileDropzone;