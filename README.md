# DhanSathi

AI-powered personal finance and savings discipline platform built with Next.js, Firebase, Gemini, and Algorand smart contracts.

## What Is DhanSathi?

DhanSathi helps users build better money habits by combining:

- On-chain savings goals on Algorand (locked, rule-based discipline)
- Off-chain INR savings goals (flexible deposits and withdrawals)
- AI financial coaching (Gemini + robust fallback logic)
- SMS and cash expense tracking with analytics insights
- UPI/Razorpay flow for adding funds to savings goals
- Progressive Web App experience for mobile-first usage

## Key Features

- Dual goal system:
   - On-chain Smart Contract Goals in ALGO
   - Off-chain Savings Goals in INR
- AI chatbot advisor:
   - Goal-aware answers using user context
   - Daily spending checks and progress guidance
   - Quota-aware messaging when Gemini daily limit is exhausted
- Expense intelligence:
   - SMS parsing and categorization
   - Manual cash entries
   - Spending insights and trend analytics
- Government scheme recommendations based on user profile
- Pera Wallet integration for Algorand Testnet transactions
- Firebase-backed auth and cloud persistence

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Radix UI
- AI: Genkit + Google Gemini (`googleai/gemini-2.5-flash`)
- Backend/API: Next.js Route Handlers
- Database/Auth/Storage: Firebase (Firestore, Auth, Storage)
- Blockchain: Algorand Testnet, algosdk, AlgoKit utilities
- Wallet: Pera Wallet Connect
- Payments: Razorpay
- Messaging: Twilio
- OCR: Tesseract.js (receipt flow)
- Deployment: Vercel

## Architecture Snapshot

1. Client app (Next.js) handles UI, auth state, and wallet interactions.
2. Firebase stores user goals, transaction metadata, and app data.
3. Algorand smart contracts enforce on-chain savings discipline.
4. AI flow (`src/ai/flows/ai-financial-advisor-flow.ts`) generates personalized guidance.
5. Route handlers in `src/app/api` provide SMS, receipt, payment, and goal APIs.

## Algorand Details

- Network: Algorand Testnet
- Wallet: Pera Wallet
- Testnet App ID in current setup: `755771019`
- Explorer: https://testnet.explorer.perawallet.app/application/755771019

Note: On-chain logic exists in both:

- AlgoKit workspace: `alogkit-contracts/`
- Legacy/reference contract flow: `contracts/` and `src/lib/blockchain.ts`

## Project Structure

```text
.
|- src/
|  |- app/                  # Next.js routes/pages and API handlers
|  |- ai/                   # Genkit setup and AI flows
|  |- components/           # UI and feature components
|  |- contexts/             # Auth/Wallet providers
|  |- hooks/                # Custom hooks
|  |- lib/                  # Firebase, blockchain, stores, helpers
|- contracts/               # Legacy smart-contract compile/deploy helpers
|- alogkit-contracts/       # AlgoKit contract workspace
|- public/                  # PWA assets and static files
```

## Local Development

### 1. Prerequisites

- Node.js 20+
- npm 10+
- Pera Wallet extension/app (set to Testnet)
- Optional for contract development:
   - Python 3.11+
   - Poetry
   - AlgoKit CLI

### 2. Clone and Install

```bash
git clone https://github.com/Aditya00038/DhanSathi.git
cd DhanSathi
npm install
```

### 3. Environment Variables

Create `.env.local` in the project root.

```env
# App
NEXT_PUBLIC_APP_ID=755771019

# Firebase (required)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# AI (at least one key recommended)
GOOGLE_GENAI_API_KEY=
GEMINI_API_KEY=
GOOGLE_API_KEY=

# Razorpay (required for payment routes)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Twilio (required for SMS routes)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### 4. Run the App

```bash
npm run dev
```

App runs on: `http://localhost:9002`

## Scripts

- `npm run dev` - Start local dev server on port 9002
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run lint checks
- `npm run typecheck` - TypeScript type checks
- `npm run genkit:dev` - Run Genkit development flow server
- `npm run genkit:watch` - Run Genkit in watch mode
- `npm run compile` - Compile contract artifacts via `contracts/compile.mjs`

## API Endpoints

- `POST /api/goal/*` - Goal operations
- `POST /api/razorpay` - Create Razorpay order
- `POST /api/send-sms` - Send SMS notifications via Twilio
- `POST /api/upload-receipt` - Upload receipt image and return base64 payload

## AI Assistant Behavior

The chatbot supports:

- Context-aware financial guidance using goals, spending, and deposits
- Follow-up understanding for goal-specific questions
- Smart fallback responses when model is unavailable
- Quota handling:
   - If Gemini daily quota is exhausted, users are informed to return tomorrow for best AI quality

## Smart Contract Flow

High-level on-chain user flow:

1. Connect Pera Wallet
2. Create an on-chain goal (`create_goal`)
3. Deposit ALGO (`deposit` with grouped payment + app call)
4. Withdraw once conditions are met (`withdraw`)

Contract interaction code: `src/lib/blockchain.ts`

## Deployment

### Vercel

1. Import the repository in Vercel.
2. Add all `.env.local` variables in Vercel project settings.
3. Deploy from `main` branch.

### Firebase/Algorand Notes

- Ensure Firestore rules are production-safe before public release.
- Confirm Algorand Testnet/Mainnet settings before launch.

## Current Limitations

- Pera Wallet focused flow (limited multi-wallet support)
- ALGO-centric on-chain path; broader asset support can be added
- SMS provider behavior may vary by region and sender constraints
- AI response quality depends on key availability and quota limits

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit with clear messages
4. Open a pull request

## License

Choose and add a license (for example MIT) if you plan public reuse.

## Acknowledgements

- Algorand and AlgoKit ecosystem
- Firebase and Google Genkit/Gemini
- Next.js and open-source React tooling community
