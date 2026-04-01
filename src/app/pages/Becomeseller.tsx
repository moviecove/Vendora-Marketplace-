import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Check, Store, TrendingUp, Shield, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export function BecomeSeller() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    if (user.role === 'seller') {
      toast.info('You are already a seller!');
      navigate('/seller-dashboard');
      return;
    }

    setLoading(true);

    try {
      // ✅ UPDATE ROLE IN PROFILES TABLE
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'seller' })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('🎉 You are now a seller!');

      // 🔥 Force refresh auth state
      window.location.href = '/seller-dashboard';

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to become seller');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  // 🔒 Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Store className="w-16 h-16 mx-auto mb-4 text-blue-900" />
            <h2 className="text-2xl font-bold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">
              Please login or create an account
            </p>
            <div className="flex gap-4">
              <Button className="flex-1" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Already seller
  if (user.role === 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <Check className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">You're Already a Seller</h2>
            <Button onClick={() => navigate('/seller-dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Main Page
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">

        <Card>
          <CardHeader>
            <CardTitle>Become a Seller</CardTitle>
            <CardDescription>
              Start selling on Vendora instantly
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Become Seller'}
              </Button>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
    }
