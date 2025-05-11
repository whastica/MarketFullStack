import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./../layout/Botton";
import { ProductCard } from "./ProductCard";
import type { Product } from "../../interfaces/Product";
import type { Category } from "../../interfaces/Category";
import { Loading } from "./Loading";
import clsx from "clsx";

const ProductList = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const mockCategories: Category[] = [
    { categoryId: 1, category: "Categoría 1", active: true },
    { categoryId: 2, category: "Categoría 2", active: true },
  ];

  const mockProducts: Product[] = [
    { 
      productId: 1, 
      name: "Producto 1", 
      categoryId: 1,  
      price: 100, 
      stock: 10, 
      active: true, 
      category: mockCategories[0]
    },
    { 
      productId: 2, 
      name: "Producto 2", 
      categoryId: 2,  
      price: 200, 
      stock: 5, 
      active: false, 
      category: mockCategories[1]
    },
  ];

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm("¿Estás seguro que deseas eliminar este producto?")) {
      try {
        const response = await fetch(`/products/delete/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("No se pudo eliminar el producto");

        window.location.reload();
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
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.category}
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
            <ProductCard key={product.productId} product={product} onDelete={handleDeleteProduct} />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
