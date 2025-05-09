import { Link } from "react-router-dom";
import type { Product } from "../../interfaces/Product";
import { getProductImageUrl } from "../../utils/imageHelpers";

interface ProductCardProps {
  product: Product;
  onDelete: (productId: number) => void;
}

interface ProductCardProps {
  product: Product;
  onDelete: (productId: number) => void;
}

export const ProductCard = ({ product, onDelete }: ProductCardProps) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <img 
      src={getProductImageUrl(product.idProducto)} 
      alt={product.nombre}
      className="w-full h-48 object-cover"
    />
    <div className="p-4">
      <h3 className="font-bold text-lg mb-1">{product.nombre}</h3>
      <p className="text-gray-600 text-sm mb-1">Código: {product.codigoBarras}</p>
      <p className="text-green-700 font-bold mb-2">${product.precioVenta.toFixed(2)}</p>
      <p className="text-sm mb-3">Stock: {product.cantidadStock} unidades</p>
      <div className="flex justify-between">
        <Link to={`/products/${product.idProducto}`} className="text-blue-600 hover:underline">
          Detalles
        </Link>
        <button 
          onClick={() => onDelete(product.idProducto)}
          className="text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
);