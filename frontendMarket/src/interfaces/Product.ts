import type { Category } from "./Category";

export interface Product {
  productId: number;
  name: string;
  categoryId: number;
  price: number;
  stock: number;
  active: boolean;
  category?: Category;
}