import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loading } from "../products/Loading";
import { Error } from "../products/Error";
import { API_BASE_URL } from "../../api/apiConfig";
import type { Purchase } from "../../interfaces/Purchase";
import type { PurchaseItem } from "../../interfaces/PurchaseItem";

// Definir tipos para el error personalizado
interface ErrorWithMessage {
  message: string;
  name?: string;
}

// Función para determinar la clase CSS según el estado
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

// Hook para obtener la compra por ID
const useFetchPurchase = (purchaseId: string) => {
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPurchase = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/purchases/${purchaseId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw { message: "Compra no encontrada", name: "FetchError" } as ErrorWithMessage;
        }

        const data = await response.json();
        setPurchase(data);
      } catch (err: unknown) {
        const isErrorWithMessage = (value: unknown): value is ErrorWithMessage =>
          typeof value === "object" && value !== null && "message" in value;

        if (isErrorWithMessage(err) && err.name !== "AbortError") {
          setError(err.message);
        } else {
          setError("Ocurrió un error inesperado.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();

    return () => {
      controller.abort();
    };
  }, [purchaseId]);

  return { purchase, loading, error };
};

// Componente para renderizar la tabla de productos
const ProductTable = ({ items }: { items: PurchaseItem[] }) => (
  <div className="bg-gray-50 rounded-lg overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Producto
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Cantidad
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Precio Unitario
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {items.map((item) => (
          <tr key={item.productId}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              Producto ID: {item.productId}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.quantity}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              ${(item.total / item.quantity).toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ${item.total.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Componente principal
const PurchaseDetail = () => {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const { purchase, loading, error } = useFetchPurchase(purchaseId || "");

  if (loading) return <Loading message="Cargando detalles de la compra..." />;
  if (error) return <Error message={error} />;
  if (!purchase) return <div className="text-center py-10">Compra no encontrada</div>;

  const total = purchase.items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div>
      <div className="mb-4">
        <Link to="/purchases" className="text-green-700 hover:underline">
          &larr; Volver a la lista de compras
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Detalle de Compra #{purchase.purchaseId}</h1>
          <span className={`px-2 py-1 text-sm font-semibold rounded-full ${getStatusClass(purchase.state)}`}>
            {purchase.state}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p>
              <strong>Fecha:</strong> {new Date(purchase.date).toLocaleString()}
            </p>
            <p>
              <strong>Cliente ID:</strong> {purchase.clientId}
            </p>
            <p>
              <strong>Método de pago:</strong> {purchase.paymentMethod}
            </p>
            <p>
              <strong>Total:</strong> ${total.toFixed(2)}
            </p>
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-3">Productos comprados</h2>
        <ProductTable items={purchase.items} />
      </div>
    </div>
  );
};

export default PurchaseDetail;
