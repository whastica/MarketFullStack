// apiConfig.ts
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

// Verificación y advertencia
if (!process.env.REACT_APP_API_BASE_URL) {
  console.warn('REACT_APP_API_BASE_URL no está definida. Usando la URL por defecto:', API_BASE_URL);
}

// Exportamos la configuración con 'baseUrl'
export default { baseUrl: API_BASE_URL };