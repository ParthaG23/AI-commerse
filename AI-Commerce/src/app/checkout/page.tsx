'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import ContentLayout from '../components/ContentLayout';
import { useIsMounted } from '../hooks/useIsMounted';
import { Shield, Sparkles, CreditCard, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const isMounted = useIsMounted();

  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Stripe'); // or 'PayPal'
  const [error, setError] = useState('');

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    setError('');
    if (!user) {
      router.push('/login');
      return;
    }

    if (
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      setError('Please fill out all shipping address fields.');
      return;
    }

    const orderData = {
      orderItems: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.images.length > 0 ? item.images[0] : '/placeholder.jpg',
        price: item.price,
        product: item._id,
      })),
      shippingAddress,
      paymentMethod,
      totalPrice: total,
      user: user._id,
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      clearCart();
      router.push('/order'); // Redirect to order history page
    } else {
      const data = await response.json();
      setError(data.message || 'Failed to place order');
      console.error('Failed to place order:', data);
    }
  };

  if (!isMounted) {
    return (
      <ContentLayout>
        <div className="container mx-auto py-8 text-center text-slate-450 animate-pulse font-semibold">
          <p>Loading checkout matrix...</p>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="container mx-auto py-4 px-2 max-w-5xl text-slate-800 dark:text-white transition-colors duration-300">
        
        {/* Back navigation */}
        <Button variant="ghost" asChild className="mb-4 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors">
          <Link href="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
          </Link>
        </Button>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 font-bold text-xs tracking-wide shadow-sm" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Address Details & Payments */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Address Card */}
            <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-2xl shadow-md overflow-hidden transition-all duration-300">
              <CardHeader className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-850">
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-350 bg-white dark:bg-slate-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5" htmlFor="address">Street Address</label>
                    <Input
                      id="address"
                      placeholder="e.g. Infinity Tower A, DLF CyberCity"
                      className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 h-9.5 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-indigo-500 transition-colors duration-300"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5" htmlFor="city">City</label>
                    <Input
                      id="city"
                      placeholder="e.g. Gurugram"
                      className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 h-9.5 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-indigo-500 transition-colors duration-300"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5" htmlFor="postalCode">Postal Code</label>
                    <Input
                      id="postalCode"
                      placeholder="e.g. 122002"
                      className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 h-9.5 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-indigo-500 transition-colors duration-300"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5" htmlFor="country">Country</label>
                    <Input
                      id="country"
                      placeholder="e.g. India"
                      className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 h-9.5 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-indigo-500 transition-colors duration-300"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Card */}
            <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-2xl shadow-md overflow-hidden transition-all duration-300">
              <CardHeader className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-850">
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white dark:bg-slate-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Stripe Card Option */}
                  <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'Stripe' 
                      ? 'border-indigo-500 bg-indigo-50/15 dark:bg-indigo-950/20' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/50'
                  }`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stripe"
                        name="paymentMethod"
                        value="Stripe"
                        checked={paymentMethod === 'Stripe'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3 h-4 w-4 accent-indigo-650 cursor-pointer"
                      />
                      <div className="text-left select-none">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <CreditCard size={13} className="text-indigo-500" /> Stripe Checkout
                        </p>
                        <p className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">Secure Credit/Debit & UPI</p>
                      </div>
                    </div>
                  </label>

                  {/* PayPal Card Option */}
                  <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'PayPal' 
                      ? 'border-indigo-500 bg-indigo-50/15 dark:bg-indigo-950/20' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/50'
                  }`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="paypal"
                        name="paymentMethod"
                        value="PayPal"
                        checked={paymentMethod === 'PayPal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3 h-4 w-4 accent-indigo-650 cursor-pointer"
                      />
                      <div className="text-left select-none">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <ShoppingBag size={13} className="text-indigo-500" /> PayPal Express
                        </p>
                        <p className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">Direct international checkout</p>
                      </div>
                    </div>
                  </label>

                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Side: Order Summary receipt */}
          <div className="lg:col-span-4">
            
            <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-2xl shadow-md overflow-hidden transition-all duration-300">
              <CardHeader className="bg-slate-50 dark:bg-slate-950 px-6 py-3.5 border-b border-slate-100 dark:border-slate-850">
                <CardTitle className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900">
                
                {/* Items listings */}
                <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-850 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                  {items.map((item, idx) => (
                    <div key={item._id} className={`flex justify-between items-center ${idx === 0 ? '' : 'pt-2.5'}`}>
                      <span className="line-clamp-1 pr-4 text-slate-700 dark:text-slate-300">{item.name} <span className="text-indigo-650 dark:text-indigo-400 font-bold ml-1">x{item.quantity}</span></span>
                      <span className="font-extrabold text-slate-900 dark:text-white flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex justify-between font-black text-sm text-slate-900 dark:text-white items-baseline">
                  <span>Grand Total</span>
                  <span className="text-lg">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 font-bold text-center leading-snug flex items-center justify-center gap-1.5">
                  <Sparkles size={14} className="text-cyan-600 dark:text-cyan-400 animate-pulse" />
                  <span>Free Nuvix Verified Delivery Eligible</span>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black h-11 text-xs rounded-xl shadow-lg border-none tracking-widest uppercase cursor-pointer active:scale-95 duration-150" 
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>

                {/* Safe assurance */}
                <div className="pt-2 flex items-center space-x-3.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold justify-center select-none">
                  <Shield size={16} className="text-slate-400 dark:text-slate-600" />
                  <span>Safe and Secure Payments. 100% Trust.</span>
                </div>

              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </ContentLayout>
  );
}

