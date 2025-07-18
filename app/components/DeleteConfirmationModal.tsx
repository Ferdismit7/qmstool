'use client';

import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType
}: DeleteConfirmationModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset confirmation text when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmationText('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (confirmationText.toLowerCase() === 'delete') {
      setIsDeleting(true);
      try {
        await onConfirm();
        onClose();
      } catch (error) {
        console.error('Delete failed:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && confirmationText.toLowerCase() === 'delete') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-brand-gray1 border border-brand-gray2 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-gray2">
          <div className="flex items-center space-x-3">
            <FiAlertTriangle className="text-red-500 text-xl" />
            <h3 className="text-lg font-semibold text-brand-white">
              Confirm Delete
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-brand-gray3 hover:text-brand-white transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-brand-white mb-4">
            Are you sure you want to delete this {itemType}?
          </p>
          <p className="text-brand-gray3 text-sm mb-6">
            <strong>{itemName}</strong>
          </p>
          
          <div className="mb-6">
            <label htmlFor="confirmation" className="block text-sm font-medium text-brand-white mb-2">
              Type &quot;delete&quot; to confirm:
            </label>
            <input
              id="confirmation"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 bg-brand-gray2 border border-brand-gray3 rounded-md text-brand-white placeholder-brand-gray4 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="Type 'delete' to confirm"
              autoFocus
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-brand-gray2 text-brand-white rounded-md hover:bg-brand-gray3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmationText.toLowerCase() !== 'delete' || isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 