#!/bin/bash
# DhanSathi - Supabase Setup Script
# Prerequisites: supabase CLI installed and authenticated

set -e

echo "🚀 Setting up Supabase for DhanSathi..."

# Check if supabase is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install with: npm install -g supabase"
    exit 1
fi

# Initialize Supabase project
if [ ! -d "supabase" ]; then
    echo "📋 Initializing Supabase..."
    supabase init
fi

# Link to existing project
echo "🔗 Linking to Supabase project..."
echo "Enter your Supabase project reference (from dashboard URL):"
read PROJECT_REF

supabase link --project-ref $PROJECT_REF

# Create database schema
echo "📊 Creating database schema..."

cat > supabase/migrations/001_initial_schema.sql << 'EOF'
-- Users table (extends Supabase auth.users)
create table if not exists public.profiles (
    id uuid references auth.users primary key,
    email text unique not null,
    full_name text,
    role text default 'user',
    created_at timestamptz default now()
);

-- Transactions table
create table if not exists public.transactions (
    id serial primary key,
    user_id uuid references auth.users not null,
    amount numeric(12,2) not null,
    type text not null check (type in ('income', 'expense')),
    category text not null,
    description text,
    date timestamptz not null default now(),
    created_at timestamptz default now()
);

-- Goals table
create table if not exists public.goals (
    id serial primary key,
    user_id uuid references auth.users not null,
    title text not null,
    target_amount numeric(12,2) not null,
    current_amount numeric(12,2) default 0,
    deadline date,
    category text,
    created_at timestamptz default now()
);

-- Holdings table
create table if not exists public.holdings (
    id serial primary key,
    user_id uuid references auth.users not null,
    symbol text not null,
    name text,
    quantity numeric(12,4) not null,
    avg_price numeric(12,2) not null,
    asset_type text not null check (asset_type in ('stock', 'mutual_fund', 'etf', 'crypto', 'other')),
    created_at timestamptz default now()
);

-- Chat messages table
create table if not exists public.chat_messages (
    id serial primary key,
    user_id uuid references auth.users not null,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.holdings enable row level security;
alter table public.chat_messages enable row level security;

-- RLS Policies
create policy "Users can view own profile" on public.profiles
    for select using (auth.uid() = id);

create policy "Users can view own transactions" on public.transactions
    for all using (auth.uid() = user_id);

create policy "Users can view own goals" on public.goals
    for all using (auth.uid() = user_id);

create policy "Users can view own holdings" on public.holdings
    for all using (auth.uid() = user_id);

create policy "Users can view own chat messages" on public.chat_messages
    for all using (auth.uid() = user_id);
EOF

# Push migrations
echo "📤 Pushing migrations..."
supabase db push

echo "✅ Supabase setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Get your Supabase URL and anon key from the dashboard"
echo "2. Update .env with:"
echo "   SUPABASE_URL=your-project-url"
echo "   SUPABASE_ANON_KEY=your-anon-key"
echo "3. Install supabase-py: pip install supabase"
