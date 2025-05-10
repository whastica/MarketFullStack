import { useState, useEffect } from "react";
import { apiRequest } from "../services/apiService";
import { API_BASE_URL } from "../api/apiConfig";


interface FetchOptions {
  params?: Record<string, string | number | boolean>;
  method?: string;
  body?: BodyInit | null; // `BodyInit` abarca tipos válidos para `body`, como JSON, FormData, etc.
}

export const useFetch = <T>(endpoint: string, options?: FetchOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = options?.params
          ? `${API_BASE_URL}${endpoint}?${new URLSearchParams(
              Object.entries(options.params).reduce<Record<string, string>>(
                (acc, [key, value]) => {
                  acc[key] = String(value);
                  return acc;
                },
                {}
              )
            )}`
          : `${API_BASE_URL}${endpoint}`;

        const response = await apiRequest<T>(url, {
          method: options?.method || "GET",
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        setData(response);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, options]);

  return { data, loading, error };
};