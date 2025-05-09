import type { PurchaseItem } from "./PurchaseItem";
import type { Client } from "./Client";

export interface Purchase {
  idCompra: number;
  idCliente: string;
  fecha: string;
  medioPago: string;
  comentario: string;
  estado: string;
  productos: PurchaseItem[];
  cliente?: Client;
}