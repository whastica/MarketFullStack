import { Link } from "react-router-dom";

interface ProductCardProps {
  product: {
    productId: number;
    name: string;
    price: number;
    stock: number;
  };
  onDelete: (productId: number) => void;
}

export const ProductCard = ({ product, onDelete }: ProductCardProps) => (
  <div className="bg-white rounded-lg shadow p-4 mb-4">
    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
    <p className="text-green-700 font-bold mb-2">${product.price.toFixed(2)}</p>
    <p className="text-sm mb-3">Stock: {product.stock} unidades</p>
    <div className="flex justify-between">
      <Link to={`/products/${product.productId}`} className="text-blue-600 hover:underline">
        Detalles
      </Link>
      <button 
        onClick={() => onDelete(product.productId)}
        className="text-red-600 hover:underline"
      >
        Eliminar
      </button>
    </div>
  </div>
);
