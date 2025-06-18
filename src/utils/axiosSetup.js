// src/utils/axiosSetup.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { store } from '../app/store';
import { logout } from '../features/auth/authSlice';

// Create a base instance (optional)
const api = axios.create({
  baseURL: 'http://localhost:9000/api/v1', // adjust as needed
  withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('accessToken')}`,
      }
});


// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');

    if (token) {
      try {
        const { exp } = jwtDecode(token);
        const now = Date.now();

        if (now >= exp * 1000) {
          // Token expired
          store.dispatch(logout());
          throw new axios.Cancel('Token expired, user logged out.');
        }

        config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.error('JWT Decode error:', err);
        store.dispatch(logout());
        throw new axios.Cancel('Invalid token, user logged out.');
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor for handling 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;
