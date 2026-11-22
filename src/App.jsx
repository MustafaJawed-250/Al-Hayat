import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import ManageMenu from './admin/ManageMenu';
import ManageCategories from './admin/ManageCategories';
import ManageOrders from './admin/ManageOrders';
import ManageGallery from './admin/ManageGallery';
import ManageMessages from './admin/ManageMessages';
import ManageMedia from './admin/ManageMedia';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && (
        <>
          <Navbar onCartOpen={() => setCartOpen(true)} />
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="menu" element={<ManageMenu />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="gallery" element={<ManageGallery />} />
          <Route path="messages" element={<ManageMessages />} />
          <Route path="media" element={<ManageMedia />} />
        </Route>
      </Routes>
      {!isAdmin && <Footer />}
    </>
  );
}
