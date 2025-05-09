import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Supermarket Admin</div>
          <div className="space-x-4">
            <Link to="/" className="hover:text-green-200">Dashboard</Link>
            <Link to="/products" className="hover:text-green-200">Productos</Link>
            <Link to="/purchases" className="hover:text-green-200">Compras</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};