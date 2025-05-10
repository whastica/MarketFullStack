import { apiRequest } from './apiService';
import type { Purchase } from '../interfaces/Purchase';

export class PurchaseService {
  static async getAll(): Promise<Purchase[]> {
    return apiRequest('/purchases/all');
  }

  static async getByClient(clientId: string): Promise<Purchase[]> {
    return apiRequest(`/purchases/client/${clientId}`);
  }

  static async save(purchase: Purchase): Promise<Purchase> {
    return apiRequest('/purchases/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchase),
    });
  }
}