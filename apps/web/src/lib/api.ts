import axios from 'axios';
import { generateSignature, hashIp } from '@manga/shared';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';
const SIGNATURE_SECRET = process.env['NEXT_PUBLIC_SIGNATURE_SECRET'] ?? '';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// Request interceptor: inject signature headers
api.interceptors.request.use(async (config) => {
  const timestamp = Date.now();
  const userAgent = navigator.userAgent;
  // On client, we hash a static placeholder for IP (server has real IP)
  const hashedIp = await hashIp('client');

  const signature = await generateSignature({ timestamp, userAgent, hashedIp }, SIGNATURE_SECRET);

  config.headers['X-Timestamp'] = String(timestamp);
  config.headers['X-Signature'] = signature;

  // Attach auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    return Promise.reject(error);
  },
);
