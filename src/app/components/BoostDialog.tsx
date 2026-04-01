import { useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { BOOST_PLANS } from '../../lib/supabase';
import { Flame } from 'lucide-react';
import { toast } from 'sonner';

interface BoostDialogProps {
  productId: string;
}

export function BoostDialog({ productId }: BoostDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(BOOST_PLANS[0].duration);
  const [loading, setLoading] = useState(false);

  const handleBoost = async () => {
    setLoading(true);

    try {
      const plan = BOOST_PLANS.find((p) => p.duration === selectedPlan);
      if (!plan) throw new Error('Invalid plan');

      const paystackPublicKey =
        import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'YOUR_PAYSTACK_PUBLIC_KEY';

      if (paystackPublicKey === 'YOUR_PAYSTACK_PUBLIC_KEY') {
        toast.error('Please configure your Paystack public key in environment variables');
        setLoading(false);
        return;
      }

      const PaystackPop = (window as any).PaystackPop;
      if (!PaystackPop) {
        toast.error('Paystack not loaded. Please refresh and try again.');
        setLoading(false);
        return;
      }

      const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: 'seller@vendora.com',
        amount: plan.price * 100,
        currency: 'NGN',
        ref: `boost_${productId}_${Date.now()}`,
        metadata: {
          product_id: productId,
          boost_duration: plan.duration,
        },
        callback: async (response: any) => {
          try {
            const expiryDate = new Date();
            if (plan.duration === '24h') {
              expiryDate.setHours(expiryDate.getHours() + 24);
            } else if (plan.duration === '3d') {
              expiryDate.setDate(expiryDate.getDate() + 3);
            } else if (plan.duration === '7d') {
              expiryDate.setDate(expiryDate.getDate() + 7);
            }

            toast.success('Boost activated successfully!');
            setOpen(false);
            window.location.reload();
          } catch (error) {
            console.error('Error activating boost:', error);
            toast.error('Payment successful but boost activation failed. Please contact support.');
          }
        },
        onClose: () => {
          setLoading(false);
          toast.info('Payment cancelled');
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error('Error initiating boost payment:', error);
      toast.error('Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
          <Flame className="w-4 h-4 mr-2" />
          Boost This Listing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Flame className="w-5 h-5 mr-2 text-orange-500" />
            Boost Your Listing
          </DialogTitle>
          <DialogDescription>
            Increase visibility and reach more buyers. Boosted listings appear at the top of search
            results.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
            {BOOST_PLANS.map((plan) => (
              <div
                key={plan.duration}
                className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-orange-500 transition"
              >
                <RadioGroupItem value={plan.duration} id={plan.duration} />
                <Label htmlFor={plan.duration} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{plan.label}</div>
                      <div className="text-sm text-gray-500">
                        Top placement for {plan.label.toLowerCase()}
                      </div>
                    </div>
                    <div className="text-lg font-bold">₦{plan.price.toLocaleString()}</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="bg-blue-50 p-4 rounded-lg text-sm">
            <p className="font-medium text-blue-900 mb-2">What you get:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Top placement in search results</li>
              <li>• "🔥 Boosted" badge on your listing</li>
              <li>• Featured in homepage carousel</li>
              <li>• Increased visibility and sales</li>
            </ul>
          </div>

          <Button
            onClick={handleBoost}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            {loading ? 'Processing...' : `Pay ₦${BOOST_PLANS.find((p) => p.duration === selectedPlan)?.price.toLocaleString()}`}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Secure payment powered by Paystack. 100% goes to platform.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
