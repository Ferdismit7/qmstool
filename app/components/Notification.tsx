'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';

interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
  duration?: number; // Auto-dismiss duration in milliseconds
}

export default function Notification({
  isOpen,
  onClose,
  type,
  title,
  message,
  duration = 5000
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for fade out animation
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, handleClose]);

  if (!isOpen) return null;

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const borderColor = type === 'success' ? 'border-green-500' : 'border-red-500';
  const icon = type === 'success' ? FiCheckCircle : FiXCircle;
  const IconComponent = icon;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          transition-all duration-300 ease-in-out
          ${bgColor} border ${borderColor} rounded-lg shadow-lg
          max-w-sm w-full p-4 text-white
        `}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-sm opacity-90 mt-1">{message}</p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close notification"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 