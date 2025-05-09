import type { Category } from "./Category";

export interface Product {
  idProducto: number;
  nombre: string;
  idCategoria: number;
  codigoBarras: string;
  precioVenta: number;
  cantidadStock: number;
  estado: boolean;
  categoria?: Category;
}