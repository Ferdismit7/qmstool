'use client';

import { useState, useEffect } from 'react';
import { FiX, FiDownload, FiExternalLink } from 'react-icons/fi';
import { FileViewerProps } from '@/app/types/fileUpload';

export default function FileViewer({
  fileId,
  fileName,
  fileType,
  isOpen,
  onClose
}: FileViewerProps) {
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && fileId) {
      setIsLoading(true);
      setError(null);
      
      // Generate viewer URL
      const url = `/api/files/${fileId}/view`;
      setViewerUrl(url);
      setIsLoading(false);
    }
  }, [isOpen, fileId]);

  const handleDownload = () => {
    window.open(`/api/files/${fileId}/download`, '_blank');
  };

  const handleOpenInNewTab = () => {
    window.open(viewerUrl, '_blank');
  };

  const canViewInBrowser = () => {
    const viewableTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'text/html'
    ];
    return viewableTypes.includes(fileType);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {fileName}
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {fileType}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Download file"
            >
              <FiDownload size={20} />
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Open in new tab"
            >
              <FiExternalLink size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Download File
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && canViewInBrowser() && (
            <iframe
              src={viewerUrl}
              className="w-full h-full border-0"
              title={fileName}
            />
          )}

          {!isLoading && !error && !canViewInBrowser() && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  This file type cannot be viewed in the browser.
                </p>
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Download File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
