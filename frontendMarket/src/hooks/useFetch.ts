import { useState, useEffect } from "react";

interface FetchOptions {
  params?: Record<string, string | number | boolean>;
}

const API_BASE_URL = "http://localhost:8090";

const useFetch = <T>(endpoint: string, options?: FetchOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = `${API_BASE_URL}${endpoint}`;

        if (options?.params) {
          // Convertimos los valores a string
          const queryParams = new URLSearchParams(
            Object.entries(options.params).reduce<Record<string, string>>(
              (acc, [key, value]) => {
                acc[key] = String(value);
                return acc;
              },
              {}
            )
          ).toString();

          url += `?${queryParams}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al cargar los datos");
        const result = await response.json();
        setData(result);
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

export default useFetch;