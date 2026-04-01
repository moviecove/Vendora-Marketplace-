import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { supabase, User, Product } from '../../lib/supabase';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { MapPin, Calendar, Package, MessageSquare, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerProfile();
  }, [id]);

  const fetchSellerProfile = async () => {
    try {
      const { data: sellerData, error: sellerError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('verified', true)
        .single();

      if (sellerError) throw sellerError;

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      setSeller(sellerData);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      toast.error('Failed to load seller profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Seller not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-blue-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </Link>

      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-blue-900 text-white text-3xl">
                {seller.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{seller.name}</h1>
                {seller.verified && (
                  <Badge className="bg-green-600">Verified Seller</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {new Date(seller.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  {products.length} products
                </div>
              </div>

              <Button asChild className="bg-gradient-to-r from-blue-900 to-blue-700">
                <Link to="/messages">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Seller
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-2xl font-bold">Products from {seller.name}</h2>
        <p className="text-gray-500">{products.length} listings</p>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No products listed yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition">
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
                      <Package className="w-12 h-12" />
                    </div>
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
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
