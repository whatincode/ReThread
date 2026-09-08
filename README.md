# ♻️ ReThread

> **Buy New. Trade Old. Wear Circular.**

ReThread is a circular-fashion web platform designed to make clothing
reuse simple, accessible, and engaging. Instead of treating clothing as
something that is bought once and discarded, ReThread connects **new
fashion, clothing take-back, upcycled products, and brand
participation** in one platform.

------------------------------------------------------------------------

## 🌿 What is ReThread?

ReThread brings the circular-fashion journey together:

**Shop → Wear → Trade Back → Reuse → ReThread**

Users can discover affordable products, submit clothes through the
take-back program, explore items created from returned clothing, manage
their account, and complete purchases through the platform.

Brands get their own portal to manage products, images, inventory, and
fulfillment.

------------------------------------------------------------------------

## ✨ Key Features

### 🛍️ Shop New

-   Browse the ReThread product catalog
-   View product details, sizes, colors, specifications, and reviews
-   Add products to the shopping bag
-   Sort and browse catalog items

### ♻️ Sell Your Clothes

-   Submit clothing through the ReThread take-back program
-   Upload required clothing photos
-   Provide information about the returned item
-   Support the reuse and circular lifecycle of clothing

### 🧵 ReThread Circle

A dedicated collection of products made from clothing that came back
through take-backs.

Users can: - Browse upcycled pieces - Filter by source/material - Sort
by price - View individual Circle pieces - Purchase eligible Circle
products

### 🏷️ Brand Portal

A dedicated dashboard for participating brands to: - Add products -
Manage product images - Manage stock - View products in their catalog -
Track orders and fulfillment - View fulfillment statistics

### 🔐 Authentication & Accounts

-   Sign up and sign in
-   Account management
-   Authenticated customer features
-   Demo account support for testing

### 💳 Checkout & Payments

-   Shopping bag and checkout flow
-   Order creation
-   Razorpay payment integration through Supabase Edge Functions
-   Payment verification

### ⭐ Reviews

Signed-in customers can write product reviews, with rating averages
handled through the backend.

------------------------------------------------------------------------

## 🧩 Technology Stack

  Layer                   Technology
  ----------------------- ---------------------------
  Frontend                HTML5, CSS3, JavaScript
  Styling                 Tailwind CSS + custom CSS
  Fonts                   Fraunces + Inter
  Backend / Database      Supabase
  Authentication          Supabase Auth
  Storage                 Supabase Storage
  Server-side functions   Supabase Edge Functions
  Payments                Razorpay
  Hosting                 GitHub Pages

------------------------------------------------------------------------

## 🗂️ Project Structure

``` text
ReThread/
│
├── index.html
├── base.css
├── script.js
├── auth-utils.js
├── cart-utils.js
├── supabaseClient.js
├── tailwind-config.js
│
├── pages/
│   ├── auth.html
│   ├── catalog.html
│   ├── product.html
│   ├── cart.html
│   ├── checkout.html
│   ├── account.html
│   ├── takeback.html
│   ├── circle.html
│   ├── circle-admin.html
│   └── brand-portal.html
│
├── supabase-migrations/
│   ├── 001_customers.sql
│   ├── 002_brand_portal.sql
│   ├── 003_orders.sql
│   ├── 004_seed_catalog.sql
│   ├── 005_takeback_upgrades.sql
│   ├── 006_demo_account.sql
│   ├── 007_circle_checkout_and_reviews.sql
│   ├── 008_order_fulfillment.sql
│   └── 009_circle_admin.sql
│
├── supabase/
│   └── functions/
│       ├── create-razorpay-order/
│       └── verify-razorpay-payment/
│
└── SETUP.md
```

------------------------------------------------------------------------

## 🚀 Getting Started

### 1. Clone the repository

``` bash
git clone https://github.com/whatincode/ReThread.git
cd ReThread
```

### 2. Open the project

This is a frontend-first web project, so the main entry point is:

``` text
index.html
```

For the complete Supabase configuration, database migrations,
authentication setup, demo account, and payment functions, see
**`SETUP.md`**.

### 3. Configure Supabase

The project uses Supabase for its application data and backend
functionality.

The SQL migrations in:

``` text
supabase-migrations/
```

should be executed in the required order in the Supabase SQL Editor.

### 4. Run locally

Because the project contains multiple HTML pages and backend-connected
JavaScript, running it through a local development server is
recommended.

For example:

``` bash
python -m http.server 5500
```

Then open:

``` text
http://localhost:5500
```

------------------------------------------------------------------------

## 🌐 Deployment

The frontend can be hosted using **GitHub Pages**.

Recommended repository structure:

``` text
ReThread/
├── index.html
├── base.css
├── script.js
├── pages/
└── ...
```

In GitHub:

**Settings → Pages → Deploy from a branch → `main` → `/ (root)`**

Supabase remains responsible for the application's database,
authentication, storage, and Edge Functions.

------------------------------------------------------------------------

## 🧪 Demo Account

For testing, the project setup includes a demo account:

``` text
Email:    demo@rethread.app
Password: Demo@1234
```

The account must exist and be configured in the Supabase project as
described in `SETUP.md`.

------------------------------------------------------------------------

## 🔄 Circular Fashion Flow

``` text
                 ┌──────────────┐
                 │    Browse    │
                 │  New Fashion │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │    Purchase  │
                 │   & Wear     │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   Take Back  │
                 │ Old Clothing │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ Reuse /      │
                 │ Upcycle      │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ ReThread     │
                 │    Circle    │
                 └──────┬───────┘
                        │
                        └──────► New Circular Products
```

------------------------------------------------------------------------

## 🎯 Project Goals

-   Encourage clothing reuse instead of disposal
-   Make circular fashion easier to access
-   Give returned clothing a second life
-   Connect customers with participating brands
-   Support product reuse and upcycling
-   Provide a simple digital experience for shopping and take-backs

------------------------------------------------------------------------

## 🔮 Future Scope

Possible future improvements include:

-   AI-powered clothing condition assessment
-   Personalized sustainable-fashion recommendations
-   Pickup and delivery tracking
-   Sustainability impact dashboards
-   Carbon and waste-saving estimates
-   More advanced brand analytics
-   Automated take-back valuation
-   Expanded upcycled-product marketplace

------------------------------------------------------------------------

## 📌 Project Status

**ReThread is a functional web project with:**

-   Product catalog
-   Product details
-   Shopping bag
-   Checkout flow
-   Authentication
-   Take-back workflow
-   ReThread Circle
-   Reviews
-   Brand Portal
-   Order & fulfillment tracking
-   Supabase backend integration
-   Razorpay payment functions

------------------------------------------------------------------------

## 💚 ReThread

**Buy New. Trade Old. Wear Circular.**

Built to explore how technology can support a more circular approach to
fashion.
