// src/features/auth/authAPI.js
import axios from 'axios';
import Cookies from 'js-cookie';
export const loginRestaurant = async (username, password) => {
  const res = await axios.post(
    'http://localhost:9000/api/v1/user/login',
    { username, password },
    {
      withCredentials: true
    }
  );
  return res.data;
};

export const logoutRestaurant = async () => {
  const res = await axios.post(
    'http://localhost:9000/api/v1/user/logout',
    {},
   {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header as fallback
        Authorization: `Bearer ${Cookies.get('accessToken')}`
      }
    }
  );
  return res.data;
};
