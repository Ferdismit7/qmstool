'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration. Please contact your administrator.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error') || 'Default';

  const handleBackToLogin = () => {
    router.push('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMessages[error] || errorMessages.Default}</p>
                </div>
                {error === 'Configuration' && (
                  <div className="mt-4 text-xs text-red-600 bg-red-100 p-3 rounded">
                    <p className="font-semibold">Administrator Note:</p>
                    <p className="mt-1">
                      Please ensure the following environment variables are set in AWS Amplify:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>NEXTAUTH_SECRET</li>
                      <li>OKTA_CLIENT_ID</li>
                      <li>OKTA_CLIENT_SECRET</li>
                      <li>OKTA_ISSUER</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleBackToLogin}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Back to Login
          </button>
        </div>

        <div className="mt-4 text-center">
          <a
            href="/api/debug-nextauth-env"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Debug Environment Variables (Admin Only)
          </a>
        </div>
      </div>
    </div>
  );
}

