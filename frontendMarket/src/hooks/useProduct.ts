import { useState } from "react";
import { apiRequest } from "../services/apiService";
import type { Product } from "../interfaces/Product";

export const useProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Product[]>("/products/all");
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
      await apiRequest<Product>("/products/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product), // ✅ Convertimos el producto a JSON
      });
      fetchProducts();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: number) => {
    setLoading(true);
    try {
      await apiRequest(`/products/delete/${productId}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, fetchProducts, saveProduct, deleteProduct };
};