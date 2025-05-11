import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Purchase } from "../../interfaces/Purchase"; // Asumo que ya tienes esta interfaz
import Button from "../layout/Botton";
import { Loading } from "../products/Loading";
import { Error } from "../products/Error";
import apiConfig from "./../../api/apiConfig"; // Asegúrate de que esta ruta sea la correcta

// Definir tipos más completos para el error
type ApiError = {
  message: string;
  statusCode: number;
  errorType?: string;
};

// Función para obtener la clase de estado
const getStatusClass = (status: string) => {
  switch (status) {
    case 'Pendiente':
      return 'bg-yellow-200 text-yellow-800'; // Clase para estado "Pendiente"
    case 'Completada':
      return 'bg-green-200 text-green-800'; // Clase para estado "Completada"
    case 'Cancelada':
      return 'bg-red-200 text-red-800'; // Clase para estado "Cancelada"
    default:
      return 'bg-gray-200 text-gray-800'; // Clase por defecto
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
  <tr key={purchase.purchaseId}>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      {purchase.purchaseId}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {purchase.clientId} {/* Puedes actualizar esto si quieres asociarlo con un cliente real */}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {new Date(purchase.date).toLocaleDateString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {purchase.paymentMethod}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusClass(purchase.state)}`}>
        {purchase.state}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <Link to={`/purchases/${purchase.purchaseId}`} className="text-blue-600 hover:text-blue-900">
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
        const cachedPurchases = localStorage.getItem("purchases");
        if (cachedPurchases) {
          setPurchases(JSON.parse(cachedPurchases));
          setLoading(false);
        } else {
          const response = await fetch(`${apiConfig.baseUrl}/purchases/all`, { signal: controller.signal });
          if (!response.ok) {
            const customError: ApiError = {
              message: "No se pudieron cargar las compras",
              statusCode: response.status,
            };
            throw customError;
          }
          const data = await response.json();
          setPurchases(data);
          localStorage.setItem("purchases", JSON.stringify(data));
        }
      } catch (err: unknown) {
        const isApiError = (value: unknown): value is ApiError =>
          typeof value === "object" && value !== null && "message" in value && "statusCode" in value;

        if (isApiError(err)) {
          setError(`Error ${err.statusCode}: ${err.message}`);
        } else {
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
                  {loading ? "Cargando..." : "No hay compras registradas"}
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => <TableRow key={`${purchase.purchaseId}-${purchase.date}`} purchase={purchase} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseList;