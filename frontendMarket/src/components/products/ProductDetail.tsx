import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import type { Product } from "../../interfaces/Product";
import { Loading } from "../products/Loading";
import {Error} from "../products/Error";
import Button from "../layout/Botton";
import { getProductImageUrl } from "../../utils/imageHelpers";

const ProductDetail = () => {
  const { id: productId } = useParams<{ id: string }>();
  const { data: product, loading, error } = useFetch<Product>(`/products/${productId}`);

  if (loading) return <Loading message="Cargando detalles del producto..." />;
  if (error) return <Error message={error} />;
  if (!product) return <Error message="Producto no encontrado" />;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/3">
          <img 
            src={getProductImageUrl(product.idProducto)} 
            alt={product.nombre}
            className="w-full h-64 object-cover"
          />
        </div>
        <div className="p-6 md:w-2/3">
          <h1 className="text-2xl font-bold mb-2">{product.nombre}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Código de barras</p>
              <p className="font-medium">{product.codigoBarras}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Categoría</p>
              <p className="font-medium">{product.categoria?.descripcion || "No especificada"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Precio de venta</p>
              <p className="font-bold text-green-700">${product.precioVenta.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stock disponible</p>
              <p className="font-medium">{product.cantidadStock} unidades</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className={`font-medium ${product.estado ? "text-green-600" : "text-red-600"}`}>
                {product.estado ? "Activo" : "Inactivo"}
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button color="primary">Editar producto</Button>
            <Button color="danger">Eliminar producto</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
