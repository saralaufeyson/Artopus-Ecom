import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, type JSX } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext.tsx';
import { CartProvider } from './contexts/CartContext.tsx';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Shop from './pages/Shop.tsx';
import ProductDetails from './pages/ProductDetails.tsx';
import Cart from './pages/Cart.tsx';
import Checkout from './pages/Checkout.tsx';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Admin Route Guard Component
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useContext(AuthContext);
  
  // Wait if authentication is still loading (token exists but user doesn't yet)
  if (auth?.token && !auth.user) return <div className="p-20 text-center">Checking authorization...</div>;
  
  // If not admin, redirect to home page
  if (auth?.user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Protected Admin Route */}
              <Route 
                path="admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
            </Route>
          </Routes>
        </BrowserRouter>
        <ToastContainer position="bottom-right" />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;