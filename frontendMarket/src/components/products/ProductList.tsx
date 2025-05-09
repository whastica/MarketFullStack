import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./../layout/Botton";  // Asegúrate de tener este componente
import {ProductCard} from "./ProductCard";  // Asegúrate de tener este componente
import type { Product } from "../../interfaces/Product";
import type { Category } from "../../interfaces/Category";
import { Loading } from "./Loading";
import clsx from "clsx";

const ProductList = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Simulamos los productos con las categorías relacionadas
  const mockCategories: Category[] = [
    { idCategoria: 1, descripcion: "Categoría 1", estado: true },
    { idCategoria: 2, descripcion: "Categoría 2", estado: true },
  ];

  const mockProducts: Product[] = [
    { 
      idProducto: 1, 
      nombre: "Producto 1", 
      idCategoria: 1,  // Relacionamos con la categoría 1
      codigoBarras: "123456", 
      precioVenta: 100, 
      cantidadStock: 10, 
      estado: true, 
      categoria: mockCategories[0]  // Incluimos la categoría completa si es necesario
    },
    { 
      idProducto: 2, 
      nombre: "Producto 2", 
      idCategoria: 2,  // Relacionamos con la categoría 2
      codigoBarras: "654321", 
      precioVenta: 200, 
      cantidadStock: 5, 
      estado: false, 
      categoria: mockCategories[1]  // Incluimos la categoría completa si es necesario
    },
  ];

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm("¿Estás seguro que deseas eliminar este producto?")) {
      try {
        const response = await fetch(`/products/delete/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("No se pudo eliminar el producto");

        window.location.reload(); // Reload para simplificar la actualización de la lista
      } catch (err) {
        console.error("Error eliminando producto:", err);
      }
    }
  };

  const loading = false;
  const error = "";

  if (loading) return <Loading message="Cargando productos..." />;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link to="/products/new">
          <Button color="secondary">Nuevo Producto</Button>
        </Link>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filtrar por categoría:
        </label>
        <select
          className="border rounded-md p-2 w-full max-w-xs"
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Todas las categorías</option>
          {mockCategories?.map((cat) => (
            <option key={cat.idCategoria} value={cat.idCategoria}>
              {cat.descripcion}
            </option>
          ))}
        </select>
      </div>

      <div className={clsx("grid gap-6", {
        "grid-cols-1": mockProducts && mockProducts.length <= 2,
        "grid-cols-2 md:grid-cols-3 lg:grid-cols-4": mockProducts && mockProducts.length > 2,
      })}>
        {mockProducts && mockProducts.length === 0 ? (
          <div className="col-span-full text-center py-10">No hay productos disponibles</div>
        ) : (
          mockProducts?.map((product) => (
            <ProductCard key={product.idProducto} product={product} onDelete={handleDeleteProduct} />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;