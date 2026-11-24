# Wanmart

Wanmart is a responsive online store and order-management app built with React, TypeScript, Vite, and Supabase. Customers can browse products, place orders, choose a delivery option, and pay with M-Pesa or (for courier orders) Cash on Delivery. Store staff use a protected admin area to manage products, delivery configuration, orders, and payment exceptions.

## Features

### Storefront

- Browse featured and new products, shop by category, search, and filter the catalog.
- View product details, variants, stock availability, and discounts.
- Add products and selected variants to a persistent shopping cart.
- Place an order as a guest with name, email, phone, and address details.
- Check order and payment status on the order confirmation page; retry an eligible failed M-Pesa payment.
- Subscribe to the newsletter.
- Read the store's About, Contact, Terms, and Privacy pages.

### Delivery and checkout

Checkout loads the active delivery configuration from Supabase. The two supported delivery codes are:

- **Courier:** the customer chooses a configured delivery area. The area's fee is added to the order total. Courier orders can use M-Pesa or Cash on Delivery.
- **Matatu:** the customer chooses a destination town and a SACCO route serving it. The route fee is added to the total. Matatu orders require M-Pesa; Cash on Delivery is disabled for this option.

Customers can include delivery notes. The order stores the chosen delivery label and fee, so later changes to fees or availability apply to new orders and do not rewrite existing orders.

Admins can manage delivery from **Admin → Delivery**:

- Add and edit courier areas, set fees in Kenyan shillings, and toggle areas on or off.
- Add and edit destination towns and SACCOs, then configure each town's active SACCO routes, fees, and optional notes.
- Rename the customer-facing Courier and Matatu method labels or disable either method at checkout. These are the two supported delivery methods; the admin screen does not create new method types.

On an order, admins can add dispatch references and notes for customers, mark orders shipped or delivered, and record whether a Cash on Delivery order was paid or delivery failed.

### Payments and order handling

- **M-Pesa:** checkout creates the order and requests a Daraja STK Push. The customer sees payment status updates while the app checks the order. A callback records provider results, and the reconciliation function can check unresolved payment requests.
- **Cash on Delivery:** available only for courier delivery. Admins record payment when delivery is completed; failed delivery can cancel the order and release reserved stock.
- Orders include an access token for the customer's order-status page, so customers do not need an account to view their order.
- Stock is reserved during the order flow and finalized when an order is fulfilled or paid, depending on the order state. Cancellation and failed-delivery flows release reservations.
- Admins can search and filter orders, inspect order and payment history, and handle cancellation and shipment actions.
- The payment review queue handles late or unmatched payments, fulfilment when stock permits, refund processing, and recording M-Pesa receipts or refund references.

### Administration

- **Product CRUD:** admins can create products, browse and open the product list, edit existing products, and delete products when allowed. Product forms manage categories, descriptions, pricing and discounts, stock, images, product-specific variants/details, featured status, and storefront visibility.
- Admin routes require an authenticated Supabase user who is a member of the `admins` table and has completed authenticator-app MFA (TOTP).
- MFA enrollment is prompted on an admin's first visit; later visits require an authenticator code. Inactive admin sessions are signed out.

## Technology and project layout

- React 19, TypeScript, and Vite
- React Router 7
- Tailwind CSS 4
- Supabase Auth, Postgres, RPCs, and Edge Functions
- Safaricom Daraja API for M-Pesa STK Push and payment status checks

The React app entry point is `src/App.tsx`. Storefront pages are in `src/pages/`, admin pages are in `src/pages/admin/`, shared UI is in `src/components/`, and the Supabase client is initialized in `src/lib/supabaseClient.ts`. Generated database types are in `src/types/supabase.ts`.

Supabase Edge Functions are in `supabase/functions/`:

| Function | Purpose |
| --- | --- |
| `mpesa-stk-push` | Starts a customer M-Pesa payment prompt for an order. |
| `mpesa-callback` | Receives and records Daraja payment callbacks. |
| `mpesa-reconcile` | Checks unresolved M-Pesa requests and updates their payment status. |
| `mpesa-token` | Requests a Daraja API access token. |

The functions currently use Safaricom's Daraja sandbox endpoint. Configure and verify the provider environment before using a live payment account.

## Local development

### Requirements

- Node.js and npm
- A Supabase project with the database schema, RPCs, policies, and admin records used by the app

This repository includes the Supabase function configuration and Edge Function code, but does not include database migration or seed SQL. The connected Supabase project must already have the app's tables and RPCs provisioned.

### Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create `.env.local` in the project root and add the browser-safe Supabase credentials:

   ```dotenv
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   Both values are required when the app starts. Never put the Supabase service-role key or M-Pesa credentials in `VITE_` variables or browser code.

3. Start the development server:

   ```sh
   npm run dev
   ```

### Supabase and M-Pesa configuration

- Configure the database tables and RPCs referenced by the client, including order creation, delivery configuration, product management, and admin operations.
- Create Supabase Auth users for admins and add their user IDs to the `admins` table. Admins must enroll an authenticator app when prompted.
- Deploy the Edge Functions in `supabase/functions/` to the connected project.
- Configure the functions' server-side secrets in Supabase. The M-Pesa functions use Daraja credentials such as `DARAJA_CONSUMER_KEY`, `DARAJA_CONSUMER_SECRET`, `MPESA_PASSKEY`, and `MPESA_SHORTCODE`. STK Push also needs `MPESA_CALLBACK_URL`; the callback uses `MPESA_CALLBACK_TOKEN`. Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the functions runtime.
- `mpesa-reconcile` is protected by `QUERY_ADMIN_SECRET`; call it only from a trusted scheduler or operator workflow, and keep that secret private.
- Point the Daraja callback URL to the deployed `mpesa-callback` function, including its configured callback token.

## Routes

| Path | Page |
| --- | --- |
| `/` | Home and featured products |
| `/shop` | Product catalog |
| `/search` | Search results |
| `/category/:slug` | Category products |
| `/product/:id` | Product details |
| `/cart` | Shopping cart |
| `/checkout` | Customer, delivery, and payment details |
| `/order-confirmation/:id` | Order and payment status |
| `/contact`, `/about`, `/terms`, `/privacy` | Store information and policies |
| `/admin/login` | Admin sign-in |
| `/admin` | Admin dashboard |
| `/admin/orders` | Search and manage orders |
| `/admin/products` | Manage products |
| `/admin/delivery` | Configure courier and Matatu delivery |
| `/admin/review` | Review payment exceptions and refunds |

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Run TypeScript project checks and create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |
