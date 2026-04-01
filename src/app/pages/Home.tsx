import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { supabase, Product, Category } from '../../lib/supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Heart, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', icon: '💻' },
  { id: '2', name: 'Fashion', slug: 'fashion', icon: '👗' },
  { id: '3', name: 'Home & Garden', slug: 'home-garden', icon: '🏠' },
  { id: '4', name: 'Sports', slug: 'sports', icon: '⚽' },
  { id: '5', name: 'Books', slug: 'books', icon: '📚' },
  { id: '6', name: 'Toys', slug: 'toys', icon: '🧸' },
  { id: '7', name: 'Automotive', slug: 'automotive', icon: '🚗' },
  { id: '8', name: 'Health & Beauty', slug: 'health-beauty', icon: '💄' },
];

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:users!products_seller_id_fkey(*)
        `)
        .eq('seller.verified', true)
        .order('is_boosted', { ascending: false })
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const search = searchParams.get('search');
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const now = new Date();
      const activeProducts = (data || []).map((product: any) => ({
        ...product,
        is_boosted:
          product.is_boosted &&
          product.boost_expiry &&
          new Date(product.boost_expiry) > now,
      }));

      setProducts(activeProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId });

      if (error) throw error;
      toast.success('Added to wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-12">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 md:p-12 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Vendora
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Discover quality products from verified sellers
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              Browse Products
            </Button>
            {user?.role === 'seller' && (
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white text-white hover:bg-white/20"
                asChild
              >
                <Link to="/seller-dashboard">Sell on Vendora</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <div className="flex overflow-x-auto gap-3 pb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-6 py-3 rounded-full transition ${
              selectedCategory === null
                ? 'bg-blue-900 text-white'
                : 'bg-white border hover:border-blue-900'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`flex-shrink-0 px-6 py-3 rounded-full transition ${
                selectedCategory === category.slug
                  ? 'bg-blue-900 text-white'
                  : 'bg-white border hover:border-blue-900'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {selectedCategory
              ? CATEGORIES.find((c) => c.slug === selectedCategory)?.name
              : 'All Products'}
          </h2>
          <div className="text-sm text-gray-500">{products.length} products</div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group hover:shadow-lg transition overflow-hidden"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    {product.is_boosted && (
                      <Badge className="absolute top-2 left-2 bg-orange-500">
                        <Flame className="w-3 h-3 mr-1" />
                        Boosted
                      </Badge>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-lg mb-1 hover:text-blue-900 transition line-clamp-1">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-900">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  <Link
                    to={`/seller/${product.seller_id}`}
                    className="text-sm text-gray-500 hover:text-blue-900 transition"
                  >
                    {product.seller?.name}
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => addToWishlist(product.id)}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
