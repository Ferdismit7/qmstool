'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiX, FiFile, FiDownload } from 'react-icons/fi';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onFileRemove: () => void;
  currentFile?: {
    name: string;
    size: number;
    url?: string;
  };
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onFileRemove,
  currentFile,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png',
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  label = 'Upload File'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    setError('');

    // Check file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return false;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const fileType = file.type;

    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      return fileType.startsWith(type.replace('*', ''));
    });

    if (!isAccepted) {
      setError(`File type not supported. Accepted types: ${accept}`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {currentFile ? (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiFile className="text-blue-500 text-xl" />
              <div>
                <p className="text-sm font-medium text-gray-900">{currentFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(currentFile.size)}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {currentFile.url && (
                <a
                  href={currentFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Download file"
                >
                  <FiDownload size={16} />
                </a>
              )}
              <button
                type="button"
                onClick={onFileRemove}
                disabled={disabled}
                className="p-2 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                title="Remove file"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <FiUpload className="mx-auto text-gray-400 text-3xl mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            Accepted formats: {accept.replace(/\./g, '').toUpperCase()}
          </p>
          <p className="text-xs text-gray-500">
            Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB
          </p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default FileUpload; 