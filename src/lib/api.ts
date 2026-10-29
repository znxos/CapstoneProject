import Cookies from 'js-cookie';

const API_BASE_URL = typeof window !== 'undefined' ? '' : (process.env.API_URL || 'http://localhost:8000');

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? Cookies.get('access_token') : null;
  
  const headers = new Headers(options.headers || {});
  
  // Set Content-Type by default if body is present and it's not FormData
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Inject Server-to-Server API Key when running on the server
  if (typeof window === 'undefined') {
    if (process.env.API_SECRET_KEY && !headers.has('X-API-Key')) {
      headers.set('X-API-Key', process.env.API_SECRET_KEY);
    }
    if (!headers.has('Origin')) {
      const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      headers.set('Origin', origin);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && typeof window !== 'undefined') {
      // Unauthorized: clear token and redirect to login
      Cookies.remove('access_token');
      const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/forgot-password-confirmation', '/confirmation', '/reset-password-confirmation'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }

    return response;
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw new Error("Network error: The server might be asleep or unreachable. Please try again.");
  }
}
