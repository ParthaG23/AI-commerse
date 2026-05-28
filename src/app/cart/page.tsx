'use client';

import { useCartStore } from '../store/cart';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import Link from 'next/link';
import MainLayout from '../components/MainLayout';
import { Trash2, Plus, Minus, ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity } = useCartStore();
  const router = useRouter();

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountRatio = 1.35; // mock markup
  const originalTotal = Math.floor(total * discountRatio);
  const totalSavings = originalTotal - total;

  return (
    <MainLayout>
      <div className="container mx-auto px-2 lg:px-4 py-4 text-slate-800 dark:text-white transition-colors duration-300">
        
        {/* Back navigation */}
        <Button variant="ghost" asChild className="mb-4 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white rounded-full transition-colors">
          <Link href="/shop">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
          </Link>
        </Button>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left column: Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              <Card className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-md overflow-hidden bg-white dark:bg-slate-900 text-slate-800 dark:text-white transition-colors duration-300">
                <CardHeader className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                  <CardTitle className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    My Cart ({items.length} items)
                  </CardTitle>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Deliver to: <span className="text-cyan-600 dark:text-cyan-400 font-black">India</span></span>
                </CardHeader>
                
                <CardContent className="divide-y divide-slate-100 dark:divide-slate-850 p-0 bg-white dark:bg-slate-900 transition-colors duration-300">
                  {items.map((item) => {
                    const originalItemPrice = Math.floor(item.price * discountRatio);
                    return (
                      <div key={item._id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 transition-colors duration-300">
                        
                        <div className="flex items-center space-x-4">
                          {/* Image Box */}
                          <div className="h-20 w-20 bg-white border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-center p-2 overflow-hidden flex-shrink-0 shadow-sm">
                            <img 
                              src={item.images[0] || 'https://via.placeholder.com/150'} 
                              alt={item.name} 
                              className="h-full object-contain"
                            />
                          </div>

                          {/* Item Details */}
                          <div>
                            <h3 className="font-bold text-slate-850 dark:text-slate-100 text-xs sm:text-sm leading-snug line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                              {item.name}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-[9px] bg-slate-50 dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 border border-slate-150 dark:border-slate-800 font-bold px-2 py-0.5 rounded">
                                {item.category}
                              </span>
                              <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 text-[8px] tracking-wider uppercase shadow-sm select-none leading-none">
                                Nuvix Verified<span>✔</span>
                              </div>
                            </div>
                            
                            {/* Pricing schema */}
                            <div className="mt-3 flex items-baseline space-x-2">
                              <span className="text-base font-black text-slate-900 dark:text-white">₹{item.price.toLocaleString('en-IN')}</span>
                              <span className="text-xs text-slate-400 dark:text-slate-550 line-through">₹{originalItemPrice.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-black font-black">25% Off</span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity controls and Action buttons */}
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-850">
                          <div className="flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-1.5 py-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full hover:text-slate-800 dark:hover:text-white transition-colors"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={12} />
                            </Button>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 select-none">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full hover:text-slate-800 dark:hover:text-white transition-colors"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              <Plus size={12} />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-650 dark:hover:text-red-400 rounded-full h-8 w-8 transition-colors"
                            onClick={() => removeFromCart(item._id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>

                      </div>
                    );
                  })}
                </CardContent>

                <CardFooter className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                  <Button 
                    asChild
                    className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black px-10 py-3 rounded-xl shadow-md border-none h-11 text-xs tracking-widest cursor-pointer active:scale-95 duration-150"
                  >
                    <Link href="/checkout">PLACE ORDER</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Right column: Branded Price Details receipt */}
            <div className="lg:col-span-4">
              <Card className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-md bg-white dark:bg-slate-900 overflow-hidden text-slate-850 dark:text-white transition-colors duration-300">
                <CardHeader className="py-3.5 px-6 border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950">
                  <CardTitle className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    PRICE DETAILS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 font-semibold text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Price ({items.length} items)</span>
                    <span>₹{originalTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">- ₹{totalSavings.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="text-cyan-600 dark:text-cyan-400 uppercase font-black">FREE</span>
                  </div>
                  
                  <Separator className="bg-slate-100 dark:bg-slate-850 my-2" />
                  
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white">
                    <span>Total Amount</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>

                  <Separator className="bg-slate-100 dark:bg-slate-850 my-2" />

                  {/* Savings banner */}
                  <div className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 font-bold text-center leading-snug">
                    You will save ₹{totalSavings.toLocaleString('en-IN')} on this order!
                  </div>

                  {/* Safe assurance footer */}
                  <div className="pt-2 flex items-center space-x-3.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold justify-center select-none">
                    <Shield size={16} className="text-slate-400 dark:text-slate-600" />
                    <span>Safe and Secure Payments. 100% Trust.</span>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        ) : (
          /* Empty Cart */
          <Card className="border border-slate-200 dark:border-slate-800 rounded-xl p-12 shadow-md text-center bg-white dark:bg-slate-900 max-w-xl mx-auto text-slate-800 dark:text-white transition-colors duration-300">
            <CardContent className="p-0 space-y-4">
              <div className="h-16 w-16 bg-slate-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-slate-150 dark:border-slate-850">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M15.32 2.405H4.887C3 2.405 2.405 3 2.405 4.887v10.432C2.405 17 3 17.595 4.887 17.595H15.32c1.887 0 2.482-.595 2.482-2.482V4.887c0-1.887-.595-2.482-2.482-2.482zm1.282 12.914c0 1.157-.348 1.482-1.282 1.482H4.887c-.934 0-1.282-.325-1.282-1.482V4.887c0-1.157.348-1.482 1.282-1.482H15.32c.934 0 1.282.325 1.282 1.482v10.432z" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Your cart is empty!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Add products to your cart by describing them to our AI assistant.</p>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg h-9.5 px-8 mt-2 border-none active:scale-95 duration-150 cursor-pointer shadow-md">
                <Link href="/shop">Shop Now</Link>
              </Button>
            </CardContent>
          </Card>
        )}
</div>
    </MainLayout>
  );
}
