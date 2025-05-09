import type { Product } from "./Product";

export interface PurchaseItem {
  id: {
    idCompra: number;
    idProducto: number;
  };
  cantidad: number;
  total: number;
  estado: boolean;
  producto?: Product;
}