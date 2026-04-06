import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:3000',  // backend port
  withCredentials: true,             // sends HTTP-only cookie automatically
});

export default api;