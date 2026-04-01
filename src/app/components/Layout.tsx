import { Outlet, Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Search,
  Heart,
  MessageSquare,
  User,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Settings as SettingsIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useState } from 'react';

export function Layout() {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
                  Vendora
                </span>
              </Link>

              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Button variant="ghost" size="icon" asChild className="relative">
                    <Link to="/cart">
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500">
                          {cartCount}
                        </Badge>
                      )}
                    </Link>
                  </Button>

                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/wishlist">
                      <Heart className="w-5 h-5" />
                    </Link>
                  </Button>

                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/messages">
                      <MessageSquare className="w-5 h-5" />
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {user.role === 'seller' && (
                          <Badge className="mt-2" variant="secondary">
                            {user.verified ? 'Verified Seller' : 'Seller'}
                          </Badge>
                        )}
                      </div>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link to="/settings">
                          <SettingsIcon className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>

                      {user.role === 'seller' && (
                        <DropdownMenuItem asChild>
                          <Link to="/seller-dashboard">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Seller Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {user.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {user.role !== 'seller' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to="/become-seller">
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              Become a Seller
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Vendora</h3>
              <p className="text-gray-400 text-sm">
                The modern marketplace for buying and selling quality products.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/about" className="hover:text-white transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/become-seller" className="hover:text-white transition">
                    Become a Seller
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/contact" className="hover:text-white transition">
                    Help Center
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Safety Tips
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sell</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/become-seller" className="hover:text-white transition">
                    Start Selling
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Seller Resources
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Boost Your Listing
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 Vendora. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
