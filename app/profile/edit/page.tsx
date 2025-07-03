'use client';

import React, { useState, useEffect } from 'react';
import ProfileForm from '@/app/components/ProfileForm';
import { User } from '@/lib/types/user'; // Assuming you have a User type defined

type UserWithBusinessAreas = User & { business_areas: string[] };

export default function EditProfilePage() {
  const [user, setUser] = useState<UserWithBusinessAreas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const result = await response.json();
        if (result.success) {
          // Ensure business_areas is an array
          const userData = { ...result.data, business_areas: result.data.business_areas || [] };
          setUser(userData);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="w-full px-2 pt-6 pb-8">
      <div className="mb-0">
        <h1 className="text-3xl font-bold text-brand-white mb-2">Edit Profile</h1>
        <p className="text-brand-gray2">Update your personal information and password.</p>
      </div>

      {loading && <div className="text-center py-4">Loading profile...</div>}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}
      
      {user && !loading && !error && (
        <ProfileForm user={user} />
      )}
    </div>
  );
} 