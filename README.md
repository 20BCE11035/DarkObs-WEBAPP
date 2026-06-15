
# DarkObs - A Modern Fullstack E-Commerce Marketplace for Digital Products

Built with **Next.js 15 App Router**, **tRPC**, **TypeScript**, **Payload**, and **Tailwind CSS**

![thumbnail](https://github.com/user-attachments/assets/81011db6-1029-43c1-b8d2-43e56e85b09d)

---

## 🚀 Features

* 🛠️ Complete marketplace built from scratch in Next.js 15
* 💻 Beautiful landing page & product pages
* 🎨 Custom artwork included
* 💳 Full-featured admin dashboard
* 🛍️ Users can purchase and sell their own digital products
* 🛒 Locally persisted shopping cart
* 🔑 Authentication via Payload
* 🌍 Learn how to self-host Next.js apps
* 🌟 Modern UI built with [shadcn/ui](https://ui.shadcn.com/)
* ✉️ Beautiful transactional emails (signup, purchase confirmations, etc.)
* ✅ Admins can verify product quality
* ⌨️ 100% TypeScript codebase
* 🎁 ...and much more!

---

## 🛠️ Getting Started

To get started with the project:

```bash
git clone https://github.com/YosefElsersy/DarkObs.git
cd DarkObs
```

Copy the example environment file and create your own:

```bash
cp .env.example .env
```

Then fill in your `.env` file with the following required environment variables:

```env
# MongoDB connection string
MONGODB_URL=

# Stripe credentials
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Payload secret
PAYLOAD_SECRET=

# Resend API Key for transactional emails
RESEND_API_KEY=

# Bybit API credentials
BYBIT_API_KEY=
BYBIT_SECRET_KEY=
BYBIT_WALLET_ADDRESS=
BYBIT_TESTNET_WALLET_ADDRESS=

# App base URL
NEXT_PUBLIC_SERVER_URL=

# Port to run the server (optional, default is 3000)
PORT=3000
```

> 🔐 **Note:** Do not share or commit your `.env` file. Keep all secret keys private and secure.

---

## 🙏 Acknowledgements

* Huge thanks to [Payload](https://link.joshtriedcoding.com/payload) for powering the backend.

---

## 📄 License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).

---

