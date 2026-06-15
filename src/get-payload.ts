// get-payload.ts
import dotenv from 'dotenv';
import path from 'path';
import type { InitOptions } from 'payload/config';
import payload, { Payload } from 'payload';
import nodemailer from 'nodemailer';

// Extend InitOptions to include serverURL
interface ExtendedInitOptions extends InitOptions {
  serverURL?: string;
}

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  secure: true,
  port: 465,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
});

let cached = (global as any).payload;

if (!cached) {
  cached = (global as any).payload = {
    client: null,
    promise: null,
  };
}

interface Args {
  initOptions?: Partial<ExtendedInitOptions>;
}

export const getPayloadClient = async ({
  initOptions,
}: Args = {}): Promise<Payload> => {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is missing');
  }

  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    // Normalize serverURL to ensure it’s just protocol + domain + port
    const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || `http://localhost:3000`;
    const baseURL = new URL(serverURL).origin; 

    cached.promise = payload.init({
      email: {
        transport: transporter,
        fromAddress: 'onboarding@resend.dev',
        fromName: 'DarkObs',
      },
      secret: process.env.PAYLOAD_SECRET,
      local: initOptions?.express ? false : true,
      serverURL: baseURL, // Explicitly set serverURL
      ...(initOptions || {}),
    } as ExtendedInitOptions); // Type assertion to include serverURL
  }

  try {
    cached.client = await cached.promise;
  } catch (e: unknown) {
    cached.promise = null;
    throw e;
  }

  return cached.client;
};