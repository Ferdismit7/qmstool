'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types/user';

interface ProfileFormProps {
  user: User & { business_areas: string[] };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      username: user.username,
      email: user.email,
      business_areas: user.business_areas || [],
      password: '',
      newBusinessArea: '',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [allBusinessAreas, setAllBusinessAreas] = useState<string[]>([]);

  const fetchBusinessAreas = async () => {
    try {
      const response = await fetch('/api/business-areas');
      const data = await response.json();
      if (data.success) {
        setAllBusinessAreas(data.data.map((area: unknown) => (area as { business_area: string }).business_area));
      }
    } catch (error) {
      console.error('Failed to fetch business areas', error);
    }
  };

  useEffect(() => {
    fetchBusinessAreas();
  }, []);

  const selectedBusinessAreas = watch('business_areas');

  const handleAddNewBusinessArea = async () => {
    const newArea = watch('newBusinessArea');
    if (!newArea || allBusinessAreas.includes(newArea)) {
      setSubmitMessage({ type: 'error', message: 'Business area is empty or already exists.' });
      return;
    }

    try {
      const response = await fetch('/api/business-areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_area: newArea }),
      });
      const result = await response.json();
      if (response.ok) {
        setSubmitMessage({ type: 'success', message: `Successfully added '${newArea}'.` });
        setValue('newBusinessArea', ''); // Clear input
        await fetchBusinessAreas(); // Refresh the list
        // Automatically select the new area
        setValue('business_areas', [...selectedBusinessAreas, newArea]);
      } else {
        throw new Error(result.message || 'Failed to add new business area');
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', message: error instanceof Error ? error.message : 'An error occurred.' });
    }
  };

  const onSubmit = async (data: unknown) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    const payload: {
      username: string;
      email: string;
      business_areas: string[];
      password?: string;
    } = {
      username: (data as { username: string }).username,
      email: (data as { email: string }).email,
      business_areas: (data as { business_areas: string[] }).business_areas,
    };
    if ((data as { password?: string }).password) {
      payload.password = (data as { password?: string }).password;
    }

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage({ type: 'success', message: 'Profile updated successfully!' });
        setShowSuccessModal(true);
      } else {
        setSubmitMessage({ type: 'error', message: result.error || 'Failed to update profile.' });
      }
    } catch {
      setSubmitMessage({ type: 'error', message: 'An unknown error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalOkClick = () => {
    setShowSuccessModal(false);
    router.back();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {submitMessage && !showSuccessModal && (
          <div className={`mb-4 p-4 rounded-md text-white ${submitMessage.type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
            {submitMessage.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-brand-white">Username</label>
            <input id="username" type="text" {...register('username', { required: 'Username is required' })} className="mt-1 block w-full bg-brand-gray2/40 border-gray-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-blue-500" />
            {errors.username && <p className="mt-1 text-sm text-red-400">{errors.username.message as string}</p>}
          </div>
          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-white">Email Address</label>
            <input id="email" type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })} className="mt-1 block w-full bg-brand-gray2/40 border-gray-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-blue-500" />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message as string}</p>}
          </div>
        </div>
        
        <hr className="border-brand-gray2/50" />

        {/* Business Areas Section */}
        <div>
          <h3 className="text-lg font-semibold text-brand-white">Assign Business Areas</h3>
          <div className="mt-2 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-md border border-brand-gray2">
            {allBusinessAreas.map(area => (
              <label key={area} className="flex items-center space-x-3 p-2 rounded-md hover:bg-brand-gray2/50">
                <input
                  type="checkbox"
                  {...register('business_areas')}
                  value={area}
                  className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-brand-white">{area}</span>
              </label>
            ))}
          </div>
          
          {/* Add New Business Area */}
          <div className="mt-4">
            <label htmlFor="newBusinessArea" className="block text-sm font-medium text-brand-white">Add New Business Area</label>
            <div className="mt-1 flex gap-2">
              <input id="newBusinessArea" type="text" {...register('newBusinessArea')} className="block w-full bg-brand-gray2/40 border-gray-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-blue-500" placeholder="Enter new area name" />
              <button type="button" onClick={handleAddNewBusinessArea} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Add</button>
            </div>
          </div>
        </div>

        <hr className="border-brand-gray2/50" />

        {/* Password */}
        <div>
          <h3 className="text-lg font-semibold text-brand-white">Change Password</h3>
          <p className="text-sm text-brand-gray2 mt-1 mb-4">Leave blank to keep your current password.</p>
          <label htmlFor="password" className="block text-sm font-medium text-brand-white">New Password</label>
          <input id="password" type="password" {...register('password')} className="mt-1 block w-full bg-brand-gray2/40 border-gray-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-blue-500" />
        </div>
        
        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 bg-brand-gray2 text-white rounded-lg hover:bg-brand-gray2/80 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
      
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-brand-gray2 p-8 rounded-lg shadow-xl text-center">
            <h3 className="text-xl font-bold text-brand-white mb-4">Success!</h3>
            <p className="text-brand-gray3 mb-6">{submitMessage?.message || 'Your profile has been updated successfully.'}</p>
            <button
              onClick={handleModalOkClick}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}