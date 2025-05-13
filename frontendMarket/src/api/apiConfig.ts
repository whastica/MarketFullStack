
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/whalensoft/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'frontendMarket';

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL no está definida. Usando la URL por defecto:', API_BASE_URL);
}

console.log("API_BASE_URL:", API_BASE_URL);