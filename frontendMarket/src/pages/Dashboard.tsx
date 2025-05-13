import { useState, useEffect } from "react";
import StatCard from "../pages/StatCard";
import { API_BASE_URL } from "../api/apiConfig";

function Dashboard() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [purchaseCount, setPurchaseCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [productsRes, purchasesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products/all`),
          fetch(`${API_BASE_URL}/purchases/all`),
        ]);

        if (!productsRes.ok || !purchasesRes.ok) {
          throw new Error("Error al obtener los datos");
        }

        const productsData = await productsRes.json();
        const purchasesData = await purchasesRes.json();

        setProductCount(productsData.length);
        setPurchaseCount(purchasesData.length);
      } catch (err) {
        console.error("Error con la informacion:", err);
        setError("No se pudo cargar la información");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {loading && <p>Cargando datos...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Productos"
          count={productCount ?? 0}
          linkTo="/products"
          linkLabel="Ver todos los productos"
        />
        <StatCard
          title="Compras"
          count={purchaseCount ?? 0}
          linkTo="/purchases"
          linkLabel="Ver todas las compras"
        />
      </div>
    </div>
  );
}

export default Dashboard;