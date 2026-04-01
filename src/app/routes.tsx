import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ProductDetail } from './pages/ProductDetail';
import { SellerDashboard } from './pages/SellerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SellerProfile } from './pages/SellerProfile';
import { Wishlist } from './pages/Wishlist';
import { Messages } from './pages/Messages';
import { Cart } from './pages/Cart';
import { Settings } from './pages/Settings';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { BecomeSeller } from './pages/BecomeSeller';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'login', Component: Login },
      { path: 'signup', Component: Signup },
      { path: 'product/:id', Component: ProductDetail },
      { path: 'seller/:id', Component: SellerProfile },
      { path: 'about', Component: About },
      { path: 'contact', Component: Contact },
      { path: 'become-seller', Component: BecomeSeller },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        ),
      },
      {
        path: 'messages',
        element: (
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'seller-dashboard',
        element: (
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      { path: '*', Component: NotFound },
    ],
  },
]);
