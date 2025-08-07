
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tasklite-backend-6ba9.onrender.com'
});

export default api;
