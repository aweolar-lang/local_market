# 🛒 LocalSoko & Affiliate Network

LocalSoko is a modern, real-time local e-commerce marketplace featuring a fully integrated, multi-tier Affiliate Marketing engine. It allows users to securely buy and sell items locally while empowering affiliates to earn commissions by expanding the platform's user base.

## ✨ Key Features

* **Real-Time Affiliate Engine:** Powered by Supabase WebSockets, user wallet balances and network stats update instantly without refreshing the page.
* **M-Pesa Integration:** Automated STK push integration via the Daraja API for instant account activations and fee processing.
* **Secure Admin HQ:** A highly protected admin dashboard to track gross revenue, pending withdrawals, ledger entries, and network growth.
* **Universal Bouncer Security:** Custom React hooks (`useUser`) ensure robust route protection, handling dead sessions, and instant kicking of deleted ghost accounts.
* **Ledger System:** Immutable transaction logging for every Ksh that enters or leaves the platform.

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS & Lucide React Icons
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Realtime)
* **Payments:** Safaricom M-Pesa Daraja API

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn
* A Supabase account and project
* A Safaricom Daraja Developer account

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/aweolar-lang/localsoko.git
cd localsoko
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following keys. **Do not commit this file to version control.**

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# M-Pesa Daraja API Credentials
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=your_paybill_or_till_number
\`\`\`

### 4. Run the development server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🗄️ Database Structure (Supabase)

To replicate this project, your Supabase PostgreSQL database requires the following core tables:
* `profiles`: Stores user data, wallet balances, referral codes, and admin/founder flags.
* `items`: The core e-commerce marketplace listings.
* `transactions`: The immutable ledger tracking all money movement.

*(Ensure Row Level Security (RLS) policies are configured so users can only update their own items, while admins have elevated read/write access).*

## 🔒 Security Notes

This application uses a strict custom hook (`hooks/useUser.ts`) to manage session states. If a user's database record is deleted or modified, the active session is instantly terminated via WebSocket listeners, preventing unauthorized ghost access.

---
*Built with ❤️ for the local economy.*