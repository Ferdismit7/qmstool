'use client';

import { useRouter } from 'next/navigation';
import { clientTokenUtils } from '@/lib/auth';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all tokens using the utility function
    clientTokenUtils.clearTokens();
    
    console.log('Logged out, tokens cleared');
    router.push('/auth');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg sm:rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
      aria-label="Logout"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5 sm:w-4 sm:h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
        />
      </svg>
    </button>
  );
};

export default LogoutButton; 