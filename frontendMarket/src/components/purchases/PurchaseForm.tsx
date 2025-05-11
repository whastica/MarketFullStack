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
              >
                {mediosPago.map(medio => (
                  <option key={medio} value={medio}>
                    {medio}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Selección de producto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                    {producto.nombre} - ${producto.precio}
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
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={cantidad}
                onChange={handleCantidadChange}
                min="1"
                max="99"
              />
            </div>
          </div>

          {/* Botón para agregar producto */}
          <div className="mb-6">
            <Button 
              onClick={addProducto}
              disabled={submitting || selectedProductId === 0 || cantidad <= 0}
            >
              {submitting ? 'Agregando...' : 'Agregar Producto'}
            </Button>
          </div>

          {/* Lista de productos en el carrito */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Productos en el carrito</h3>
            <ul>
              {formData.productos.map((producto, index) => (
                <li key={index} className="flex justify-between mb-2">
                  <span>{producto.nombre} (x{producto.cantidad})</span>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeProducto(producto.idProducto)}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Total */}
          <div className="mb-6">
            <strong>Total: ${calcularTotal()}</strong>
          </div>

          {/* Botón de enviar */}
          <div className="mb-6">
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Enviando...' : 'Finalizar Compra'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseForm;