import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Purchase } from "../../interfaces/Purchase";
import Button from "../layout/Botton";
import {Loading} from "../products/Loading";
import {Error} from "../products/Error";

const API_BASE_URL = "http://localhost:8090";

// Definir tipos para el error personalizado
type ErrorWithMessage = {
  message: string;
  name?: string;
};

const getStatusClass = (estado: string) => {
  switch (estado) {
    case "COMPLETADO":
      return "bg-green-100 text-green-800";
    case "CANCELADO":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const TableHeader = () => (
  <thead className="bg-gray-50">
    <tr>
      {["ID", "Cliente", "Fecha", "Método de Pago", "Estado", "Acciones"].map((header) => (
        <th
          key={header}
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ purchase }: { purchase: Purchase }) => (
  <tr key={purchase.idCompra}>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      {purchase.idCompra}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {purchase.cliente
        ? `${purchase.cliente.nombre} ${purchase.cliente.apellido}`
        : purchase.idCliente}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {new Date(purchase.fecha).toLocaleDateString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {purchase.medioPago}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusClass(purchase.estado)}`}>
        {purchase.estado}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <Link to={`/purchases/${purchase.idCompra}`} className="text-blue-600 hover:text-blue-900">
        Ver detalles
      </Link>
    </td>
  </tr>
);

const PurchaseList = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPurchases = async () => { 
      try {
        const response = await fetch(`${API_BASE_URL}/purchases/all`, { signal: controller.signal });
        if (!response.ok) {
          // Usar un objeto literal en vez de Error constructor
          const customError: ErrorWithMessage = { 
            message: "No se pudieron cargar las compras",
            name: "FetchError"
          };
          throw customError;
        }
        const data = await response.json();
        setPurchases(data);
      } catch (err: unknown) {
        // Verificar si el error es un objeto con una propiedad message
        const isErrorWithMessage = (value: unknown): value is ErrorWithMessage => 
          typeof value === 'object' && 
          value !== null && 
          'message' in value &&
          typeof (value as Record<string, unknown>).message === 'string';
        
        if (isErrorWithMessage(err)) {
          // Ahora TypeScript sabe que err tiene una propiedad message de tipo string
          const errorObj = err;
          
          // Verificar si tiene la propiedad name y no es AbortError
          if (!('name' in errorObj) || errorObj.name !== "AbortError") {
            setError(errorObj.message);
          }
        } else {
          // Fallback para cualquier otro tipo de error
          setError("Ocurrió un error inesperado.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();

    return () => controller.abort();
  }, []);

  if (loading) return <Loading message="Cargando compras..." />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Compras</h1>
        <Link to="/purchases/new">
          <Button color="secondary">Nueva Compra</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay compras registradas
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => <TableRow key={purchase.idCompra} purchase={purchase} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseList;