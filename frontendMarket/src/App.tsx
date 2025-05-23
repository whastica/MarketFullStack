import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Container } from "./components/layout/Container";
import Dashboard from "./pages/Dashboard";
import ProductList from "./components/products/ProductList";
import ProductForm from "./components/products/ProductForm";
import ProductDetail from "./components/products/ProductDetail";
import PurchaseList from "./components/purchases/PurchaseList";
import PurchaseForm from "./components/purchases/PurchaseForm";
import PurchaseDetail from "./components/purchases/PurchaseDetail";

function App() {
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Container>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/purchases" element={<PurchaseList />} />
            console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
            <Route path="/purchases/new" element={<PurchaseForm />} />
            <Route path="/purchases/:id" element={<PurchaseDetail />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
