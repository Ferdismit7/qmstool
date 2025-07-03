'use client';

import { useRouter } from 'next/navigation';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Remove token from localStorage and sessionStorage
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    // Remove token from cookies
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Dispatch custom event to notify Layout component of user change
    window.dispatchEvent(new Event('tokenChange'));
    
    // Redirect to login page
    router.push('/auth');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-transparent border border-brand-gray3 text-brand-gray3 px-4 py-2 rounded-md hover:bg-brand-gray3/10 focus:outline-none focus:ring-2 focus:ring-brand-gray3 focus:ring-offset-2 transition-colors"
    >
      Logout
    </button>
  );
};

export default LogoutButton; 