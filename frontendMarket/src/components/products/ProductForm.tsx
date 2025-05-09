import { useState } from "react";
import useProduct from "../../hooks/useProduct";
import type { Product } from "../../interfaces/Product";
import Button from "../layout/Botton";
import {Error} from "../products/Error";
import { Loading } from "../products/Loading";

const ProductForm = () => {
  const [product, setProduct] = useState<Partial<Product>>({
    nombre: "",
    idCategoria: 0,
    codigoBarras: "",
    precioVenta: 0,
    cantidadStock: 0,
    estado: true,
  });

  const { saveProduct, loading, error } = useProduct();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProduct({
      ...product,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProduct(product);
    setProduct({
      nombre: "",
      idCategoria: 0,
      codigoBarras: "",
      precioVenta: 0,
      cantidadStock: 0,
      estado: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      <h2 className="text-xl font-bold mb-4">Registrar Producto</h2>

      {loading && <Loading message="Guardando producto..." />}
      {error && <Error message={error} />}

      <div className="space-y-2">
        <label className="block text-sm font-medium">Nombre del producto</label>
        <input
          type="text"
          name="nombre"
          value={product.nombre}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          placeholder="Ingrese el nombre"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Precio de venta</label>
        <input
          type="number"
          name="precioVenta"
          value={product.precioVenta}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          placeholder="Ingrese el precio"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" color="primary" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Producto"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;