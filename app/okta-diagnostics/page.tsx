'use client';

import { useState, useEffect } from 'react';

interface DiagnosticResult {
  timestamp: string;
  checks?: {
    secretsInitialized?: boolean;
    environmentVariables?: Record<string, unknown>;
    providerConstruction?: { success: boolean; error?: string };
    discoveryEndpoint?: { success: boolean; status?: string; data?: Record<string, unknown>; error?: string };
    callbackUrl?: { expected: string; note: string };
    getAuthOptions?: { success: boolean; error: string | null };
  };
  errors?: string[];
  recommendations?: string[];
  summary?: {
    allChecksPassed: boolean;
    totalChecks: number;
    passedChecks: number;
    totalErrors: number;
  };
}

export default function OktaDiagnosticsPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/test-okta-config');
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to run diagnostics');
      } finally {
        setLoading(false);
      }
    };

    runDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Running diagnostics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Diagnostic Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">No diagnostic results available</div>
      </div>
    );
  }

  const allPassed = results.summary?.allChecksPassed ?? false;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Okta Authentication Diagnostics</h1>
          <p className="text-gray-600">Comprehensive check of Okta configuration and connectivity</p>
        </div>

        {/* Summary */}
        {results.summary && (
          <div className={`bg-white shadow rounded-lg p-6 mb-6 ${allPassed ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
            <h2 className="text-xl font-bold mb-4">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-2xl font-bold ${allPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {allPassed ? '✅ PASS' : '❌ FAIL'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Checks Passed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results.summary.passedChecks} / {results.summary.totalChecks}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">{results.summary.totalErrors}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Timestamp</p>
                <p className="text-sm text-gray-900">{new Date(results.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Environment Variables Check */}
        {results.checks?.environmentVariables && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              {Object.entries(results.checks.environmentVariables).map(([key, value]) => {
                const val = value as Record<string, unknown>;
                const exists = val.exists || val.value !== 'MISSING';
                return (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">{key}</span>
                    <div className="flex items-center gap-2">
                      {exists ? (
                        <span className="text-green-600">✅ Set</span>
                      ) : (
                        <span className="text-red-600">❌ Missing</span>
                      )}
                      {val.preview && (
                        <span className="text-sm text-gray-500">{String(val.preview)}</span>
                      )}
                      {val.value && val.value !== 'MISSING' && (
                        <span className="text-sm text-gray-500 font-mono">{String(val.value).substring(0, 50)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Callback URL */}
        {results.checks?.callbackUrl && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Callback URL Configuration</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Important:</p>
              <p className="text-sm text-yellow-700 mb-2">{results.checks.callbackUrl.note}</p>
              <p className="text-sm font-mono bg-white p-2 rounded border">
                {results.checks.callbackUrl.expected}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">How to configure in Okta:</p>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                <li>Log in to Okta Admin Console</li>
                <li>Go to Applications → Your Application</li>
                <li>Click on General Settings</li>
                <li>Find "Sign-in redirect URIs" section</li>
                <li>Add the URL shown above (copy it exactly, no trailing slashes)</li>
                <li>Save the changes</li>
              </ol>
            </div>
          </div>
        )}

        {/* Provider Construction */}
        {results.checks?.providerConstruction && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Provider Construction</h2>
            {results.checks.providerConstruction.success ? (
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-2xl">✅</span>
                <span>Okta provider constructed successfully</span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-red-600">
                <span className="text-2xl">❌</span>
                <div>
                  <p>Provider construction failed</p>
                  {results.checks.providerConstruction.error && (
                    <p className="text-sm text-gray-600 mt-1">{results.checks.providerConstruction.error}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Discovery Endpoint */}
        {results.checks?.discoveryEndpoint && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Okta Discovery Endpoint</h2>
            {results.checks.discoveryEndpoint.success ? (
              <div>
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <span className="text-2xl">✅</span>
                  <span>Discovery endpoint accessible</span>
                </div>
                {results.checks.discoveryEndpoint.data && (
                  <div className="bg-gray-50 rounded p-4">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(results.checks.discoveryEndpoint.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-2 text-red-600">
                <span className="text-2xl">❌</span>
                <div>
                  <p>Discovery endpoint failed</p>
                  {results.checks.discoveryEndpoint.error && (
                    <p className="text-sm text-gray-600 mt-1">{results.checks.discoveryEndpoint.error}</p>
                  )}
                  {results.checks.discoveryEndpoint.status && (
                    <p className="text-sm text-gray-600 mt-1">Status: {results.checks.discoveryEndpoint.status}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Errors */}
        {results.errors && results.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-red-800 mb-4">Errors Found</h2>
            <ul className="list-disc list-inside space-y-2">
              {results.errors.map((err, idx) => (
                <li key={idx} className="text-red-700">{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {results.recommendations && results.recommendations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Recommendations</h2>
            <ul className="list-disc list-inside space-y-2">
              {results.recommendations.map((rec, idx) => (
                <li key={idx} className="text-blue-700">{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Issues */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Common Okta Issues & Solutions</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-gray-900">1. Configuration Error</h3>
              <p className="text-sm text-gray-600 mt-1">
                This usually means the callback URL doesn't match. Verify the redirect URI in Okta matches exactly:
              </p>
              {results.checks?.callbackUrl && (
                <p className="text-xs font-mono bg-gray-100 p-2 rounded mt-2">
                  {results.checks.callbackUrl.expected}
                </p>
              )}
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-gray-900">2. NEXTAUTH_URL Mismatch</h3>
              <p className="text-sm text-gray-600 mt-1">
                Ensure NEXTAUTH_URL in AWS Secrets Manager matches your actual Amplify deployment URL exactly (including https://).
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-gray-900">3. Okta Issuer Format</h3>
              <p className="text-sm text-gray-600 mt-1">
                The OKTA_ISSUER should be in format: <code className="bg-gray-100 px-1 rounded">https://your-domain.okta.com</code> or <code className="bg-gray-100 px-1 rounded">https://your-domain.okta.com/oauth2/default</code>
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-gray-900">4. Client Secret Issues</h3>
              <p className="text-sm text-gray-600 mt-1">
                Ensure the OKTA_CLIENT_SECRET in AWS Secrets Manager matches the client secret in your Okta application settings.
              </p>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run Diagnostics Again
          </button>
        </div>
      </div>
    </div>
  );
}

