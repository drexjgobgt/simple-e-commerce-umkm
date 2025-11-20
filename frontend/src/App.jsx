import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item._id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        />
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route
            path="/product/:id"
            element={<ProductDetail addToCart={addToCart} />}
          />
          <Route
            path="/checkout"
            element={
              <Checkout
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                clearCart={clearCart}
              />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
