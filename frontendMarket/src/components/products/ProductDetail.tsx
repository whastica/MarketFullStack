import { useParams } from "react-router-dom";
import {useFetch} from "../../hooks/useFetch";
import type { Product } from "../../interfaces/Product";
import { Loading } from "../products/Loading";
import { Error } from "../products/Error";
import Button from "../layout/Botton";

const ProductDetail = () => {
  const { id: productId } = useParams<{ id: string }>();
  const { data: product, loading, error } = useFetch<Product>(`/products/${productId}`);

  if (loading) return <Loading message="Cargando detalles del producto..." />;
  if (error) return <Error message={error} />;
  if (!product) return <Error message="Producto no encontrado" />;

  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Categoría</p>
            <p className="font-medium">{product.category?.category || "No especificada"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Precio</p>
            <p className="font-bold text-green-700">${product.price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Stock disponible</p>
            <p className="font-medium">{product.stock} unidades</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Estado</p>
            <p className={`font-medium ${product.active ? "text-green-600" : "text-red-600"}`}>
              {product.active ? "Activo" : "Inactivo"}
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Button color="primary">Editar producto</Button>
          <Button color="danger">Eliminar producto</Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
