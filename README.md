# Wanmart
Wanmart is a responsive e-commerce and order-management application built with React and TypeScript. Customers can browse products, manage their shopping carts, and place orders using M-Pesa or Cash on Delivery.

The application also provides a protected administration dashboard where authorized staff can manage products and orders and review payment-related exceptions.

## Technology

- React 19, TypeScript, and Vite
- React Router for storefront and admin routes
- Tailwind CSS 4 for responsive styling
- Supabase for database access, authentication, and Edge Functions
- M-Pesa integration for payment initiation and reconciliation

## Application features

### Storefront

- Product catalog with categories, search, and product details
- Shopping cart and checkout
- M-Pesa and cash-on-delivery payment options
- Order confirmation and payment-status updates
- Newsletter signup

### Administration

- Protected admin routes with admin access checks and multi-factor authentication
- Product and order management
- Payment review queue for exceptions, including refund and receipt workflows
- Review-count indicators and idle-session sign-out

## Architecture

The React application is a Vite single-page app. `src/App.tsx` defines the routes, `src/components/` contains shared storefront UI, and `src/pages/admin/` contains the protected administration interface. Supabase client access is initialized in `src/lib/supabaseClient.ts`; generated database types live in `src/types/supabase.ts`.

The frontend uses Supabase RPCs for database operations. M-Pesa integration is handled by Supabase Edge Functions in `supabase/functions/`:

- `mpesa-stk-push` initiates a payment prompt
- `mpesa-callback` receives payment callbacks
- `mpesa-reconcile` reconciles payment status
- `mpesa-token` obtains an M-Pesa API token

## Local development

### Requirements

- Node.js and npm
- A Supabase project configured with the database schema and RPCs used by the app

### Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create `.env.local` in the project root and set the frontend Supabase credentials:

   ```dotenv
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   These values are required when the app initializes. Do not put service-role keys or M-Pesa secrets in frontend environment variables.

3. Start the development server:

   ```sh
   npm run dev
   ```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript project checks and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Supabase notes

The browser app uses the Supabase anon key; authorization is enforced through Supabase authentication, database policies, and server-side RPCs. The admin interface checks admin membership and MFA before granting access.

The M-Pesa Edge Functions require their server-side environment and provider configuration to be set in Supabase. Keep provider credentials and other secrets out of the client app and source control.
