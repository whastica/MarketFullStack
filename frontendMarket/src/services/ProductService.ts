import { apiRequest } from './apiService';
import type { Product } from '../interfaces/Product';

export class ProductService {
  static async getAll(): Promise<Product[]> {
    console.log("Obteniendo todos los productos...");
    return apiRequest('/products/all');
  }

  static async getById(productId: number): Promise<Product> {
    return apiRequest(`/products/${productId}`);
  }

  static async getByCategory(categoryId: number): Promise<Product[]> {
    return apiRequest(`/products/category/${categoryId}`);
  }

  static async save(product: Product): Promise<Product> {
    return apiRequest('/products/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
  }

  static async delete(productId: number): Promise<boolean> {
    await apiRequest(`/products/delete/${productId}`, { method: 'DELETE' });
    return true;
  }
}