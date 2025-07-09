'use client';

import React, { useState, useEffect } from 'react';

interface SignupFormProps {
  onToggleForm: () => void;
}

interface BusinessArea {
  business_area: string;
}

const SignupForm = ({ onToggleForm }: SignupFormProps) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessAreas: [] as string[]
  });
  const [error, setError] = useState('');
  const [businessAreas, setBusinessAreas] = useState<BusinessArea[]>([]);
  const [newBusinessArea, setNewBusinessArea] = useState('');
  const [showAddBusinessArea, setShowAddBusinessArea] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBusinessAreas, setLoadingBusinessAreas] = useState(true);

  // Fetch existing business areas on component mount
  useEffect(() => {
    const fetchBusinessAreas = async () => {
      setLoadingBusinessAreas(true);
      try {
        const response = await fetch('/api/business-areas');
        if (response.ok) {
          const result = await response.json();
          // Access the data property from the API response
          setBusinessAreas(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching business areas:', error);
        setBusinessAreas([]);
      } finally {
        setLoadingBusinessAreas(false);
      }
    };

    fetchBusinessAreas();
  }, []);

  const handleBusinessAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === 'add-new') {
      setShowAddBusinessArea(true);
    } else if (value && !formData.businessAreas.includes(value)) {
      setFormData(prev => ({
        ...prev,
        businessAreas: [...prev.businessAreas, value]
      }));
    }
  };

  const handleAddNewBusinessArea = async () => {
    if (!newBusinessArea.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/business-areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ business_area: newBusinessArea.trim() }),
      });

      if (response.ok) {
        // Add to local state
        setBusinessAreas(prev => [...prev, { business_area: newBusinessArea.trim() }]);
        
        // Add to form data
        setFormData(prev => ({
          ...prev,
          businessAreas: [...prev.businessAreas, newBusinessArea.trim()]
        }));
        
        setNewBusinessArea('');
        setShowAddBusinessArea(false);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add business area');
      }
    } catch {
      setError('Failed to add business area');
    } finally {
      setLoading(false);
    }
  };

  const removeBusinessArea = (areaToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      businessAreas: prev.businessAreas.filter(area => area !== areaToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          businessAreas: formData.businessAreas
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Signup failed');
      }

      // Redirect to login page after successful signup
      onToggleForm();
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-brand-dark/20">
      <div className="bg-brand-dark p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-brand-white mb-6 text-center">Sign Up</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-brand-white mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-brand-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="businessAreas" className="block text-brand-white mb-2">
              Business Areas (Optional)
            </label>
            <select
              id="businessAreas"
              value=""
              onChange={handleBusinessAreaChange}
              className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              disabled={loadingBusinessAreas}
            >
              <option value="">
                {loadingBusinessAreas ? 'Loading business areas...' : 'Select Business Area'}
              </option>
              {Array.isArray(businessAreas) && businessAreas.map((area) => (
                <option key={area.business_area} value={area.business_area}>
                  {area.business_area}
                </option>
              ))}
              <option value="add-new">+ Add New Business Area</option>
            </select>
            
            {/* Add New Business Area Input */}
            {showAddBusinessArea && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newBusinessArea}
                  onChange={(e) => setNewBusinessArea(e.target.value)}
                  placeholder="Enter new business area"
                  className="flex-1 px-3 py-1 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddNewBusinessArea}
                  disabled={loading || !newBusinessArea.trim()}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none text-sm disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBusinessArea(false);
                    setNewBusinessArea('');
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Selected Business Areas */}
            {formData.businessAreas.length > 0 && (
              <div className="mt-2">
                <p className="text-brand-white text-sm mb-2">Selected Business Areas:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.businessAreas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() => removeBusinessArea(area)}
                        className="text-white hover:text-red-200 focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-brand-white mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-brand-white mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 rounded bg-brand-gray1 text-brand-white border border-brand-gray2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-brand-white">
          Already have an account?{' '}
          <button
            onClick={onToggleForm}
            className="text-blue-500 hover:text-blue-400 focus:outline-none"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm; 