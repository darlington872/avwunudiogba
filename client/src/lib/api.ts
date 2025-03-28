/**
 * API utilities for handling both local and Netlify deployments
 */

// Determine the base URL for API requests based on the environment
const isNetlify = window.location.hostname.includes('netlify.app');
const isProd = import.meta.env.PROD === true;

// Use different base URLs depending on the environment
export const API_BASE_URL = 
  isNetlify ? 
    '/.netlify/functions/api' : // Netlify Functions path
    isProd ? 
      '/api' : // Production path (normal deployment)
      '/api'; // Development path

/**
 * Makes a fetch request to the API
 */
export async function fetchApi(
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Make the request
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include credentials for authentication
  });
}

/**
 * Wrapper around fetchApi that handles JSON parsing and errors
 */
export async function apiRequest<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetchApi(endpoint, options);
    
    // Check if the response is successful
    if (!response.ok) {
      // Try to parse error message
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
    }
    
    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}