// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tasklite-backend-6ba9.onrender.com', // Adjust if your backend route is different
});

export default api;
