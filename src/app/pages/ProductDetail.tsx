import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { supabase, Product } from '../../lib/supabase';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Heart, MessageSquare, ArrowLeft, Flame, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { BoostDialog } from '../components/BoostDialog';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:users!products_seller_id_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data.seller?.verified) {
        toast.error('This product is not available');
        navigate('/');
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: id! });

      if (error) throw error;
      toast.success('Added to wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }

    toast.info('Payment integration will be available once you add your Paystack keys');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const now = new Date();
  const isBoosted =
    product.is_boosted &&
    product.boost_expiry &&
    new Date(product.boost_expiry) > now;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-96 object-contain"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
            {isBoosted && (
              <Badge className="absolute top-4 left-4 bg-orange-500">
                <Flame className="w-4 h-4 mr-1" />
                Boosted Listing
              </Badge>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'border-blue-900' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{product.category}</Badge>
            <span className="text-sm text-gray-500">
              Listed {new Date(product.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="text-4xl font-bold text-blue-900 mb-6">
            ₦{product.price.toLocaleString()}
          </div>

          <div className="flex gap-3 mb-6">
            <Button
              size="lg"
              className="flex-1 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600"
              onClick={handlePurchase}
            >
              Buy Now
            </Button>
            <Button size="lg" variant="outline" onClick={addToWishlist}>
              <Heart className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-2">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Seller Information</h2>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-blue-900 text-white">
                    {product.seller?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link
                    to={`/seller/${product.seller_id}`}
                    className="font-medium hover:text-blue-900 transition"
                  >
                    {product.seller?.name}
                  </Link>
                  {product.seller?.verified && (
                    <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                      Verified
                    </Badge>
                  )}
                  <p className="text-sm text-gray-500">
                    Member since {new Date(product.seller?.created_at || '').getFullYear()}
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/messages">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {user?.id === product.seller_id && (
            <Card className="mt-4">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">Boost This Listing</h2>
                <p className="text-gray-600 mb-4">
                  Increase visibility and get more buyers for your product
                </p>
                <BoostDialog productId={product.id} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
