const isDevelopment = import.meta.env.MODE === 'development';

const API_URL = isDevelopment 
  ? 'http://localhost:5000/api'
  : 'https://collabsphere-jzjc.onrender.com/api';

const BASE_URL = isDevelopment
  ? 'http://localhost:5000'
  : 'https://collabsphere-jzjc.onrender.com';

console.log('Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('Using API URL:', API_URL);

export { API_URL, BASE_URL };