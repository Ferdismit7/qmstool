import { clientTokenUtils } from './auth';

/**
 * Centralized API client for consistent token handling
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  /**
   * Get authentication headers with token
   */
  private getAuthHeaders(): Record<string, string> {
    const token = clientTokenUtils.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make an authenticated API request
   */
  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check if token is expired before making request
    const token = clientTokenUtils.getToken();
    if (token && clientTokenUtils.isTokenExpired(token)) {
      console.log('Token is expired, clearing tokens');
      clientTokenUtils.clearTokens();
      throw new Error('Authentication token expired');
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for better compatibility
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token is invalid, clear it
        console.log('API returned 401, clearing tokens');
        clientTokenUtils.clearTokens();
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing
export { ApiClient };
