'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiX, FiFileText, FiDownload, FiEye } from 'react-icons/fi';
import { extractFileIdFromUrl } from '@/lib/utils/fileUtils';
import { FileUploadFieldProps, FileUploadData, FILE_UPLOAD_CONSTANTS } from '@/app/types/fileUpload';

export default function FileUploadField({
  label = "Upload File",
  value,
  onChange,
  onRemove,
  accept = FILE_UPLOAD_CONSTANTS.ACCEPTED_EXTENSIONS,
  maxSize = FILE_UPLOAD_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024, // Convert to MB
  className = "",
  disabled = false,
  required = false,
  showPreview = true,
  businessArea = "default",
  documentType = "business-documents"
}: FileUploadFieldProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const fileType = file.type;
      
      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return fileExtension === acceptedType;
        } else {
          return fileType.startsWith(acceptedType.split('/')[0]);
        }
      });

      if (!isAccepted) {
        return `File type not supported. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Upload file to S3 first
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('businessArea', businessArea);
      formData.append('documentType', documentType);

      // Authentication is handled automatically via cookies
      // No need to manually send Authorization headers
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Try to get the actual error message from the response
        let errorMessage = 'Failed to upload file';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          // If we can't parse the error response, use the status text
          errorMessage = `Upload failed (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (result.success) {
        // Create file data object with actual S3 URL
        const fileData: FileUploadData = {
          file_url: result.data.url,
          file_name: result.data.fileName,
          file_size: result.data.fileSize,
          file_type: result.data.fileType,
        };

        onChange?.(fileData);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('File upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = () => {
    setError(null);
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (value?.file_url) {
      // Extract file ID from URL
      const fileId = extractFileIdFromUrl(value.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/download`, '_blank');
      } else {
        // Fallback to direct URL
        window.open(value.file_url, '_blank');
      }
    }
  };

  const handleView = () => {
    if (value?.file_url) {
      // Extract file ID from URL
      const fileId = extractFileIdFromUrl(value.file_url);
      if (fileId) {
        window.open(`/api/files/${fileId}/view`, '_blank');
      } else {
        // Fallback to direct URL
        window.open(value.file_url, '_blank');
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-brand-gray3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {isUploading ? (
        // Uploading state
        <div className="bg-brand-gray1/30 border border-brand-gray1 rounded-lg p-4">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
            <p className="text-sm text-brand-gray3">Uploading file...</p>
          </div>
        </div>
      ) : value?.file_name ? (
        // File is uploaded - show file info
        <div className="bg-brand-gray1/30 border border-brand-gray1 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiFileText size={24} className="text-brand-primary" />
              <div>
                <p className="text-sm font-medium text-brand-white">{value.file_name}</p>
                <p className="text-xs text-brand-gray3">
                  {value.file_size ? formatFileSize(value.file_size) : 'Unknown size'} • {value.file_type || 'Unknown type'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {showPreview && (
                <button
                  onClick={handleView}
                  className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
                  title="View file"
                >
                  <FiEye size={16} />
                </button>
              )}
              <button
                onClick={handleDownload}
                className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
                title="Download file"
              >
                <FiDownload size={16} />
              </button>
              {!disabled && (
                <button
                  onClick={handleRemove}
                  className="p-2 text-brand-gray3 hover:text-red-400 transition-colors"
                  title="Remove file"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // No file uploaded - show upload area
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver
              ? 'border-brand-primary bg-brand-primary/10'
              : 'border-brand-gray1 hover:border-brand-primary/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept={accept}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="space-y-3">
            <FiUpload size={32} className={`mx-auto ${isDragOver ? 'text-brand-primary' : 'text-brand-gray3'}`} />
            <div>
              <p className={`text-sm ${isDragOver ? 'text-brand-primary' : 'text-brand-gray3'}`}>
                {isDragOver ? 'Drop file here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-brand-gray3 mt-1">
                {accept} (max {maxSize}MB)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
