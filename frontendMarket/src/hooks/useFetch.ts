import { useState, useEffect } from "react";
import { apiRequest } from "../services/apiService";
import { API_BASE_URL } from "../api/apiConfig";

interface FetchOptions {
  params?: Record<string, string | number | boolean>;
  method?: string;
  body?: BodyInit | null;
}

export const useFetch = <T>(endpoint: string, options?: FetchOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Desestructuramos las opciones
  const { params, method, body } = options || {};

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

        const url = params
          ? `${baseUrl}/${cleanEndpoint}?${new URLSearchParams(
              Object.entries(params).reduce<Record<string, string>>(
                (acc, [key, value]) => {
                  acc[key] = String(value);
                  console.log('URL construida:', url);
                  return acc;
                },
                {}
              )
            )}`
          : `${baseUrl}/${cleanEndpoint}`;

        const response = await apiRequest<T>(url, {
          method: method || "GET",
          body: body ? JSON.stringify(body) : undefined,
        });

        setData(response);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, params, method, body]); // ✅ Dependencias desestructuradas y explícitas

  return { data, loading, error };
};