import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../layout/Botton';
import { Loading } from '../products/Loading';
import { Error } from '../products/Error';

const API_BASE_URL = 'http://localhost:8090';

// Definir tipos para el error personalizado
type ErrorWithMessage = {
  message: string;
  name?: string;
};

// Interfaces adicionales necesarias para el formulario
interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}

interface ProductoSeleccionado {
  idProducto: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface FormData {
  idCliente: number;
  medioPago: string;
  productos: ProductoSeleccionado[];
}

const initialFormData: FormData = {
  idCliente: 0,
  medioPago: 'EFECTIVO',
  productos: []
};

const mediosPago = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];

const PurchaseForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [cantidad, setCantidad] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Cargar clientes y productos
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        // Cargar clientes
        const clientesResponse = await fetch(`${API_BASE_URL}/customers/all`, { signal: controller.signal });
        if (!clientesResponse.ok) {
          const customError: ErrorWithMessage = { 
            message: "No se pudieron cargar los clientes",
            name: "FetchError"
          };
          throw customError;
        }
        const clientesData = await clientesResponse.json();
        setClientes(clientesData);

        // Cargar productos
        const productosResponse = await fetch(`${API_BASE_URL}/products/all`, { signal: controller.signal });
        if (!productosResponse.ok) {
          const customError: ErrorWithMessage = { 
            message: "No se pudieron cargar los productos",
            name: "FetchError"
          };
          throw customError;
        }
        const productosData = await productosResponse.json();
        setProductos(productosData);

      } catch (err: unknown) {
        const isErrorWithMessage = (value: unknown): value is ErrorWithMessage => 
          typeof value === 'object' && 
          value !== null && 
          'message' in value &&
          typeof (value as Record<string, unknown>).message === 'string';
        
        if (isErrorWithMessage(err)) {
          const errorObj = err;
          
          if (!('name' in errorObj) || errorObj.name !== "AbortError") {
            setError(errorObj.message);
          }
        } else {
          setError("Ocurrió un error inesperado.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      idCliente: parseInt(e.target.value, 10)
    });
  };

  const handleMedioPagoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      medioPago: e.target.value
    });
  };

  const handleProductoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(parseInt(e.target.value, 10));
  };

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCantidad(parseInt(e.target.value, 10));
  };

  const addProducto = () => {
    if (selectedProductId === 0 || cantidad <= 0) {
      return;
    }

    const productoSeleccionado = productos.find(p => p.id === selectedProductId);
    if (!productoSeleccionado) return;

    // Verificar si el producto ya está en la lista
    const existingProductIndex = formData.productos.findIndex(p => p.idProducto === selectedProductId);

    if (existingProductIndex >= 0) {
      // Actualizar cantidad del producto existente
      const updatedProductos = [...formData.productos];
      updatedProductos[existingProductIndex].cantidad += cantidad;
      
      setFormData({
        ...formData,
        productos: updatedProductos
      });
    } else {
      // Agregar nuevo producto
      setFormData({
        ...formData,
        productos: [
          ...formData.productos,
          {
            idProducto: productoSeleccionado.id,
            nombre: productoSeleccionado.nombre,
            cantidad: cantidad,
            precioUnitario: productoSeleccionado.precio
          }
        ]
      });
    }

    // Resetear selección
    setSelectedProductId(0);
    setCantidad(1);
  };

  const removeProducto = (idProducto: number) => {
    setFormData({
      ...formData,
      productos: formData.productos.filter(p => p.idProducto !== idProducto)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.idCliente === 0) {
      setError("Debe seleccionar un cliente");
      return;
    }

    if (formData.productos.length === 0) {
      setError("Debe agregar al menos un producto");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Preparar datos para enviar al servidor
      const purchaseData = {
        idCliente: formData.idCliente,
        medioPago: formData.medioPago,
        productos: formData.productos.map(p => ({
          idProducto: p.idProducto,
          cantidad: p.cantidad
        }))
      };

      const response = await fetch(`${API_BASE_URL}/purchases/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(purchaseData)
      });

      if (!response.ok) {
        const customError: ErrorWithMessage = { 
          message: "Error al guardar la compra",
          name: "FetchError"
        };
        throw customError;
      }

      const result = await response.json();
      // Redirigir a la página de detalle de la compra
      navigate(`/purchases/${result.idCompra}`);
      
    } catch (err: unknown) {
      const isErrorWithMessage = (value: unknown): value is ErrorWithMessage => 
        typeof value === 'object' && 
        value !== null && 
        'message' in value &&
        typeof (value as Record<string, unknown>).message === 'string';
      
      if (isErrorWithMessage(err)) {
        const errorObj = err;
        setError(errorObj.message);
      } else {
        setError("Ocurrió un error al procesar la compra.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const calcularTotal = () => {
    return formData.productos.reduce((total, p) => total + (p.precioUnitario * p.cantidad), 0);
  };

  if (loading) return <Loading message="Cargando datos..." />;
  if (error && !submitting) return <Error message={error} />;

  return (
    <div>
      <div className="mb-4">
        <Link to="/purchases" className="text-green-700 hover:underline">&larr; Volver a la lista de compras</Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Nueva Compra</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Datos de la compra */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={formData.idCliente}
                onChange={handleClienteChange}
                required
              >
                <option value={0}>Seleccionar cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} {cliente.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <select
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={formData.medioPago}
                onChange={handleMedioPagoChange}
                required
              >
                {mediosPago.map(medio => (
                  <option key={medio} value={medio}>
                    {medio}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sección de productos */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Productos</h2>
            
            {/* Formulario para agregar productos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto
                </label>
                <select
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={selectedProductId}
                  onChange={handleProductoChange}
                >
                  <option value={0}>Seleccionar producto</option>
                  {productos.map(producto => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre} - ${producto.precio} (Stock: {producto.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={cantidad}
                  onChange={handleCantidadChange}
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addProducto}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  disabled={selectedProductId === 0 || cantidad <= 0}
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Tabla de productos seleccionados */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.productos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay productos seleccionados
                      </td>
                    </tr>
                  ) : (
                    formData.productos.map((producto) => (
                      <tr key={producto.idProducto}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {producto.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {producto.cantidad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${producto.precioUnitario.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(producto.cantidad * producto.precioUnitario).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => removeProducto(producto.idProducto)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {formData.productos.length > 0 && (
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold">
                        TOTAL:
                      </td>
                      <td colSpan={2} className="px-6 py-4 text-sm font-bold">
                        ${calcularTotal().toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && submitting && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <p>{error}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <Link to="/purchases">
                <Button color="secondary">Cancelar</Button>
            </Link>
            <Button 
              type="submit" 
              color="primary"
              disabled={submitting || formData.productos.length === 0}
            >
              {submitting ? 'Guardando...' : 'Guardar Compra'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseForm;