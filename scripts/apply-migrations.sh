#!/bin/bash
# Quick guide to apply Supabase migration

echo "🔍 Checking for Supabase CLI..."

if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    echo ""
    echo "📋 To apply the migration, use one of these options:"
    echo ""
    echo "Option 1: Supabase Dashboard (RECOMMENDED)"
    echo "  1. Go to https://app.supabase.com"
    echo "  2. Select your project"
    echo "  3. Navigate to SQL Editor"
    echo "  4. Click 'New Query'"
    echo "  5. Copy and paste the content from:"
    echo "     supabase/migrations/002_psychologists_seed.sql"
    echo "  6. Click 'Run'"
    echo ""
    echo "Option 2: Install Supabase CLI"
    echo "  macOS: brew install supabase/tap/supabase"
    echo "  Then run: supabase db push"
    echo ""
    echo "Option 3: Use psql directly"
    echo "  Get your connection string from Supabase Dashboard"
    echo "  Run: psql 'your-connection-string' -f supabase/migrations/002_psychologists_seed.sql"
    exit 1
fi

echo "✅ Supabase CLI found"
echo "🚀 Applying migrations..."
supabase db push
