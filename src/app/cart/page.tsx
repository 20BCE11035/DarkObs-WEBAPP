// Page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { cn, formatPrice } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { Check, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PRODUCT_CATEGORIES } from '@/config';

const Page = () => {
  const { items, removeItem } = useCart();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    wallet: string;
    orderId: string;
    amount: number;
  }>({ wallet: '', orderId: '', amount: 0 });

  const { data: orderStatus, refetch: refetchOrderStatus } = trpc.payment.pollOrderStatus.useQuery(
    { orderId: paymentDetails.orderId || '' },
    {
      enabled: !!paymentDetails.orderId,
      refetchInterval: paymentDetails.orderId ? 5000 : false,
    }
  );

  const { mutate: createStripeSession, isLoading: isStripeLoading } =
    trpc.payment.createSession.useMutation({
      onSuccess: ({ url }) => {
        if (url) router.push(url);
      },
      onError: (error) => {
        console.error('Stripe checkout error:', error);
      },
    });

  const { mutate: createBybitSession, isLoading: isBybitLoading } =
    trpc.payment.createBybitSession.useMutation({
      onSuccess: ({ wallet, orderId, amount }) => {
        setPaymentDetails({ wallet, orderId, amount });
        setShowPaymentDetails(true);
        startPolling(orderId);
      },
      onError: (error) => {
        console.error('Bybit checkout error:', error);
      },
    });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (orderStatus?.isPaid) {
      router.push(`/thank-you?orderId=${paymentDetails.orderId}`);
    }
  }, [orderStatus, paymentDetails.orderId, router]);

  const startPolling = (orderId: string) => {
    refetchOrderStatus();
  };

  const productIds = items.map(({ product }) => product.id);
  console.log('Product IDs being sent to backend:', productIds); // Log productIds

  const cartTotal = items.reduce((total, { product }) => total + product.price, 0);
  const fee = 1;
  const totalAmount = cartTotal + fee;

  return (
    <div className="bg-[#070A16]">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Shopping Cart</h1>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <div
            className={cn('lg:col-span-7', {
              'rounded-lg border-2 border-dashed border-zinc-200 p-12': isMounted && items.length === 0,
            })}
          >
            <h2 className="sr-only">Items in your shopping cart</h2>
            {isMounted && items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-1">
                <div aria-hidden="true" className="relative mb-4 h-40 w-40 text-muted-foreground">
                  <Image src="/raccoon-empty-cart.png" fill loading="eager" alt="empty shopping cart" />
                </div>
                <h3 className="font-semibold text-2xl">Your cart is empty</h3>
                <p className="text-muted-foreground text-center">Whoops! Nothing to show here yet.</p>
              </div>
            ) : null}
            <ul
              className={cn({
                'divide-y divide-gray-200 border-b border-t border-gray-200': isMounted && items.length > 0,
              })}
            >
              {isMounted &&
                items.map(({ product }) => {
                  const label = PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label;
                  const { image } = product.images[0];
                  return (
                    <li key={product.id} className="flex py-6 sm:py-10">
                      <div className="flex-shrink-0">
                        <div className="relative h-24 w-24">
                          {typeof image !== 'string' && image.url ? (
                            <Image
                              fill
                              src={image.url}
                              alt="product image"
                              className="h-full w-full rounded-md object-cover object-center sm:h-48 sm:w-48"
                            />
                          ) : null}
                        </div>
                      </div>
                      <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                          <div>
                            <div className="flex justify-between">
                              <h3 className="text-sm">
                                <Link
                                  href={`/product/${product.id}`}
                                  className="font-medium text-white hover:text-red-700"
                                >
                                  {product.name}
                                </Link>
                              </h3>
                            </div>
                            <div className="mt-1 flex text-sm">
                              <p className="text-muted-foreground">Category: {label}</p>
                            </div>
                            <p className="mt-1 text-sm font-medium text-white">{formatPrice(product.price)}</p>
                          </div>
                          <div className="mt-4 sm:mt-0 sm:pr-9 w-20">
                            <div className="absolute right-0 top-0">
                              <Button
                                aria-label="remove product"
                                onClick={() => removeItem(product.id)}
                                variant="ghost"
                              >
                                <X className="h-5 w-5" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <p className="mt-4 flex space-x-2 text-sm text-white">
                          <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                          <span>Eligible for instant delivery</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>

          <section className="mt-16 rounded-lg bg-[#0A0F22] border border-red-900/50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-white">Order Summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Subtotal</p>
                <p className="text-sm font-medium text-white">
                  {isMounted ? formatPrice(cartTotal) : <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200/20 pt-4">
                <div className="flex items-center text-sm text-gray-400">
                  <span>Flat Transaction Fee</span>
                </div>
                <div className="text-sm font-medium text-white">
                  {isMounted ? formatPrice(fee) : <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200/20 pt-4">
                <div className="text-base font-medium text-white">Order Total</div>
                <div className="text-base font-medium text-white">
                  {isMounted ? formatPrice(totalAmount) : <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <Button
                disabled={items.length === 0 || isStripeLoading}
                onClick={() => createStripeSession({ productIds })}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white flex items-center justify-center"
                size="lg"
              >
                {isStripeLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                Checkout with 
                <Image
                  src="/stripe-logo.svg"
                  alt="Stripe Logo"
                  width={70}
                  height={70}
                  className="mr-2"
                />
              </Button>
              <Button
                disabled={items.length === 0 || isBybitLoading}
                onClick={() => createBybitSession({ productIds })}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center"
                size="lg"
              >
                {isBybitLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                <span className="mr-1/2">Checkout with</span>
                <Image
                  src="/crypto-icon.svg"
                  alt="Crypto Icon"
                  width={40}
                  height={40}
                  className="ml-2"
                />
              </Button>
            </div>
            {showPaymentDetails && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-medium text-white">Send Payment</h3>
                <p className="text-sm text-gray-400 mt-2">
                  Please send <span className="font-bold text-white">{paymentDetails.amount} USDC</span> to the
                  following address:
                </p>
                <p className="text-sm text-white mt-1 break-all">{paymentDetails.wallet}</p>
                <div className="mt-4 flex justify-center">
                  <Image
                    src="/usdt-deposit-qr.jpg"
                    alt="USDT Deposit QR Code"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Order ID: <span className="text-white">{paymentDetails.orderId}</span>
                </p>
                <p className="text-sm text-gray-400 mt-2">Waiting for payment confirmation...</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Page;