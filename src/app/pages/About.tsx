import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Shield, Users, TrendingUp, Heart, Award, Globe } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Vendora</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            The modern marketplace connecting buyers and verified sellers across the nation
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded in 2026, Vendora was created with a simple mission: to make online
              buying and selling safe, simple, and accessible to everyone.
            </p>
            <p className="text-gray-600 mb-4">
              We believe that commerce should be built on trust. That's why we verify every
              seller and ensure every transaction is secure. Our platform brings together
              thousands of sellers offering millions of products, all in one place.
            </p>
            <p className="text-gray-600">
              Today, Vendora is Nigeria's fastest-growing marketplace, trusted by buyers
              and sellers across the country.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              To empower entrepreneurs and provide customers with a safe, reliable platform
              for buying and selling quality products.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-6">Our Values</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span><strong>Trust:</strong> Every seller is verified before going live</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span><strong>Safety:</strong> Secure payments and buyer protection</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span><strong>Quality:</strong> Only the best products make it to our platform</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span><strong>Innovation:</strong> Constantly improving the shopping experience</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-900" />
              </div>
              <h3 className="font-bold text-xl mb-2">100% Verified Sellers</h3>
              <p className="text-gray-600">
                Every seller is manually verified by our team before listing products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-xl mb-2">Trusted Community</h3>
              <p className="text-gray-600">
                Join thousands of happy buyers and successful sellers on Vendora
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">Fast Growing</h3>
              <p className="text-gray-600">
                Nigeria's fastest-growing marketplace with new products every day
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-12 text-center">
          <Heart className="w-16 h-16 text-orange-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Join the Vendora Family</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Whether you're a buyer looking for great deals or a seller ready to grow your
            business, Vendora is the place for you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-900 to-blue-700">
              <Link to="/">Start Shopping</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/become-seller">Become a Seller</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
