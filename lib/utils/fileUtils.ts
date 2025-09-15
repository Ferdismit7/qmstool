/**
 * Extract file ID from S3 URL or file URL
 * This function tries to extract a unique identifier from the file URL
 * that can be used to locate the file in the database
 */
export const extractFileIdFromUrl = (fileUrl: string): string | null => {
  if (!fileUrl) return null;

  try {
    // If it's an S3 URL, extract the key and use a portion as ID
    if (fileUrl.includes('s3.amazonaws.com/')) {
      const urlParts = fileUrl.split('s3.amazonaws.com/');
      if (urlParts.length === 2) {
        const s3Key = urlParts[1];
        // Use the last part of the key (filename with timestamp) as ID
        const keyParts = s3Key.split('/');
        return encodeURIComponent(keyParts[keyParts.length - 1]);
      }
    }

    // If it's a local path, use the full path as ID
    if (fileUrl.startsWith('/uploads/')) {
      return encodeURIComponent(fileUrl);
    }

    // For other URLs, try to extract filename
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    return filename ? encodeURIComponent(filename) : null;
  } catch (error) {
    console.error('Error extracting file ID from URL:', error);
    return null;
  }
};

/**
 * Check if a file type can be viewed in the browser
 */
export const canViewInBrowser = (fileType: string): boolean => {
  const viewableTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'application/json'
  ];
  return viewableTypes.includes(fileType);
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file icon based on file type
 */
export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType === 'application/pdf') return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈';
  if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🎵';
  return '📁';
};
