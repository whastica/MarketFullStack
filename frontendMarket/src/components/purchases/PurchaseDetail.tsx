import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Purchase } from '../../interfaces/Purchase';
import { Loading } from '../products/Loading';
import { Error } from '../products/Error';

const API_BASE_URL = 'http://localhost:8090';

// Definir tipos para el error personalizado
type ErrorWithMessage = {
  message: string;
  name?: string;
};

const getStatusClass = (estado: string) => {
  switch (estado) {
    case 'COMPLETADO':
      return 'bg-green-100 text-green-800';
    case 'CANCELADO':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const useFetchPurchase = (purchaseId: string) => {
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPurchase = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/purchases/${purchaseId}`, { signal: controller.signal });
        if (!response.ok) {
          // Usar un objeto literal en vez de Error constructor
          const customError: ErrorWithMessage = { 
            message: "Compra no encontrada",
            name: "FetchError"
          };
          throw customError;
        }
        const data = await response.json();
        setPurchase(data);
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

    fetchPurchase();
    return () => controller.abort();
  }, [purchaseId]);

  return { purchase, loading, error };
};

const ProductTable = ({ productos }: { productos: Purchase['productos'] }) => (
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
        {productos.map((item) => (
          <tr key={`${item.id.idCompra}-${item.id.idProducto}`}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.producto?.nombre || `Producto ID: ${item.id.idProducto}`}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.cantidad}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              ${(item.total / item.cantidad).toFixed(2)}
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

const PurchaseDetail = () => {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const { purchase, loading, error } = useFetchPurchase(purchaseId || '');

  if (loading) return <Loading message="Cargando detalles de la compra..." />;
  if (error) return <Error message={error} />;
  if (!purchase) return <div className="text-center py-10">Compra no encontrada</div>;

  const total = purchase.productos.reduce((sum, item) => sum + item.total, 0);

  return (
    <div>
      <div className="mb-4">
        <Link to="/purchases" className="text-green-700 hover:underline">&larr; Volver a la lista de compras</Link>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Detalle de Compra #{purchase.idCompra}</h1>
          <span className={`px-2 py-1 text-sm font-semibold rounded-full ${getStatusClass(purchase.estado)}`}>{purchase.estado}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p><strong>Fecha:</strong> {new Date(purchase.fecha).toLocaleString()}</p>
            <p><strong>Cliente:</strong> {purchase.cliente ? `${purchase.cliente.nombre} ${purchase.cliente.apellido}` : purchase.idCliente}</p>
            <p><strong>Método de pago:</strong> {purchase.medioPago}</p>
            <p><strong>Total:</strong> ${total.toFixed(2)}</p>
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-3">Productos comprados</h2>
        <ProductTable productos={purchase.productos} />
      </div>
    </div>
  );
};

export default PurchaseDetail;