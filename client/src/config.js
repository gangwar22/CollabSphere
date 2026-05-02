const isDevelopment = import.meta.env.MODE === 'development';

// Auto-detect backend URL based on environment
const getBackendURL = () => {
  if (isDevelopment) {
    // In development, use localhost:5000 for both API and BASE_URL
    return 'http://localhost:5000';
  }
  // In production, use the deployed URL
  return 'https://collabsphere-jzjc.onrender.com';
};

const BACKEND_URL = getBackendURL();
const API_URL = `${BACKEND_URL}/api`;
const BASE_URL = BACKEND_URL;

console.log('Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('Backend URL:', BACKEND_URL);
console.log('Using API URL:', API_URL);

export { API_URL, BASE_URL };