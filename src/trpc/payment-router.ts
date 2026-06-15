import { z } from 'zod';
import { privateProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { getPayloadClient } from '../get-payload';
import { stripe } from '../lib/stripe';
import type Stripe from 'stripe';
import axios, { AxiosError } from 'axios';
import crypto from 'crypto';

const BYBIT_API_KEY = process.env.BYBIT_API_KEY || '';
const BYBIT_SECRET_KEY = process.env.BYBIT_SECRET_KEY || '';
const BYBIT_API_URL = 'https://api.bybit.com/v5/asset/deposit/query-record';
const BYBIT_WALLET_ADDRESS = process.env.BYBIT_WALLET_ADDRESS || '';

const generateBybitSignature = (params: Record<string, string>) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHmac('sha256', BYBIT_SECRET_KEY).update(sortedParams).digest('hex');
};

const checkBybitPayment = async (orderAmount: number) => {
  const timestamp = Date.now().toString();
  const params = {
    api_key: BYBIT_API_KEY,
    coin: 'USDC',
    timestamp,
  };
  const signature = generateBybitSignature(params);
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  try {
    console.log('Making Bybit API request with query:', queryString);
    const response = await axios.get(`${BYBIT_API_URL}?${queryString}&sign=${signature}`);
    console.log('Bybit API Response:', response.data);

    if (!response.data.result || !Array.isArray(response.data.result.rows)) {
      console.error('Bybit API Error: Invalid response structure', response.data);
      return false;
    }

    const deposits = response.data.result.rows;
    return deposits.some((d: any) => 
      parseFloat(d.amount) === orderAmount && 
      d.status === 'SUCCESS' && 
      d.address === BYBIT_WALLET_ADDRESS
    );
  } catch (err) {
    const error = err as AxiosError;
    console.error('Bybit API Error:', error.response?.data || error.message || 'Unknown error');
    return false;
  }
};

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { productIds } = input;

      console.log('Input productIds (Stripe):', productIds);

      if (productIds.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No product IDs provided' });
      }

      const payload = await getPayloadClient();
      const { docs: products } = await payload.find({
        collection: 'products',
        where: { id: { in: productIds } },
      });

      console.log('Found Products (Stripe):', products);

      // Log if any product IDs were not found
      const foundProductIds = products.map((prod) => prod.id);
      const missingProductIds = productIds.filter((id) => !foundProductIds.includes(id));
      if (missingProductIds.length > 0) {
        console.error('These product IDs were not found in the database:', missingProductIds);
      }

      const filteredProducts = products.filter((prod) => Boolean(prod.priceId));
      console.log('Filtered Products (Stripe):', filteredProducts);

      if (filteredProducts.length === 0) {
        console.error('No products with valid priceId found');
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No products with valid priceId found' });
      }

      const order = await payload.create({
        collection: 'orders',
        data: {
          _isPaid: false,
          products: filteredProducts.map((prod) => prod.id),
          user: user.id,
        },
      });

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = filteredProducts.map((product) => ({
        price: product.priceId!,
        quantity: 1,
      }));

      // Add a $1 fee
      const feePriceId = 'price_1R5FZe4dSX7KWK5PFeZxM8dY'; // Your actual fee Price ID
      line_items.push({
        price: feePriceId,
        quantity: 1,
        adjustable_quantity: { enabled: false },
      });

      console.log('Stripe line_items:', line_items);

      // Fetch and log the Price objects to verify amounts
      try {
        const priceDetails = await Promise.all(
          line_items.map(async (item) => {
            if (!item.price) {
              throw new Error(`Price ID is undefined for line item: ${JSON.stringify(item)}`);
            }
            const price = await stripe.prices.retrieve(item.price);
            return {
              priceId: item.price,
              amount: price.unit_amount,
              currency: price.currency,
            };
          })
        );
        console.log('Fetched Price Details:', priceDetails);

        // Check if any price has an amount of 0
        const zeroAmountPrices = priceDetails.filter((price) => price.amount === 0);
        if (zeroAmountPrices.length > 0) {
          console.error('Some prices have an amount of 0:', zeroAmountPrices);
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'One or more prices have an amount of 0. Please update the prices in Stripe.',
          });
        }
      } catch (err) {
        console.error('Error fetching price details from Stripe:', err);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to verify prices' });
      }

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          payment_method_types: ['card'],
          mode: 'payment',
          metadata: { userId: user.id, orderId: order.id },
          line_items,
        });

        console.log('Stripe Checkout Session Created:', {
          sessionId: stripeSession.id,
          amount_total: stripeSession.amount_total,
          currency: stripeSession.currency,
          line_items: stripeSession.line_items?.data.map((item) => ({
            priceId: item.price?.id,
            amount: item.amount_total,
            quantity: item.quantity,
          })),
        });

        return { url: stripeSession.url };
      } catch (err) {
        console.error('Stripe Checkout Error:', err);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create Stripe session' });
      }
    }),

  createBybitSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { productIds } = input;

      console.log('Input productIds (Bybit):', productIds);

      if (productIds.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No product IDs provided' });
      }

      const payload = await getPayloadClient();
      const { docs: products } = await payload.find({
        collection: 'products',
        where: { id: { in: productIds } },
      });

      console.log('Found Products (Bybit):', products);

      // Log if any product IDs were not found
      const foundProductIds = products.map((prod) => prod.id);
      const missingProductIds = productIds.filter((id) => !foundProductIds.includes(id));
      if (missingProductIds.length > 0) {
        console.error('These product IDs were not found in the database:', missingProductIds);
      }

      const filteredProducts = products.filter((prod) => Boolean(prod.priceId));
      console.log('Filtered Products (Bybit):', filteredProducts);

      if (filteredProducts.length === 0) {
        console.error('No products with valid priceId found');
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No products with valid priceId found' });
      }

      const totalAmount = filteredProducts.reduce((sum, prod) => sum + (prod.price || 0), 0) + 1; // Add $1 fee

      const order = await payload.create({
        collection: 'orders',
        data: {
          _isPaid: false,
          products: filteredProducts.map((prod) => prod.id),
          user: user.id,
        },
      });

      return {
        wallet: BYBIT_WALLET_ADDRESS,
        orderId: order.id,
        amount: totalAmount,
      };
    }),

  pollOrderStatus: privateProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const { orderId } = input;
      const payload = await getPayloadClient();

      const { docs: orders } = await payload.find({
        collection: 'orders',
        where: { id: { equals: orderId } },
      });

      if (!orders.length) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
      }

      const [order] = orders;
      const totalAmount = order.products.reduce((sum: number, prod: any) => sum + (prod.price || 0), 0) + 1; // Add $1 fee
      const isPaidOnBybit = await checkBybitPayment(totalAmount);

      if (isPaidOnBybit && !order._isPaid) {
        await payload.update({
          collection: 'orders',
          data: { _isPaid: true },
          where: { id: { equals: orderId } },
        });
      }

      return { isPaid: order._isPaid || isPaidOnBybit };
    }),
});

export default paymentRouter;