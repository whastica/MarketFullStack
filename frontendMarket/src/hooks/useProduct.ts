import { useState } from "react";
import type { Product } from "../interfaces/Product";

interface UseProductReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => void;
  saveProduct: (product: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
}

const API_BASE_URL = "http://localhost:8090";

const useProduct = (): UseProductReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/all`);
      if (!response.ok) throw new Error("Error al obtener los productos");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (product: Partial<Product>) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error("Error al guardar el producto");
      await response.json();
      fetchProducts(); // Actualiza la lista de productos después de guardar
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/delete/${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar el producto");
      fetchProducts(); // Actualiza la lista de productos después de eliminar
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, fetchProducts, saveProduct, deleteProduct };
};

export default useProduct;