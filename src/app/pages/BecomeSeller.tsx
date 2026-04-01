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
    fullName: user?.name || '',
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
      // Update user to seller role with automatic verification
      const { error } = await supabase
        .from('users')
        .update({
          role: 'seller',
          verified: true, // Auto-verify (no admin approval needed)
          name: formData.fullName,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Congratulations! You are now a seller on Vendora!');

      // Reload the page to update the user context
      window.location.href = '/seller-dashboard';
    } catch (error) {
      console.error('Error becoming seller:', error);
      toast.error('Failed to activate seller account. Please try again.');
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Store className="w-16 h-16 mx-auto mb-4 text-blue-900" />
            <h2 className="text-2xl font-bold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">
              Please login or create an account to become a seller
            </p>
            <div className="flex gap-4">
              <Button className="flex-1" asChild>
                <a href="/login">Login</a>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <a href="/signup">Sign Up</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role === 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You're Already a Seller!</h2>
            <p className="text-gray-600 mb-6">
              Start adding products and growing your business on Vendora
            </p>
            <Button className="w-full bg-gradient-to-r from-blue-900 to-blue-700" asChild>
              <a href="/seller-dashboard">Go to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Store className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Become a Seller</h1>
          <p className="text-xl text-blue-100">
            Join thousands of sellers on Vendora and grow your business
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-900" />
              </div>
              <h3 className="font-bold text-xl mb-2">Reach More Customers</h3>
              <p className="text-gray-600">
                Access thousands of active buyers looking for products like yours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-xl mb-2">Earn More Money</h3>
              <p className="text-gray-600">
                Keep 80% of every sale with fast payouts directly to your account
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">Secure & Trusted</h3>
              <p className="text-gray-600">
                Built-in payment protection and support from our dedicated team
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Seller Registration</CardTitle>
                <CardDescription>
                  Fill out this form to activate your seller account instantly
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
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+234 XXX XXX XXXX"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We'll use this to contact you about orders
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-blue-900">What happens next?</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <Check className="w-4 h-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                        Your seller account will be activated immediately
                      </li>
                      <li className="flex items-start">
                        <Check className="w-4 h-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                        You can start listing products right away
                      </li>
                      <li className="flex items-start">
                        <Check className="w-4 h-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                        You'll get access to your seller dashboard
                      </li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600"
                  >
                    {loading ? 'Activating...' : 'Become a Seller'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Register</h4>
                    <p className="text-sm text-gray-600">
                      Fill out the form with your details
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">List Products</h4>
                    <p className="text-sm text-gray-600">
                      Add your products with photos and descriptions
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Start Selling</h4>
                    <p className="text-sm text-gray-600">
                      Receive orders and get paid directly to your account
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seller Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">No upfront costs or monthly fees</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Keep 80% of every sale</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Boost listings for more visibility</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Built-in messaging with buyers</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Secure payment processing</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">24/7 seller support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
