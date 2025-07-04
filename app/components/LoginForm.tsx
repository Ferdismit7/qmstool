'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onToggleForm: () => void;
}

const LoginForm = ({ onToggleForm }: LoginFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email: formData.email });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Clear any existing tokens first
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

      if (formData.rememberMe) {
        localStorage.setItem('authToken', data.token);
        document.cookie = `authToken=${data.token}; path=/; max-age=2592000;`;
        console.log('Token stored in localStorage and persistent cookie (remember me enabled)');
      } else {
        sessionStorage.setItem('authToken', data.token);
        document.cookie = `authToken=${data.token}; path=/;`;
        localStorage.removeItem('authToken'); // Extra safety: always remove from localStorage
        console.log('Token stored in sessionStorage and session cookie (remember me disabled)');
      }

      // Dispatch custom event to notify Layout component of user change
      window.dispatchEvent(new Event('tokenChange'));

      console.log('Login successful, redirecting...');
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-brand-dark/20">
      <div className="bg-brand-dark p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-brand-white mb-6 text-center">Login</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={isLoading}
            />
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
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-brand-gray2 rounded"
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className="ml-2 block text-brand-white">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-brand-white">
          Don't have an account?{' '}
          <button
            onClick={onToggleForm}
            className="text-blue-500 hover:text-blue-400 focus:outline-none"
            disabled={isLoading}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 