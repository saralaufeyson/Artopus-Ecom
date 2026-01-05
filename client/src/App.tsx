import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext, type JSX } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext.tsx';
import { CartProvider } from './contexts/CartContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Shop from './pages/Shop.tsx';
import ProductDetails from './pages/ProductDetails.tsx';
import Cart from './pages/Cart.tsx';
import Checkout from './pages/Checkout.tsx';
import Success from './pages/Success.tsx';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ArtistProfile from './pages/ArtistProfile.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import NotFound from './pages/NotFound.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Loading Spinner Component
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-12 h-12 border-4 border-logo-purple/30 border-t-logo-purple rounded-full animate-spin"></div>
    <p className="text-gray-500 dark:text-gray-400 font-medium">Authenticating...</p>
  </div>
);

// Admin Route Guard Component
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useContext(AuthContext);
  
  if (auth?.loading) return <LoadingScreen />;
  
  // If not admin, redirect to home page
  if (auth?.user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Auth Required Route Guard Component
const AuthRequiredRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useContext(AuthContext);
  const location = useLocation();
  
  if (auth?.loading) return <LoadingScreen />;
  
  // If not logged in, redirect to login
  if (!auth?.user) {
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Guard to prevent admins from accessing shop/home etc
const PublicRouteGuard = ({ children }: { children: JSX.Element }) => {
  const auth = useContext(AuthContext);
  
  if (auth?.loading) return <LoadingScreen />;
  
  // If admin, redirect to admin panel
  if (auth?.user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={
                  <PublicRouteGuard>
                    <Home />
                  </PublicRouteGuard>
                } />
                <Route path="shop" element={
                  <PublicRouteGuard>
                    <Shop />
                  </PublicRouteGuard>
                } />
                <Route path="product/:id" element={
                  <PublicRouteGuard>
                    <ProductDetails />
                  </PublicRouteGuard>
                } />
                <Route path="artist/:id" element={
                  <PublicRouteGuard>
                    <ArtistProfile />
                  </PublicRouteGuard>
                } />
                <Route path="cart" element={
                  <PublicRouteGuard>
                    <Cart />
                  </PublicRouteGuard>
                } />
                <Route path="checkout" element={
                  <PublicRouteGuard>
                    <AuthRequiredRoute>
                      <Checkout />
                    </AuthRequiredRoute>
                  </PublicRouteGuard>
                } />
                <Route path="order-success/:orderId" element={
                  <AuthRequiredRoute>
                    <Success />
                  </AuthRequiredRoute>
                } />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="profile" element={
                  <AuthRequiredRoute>
                    <Profile />
                  </AuthRequiredRoute>
                } />
                
                {/* Protected Admin Route */}
                <Route 
                  path="admin" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <ToastContainer position="bottom-right" />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;