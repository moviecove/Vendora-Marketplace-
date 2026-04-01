import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { supabase, Product } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product: Product;
}

export function Wishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          product:products(
            *,
            seller:users!products_seller_id_fkey(*)
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id: string) => {
    try {
      const { error } = await supabase.from('wishlist').delete().eq('id', id);

      if (error) throw error;
      toast.success('Removed from wishlist');
      fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Heart className="w-8 h-8 mr-3 text-red-500" />
          My Wishlist
        </h1>
        <p className="text-gray-500 mt-2">{items.length} items saved</p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">
              Save items you love to buy them later
            </p>
            <Button asChild className="bg-gradient-to-r from-blue-900 to-blue-700">
              <Link to="/">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition">
              <Link to={`/product/${item.product_id}`}>
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {item.product.images && item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="w-12 h-12" />
                    </div>
                  )}
                </div>
              </Link>
              <CardContent className="p-4">
                <Link to={`/product/${item.product_id}`}>
                  <h3 className="font-semibold text-lg mb-1 hover:text-blue-900 transition line-clamp-1">
                    {item.product.title}
                  </h3>
                </Link>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                  {item.product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-900">
                    ₦{item.product.price.toLocaleString()}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromWishlist(item.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
