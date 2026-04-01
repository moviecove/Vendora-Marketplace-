import { useEffect, useState } from 'react';
import { supabase, User } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Users, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SellerWithStats extends User {
  product_count?: number;
}

export function AdminDashboard() {
  const [pendingSellers, setPendingSellers] = useState<SellerWithStats[]>([]);
  const [allSellers, setAllSellers] = useState<SellerWithStats[]>([]);
  const [stats, setStats] = useState({
    totalSellers: 0,
    pendingVerification: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: sellers, error: sellersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'seller')
        .order('created_at', { ascending: false });

      if (sellersError) throw sellersError;

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('seller_id');

      if (productsError) throw productsError;

      const productCounts = products?.reduce((acc: Record<string, number>, p: any) => {
        acc[p.seller_id] = (acc[p.seller_id] || 0) + 1;
        return acc;
      }, {});

      const sellersWithStats = (sellers || []).map((seller) => ({
        ...seller,
        product_count: productCounts?.[seller.id] || 0,
      }));

      setPendingSellers(sellersWithStats.filter((s) => !s.verified));
      setAllSellers(sellersWithStats);

      setStats({
        totalSellers: sellers?.length || 0,
        pendingVerification: sellers?.filter((s) => !s.verified).length || 0,
        totalProducts: products?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const verifySeller = async (sellerId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ verified: approve })
        .eq('id', sellerId);

      if (error) throw error;

      toast.success(approve ? 'Seller approved' : 'Seller rejected');
      fetchData();
    } catch (error) {
      console.error('Error verifying seller:', error);
      toast.error('Failed to update seller status');
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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500">Manage sellers and platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Sellers</p>
                <p className="text-3xl font-bold">{stats.totalSellers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-900" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending Verification</p>
                <p className="text-3xl font-bold">{stats.pendingVerification}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Products</p>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seller Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending Verification ({pendingSellers.length})
              </TabsTrigger>
              <TabsTrigger value="all">All Sellers ({allSellers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingSellers.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending verifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSellers.map((seller) => (
                    <div
                      key={seller.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-blue-900 text-white">
                          {seller.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h3 className="font-semibold">{seller.name}</h3>
                        <p className="text-sm text-gray-500">{seller.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {seller.product_count || 0} products
                          </Badge>
                          <span className="text-xs text-gray-400">
                            Joined {new Date(seller.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => verifySeller(seller.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifySeller(seller.id, false)}
                        >
                          <XCircle className="w-4 h-4 mr-1 text-red-500" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all">
              <div className="space-y-4">
                {allSellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-900 text-white">
                        {seller.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{seller.name}</h3>
                        {seller.verified ? (
                          <Badge className="bg-green-600">Verified</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{seller.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
                          {seller.product_count || 0} products
                        </Badge>
                        <span className="text-xs text-gray-400">
                          Joined {new Date(seller.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
