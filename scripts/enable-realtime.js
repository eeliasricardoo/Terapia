const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function enableRealtime() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('Enabling Realtime for notifications table...')

  const { error } = await supabase.rpc('enable_realtime_for_table', { table_name: 'notifications' })

  if (error) {
    console.log('RPC failed, trying raw SQL via execute...')
    // Fallback if RPC doesn't exist
    const { error: sqlError } = await supabase.from('_prisma_migrations').select('*').limit(1) // dummy check

    // We can't run raw SQL via supabase-js unless we have an RPC like 'exec_sql'.
    // Alternatively, I can run it via psql if I have it.
    console.error(
      'Could not enable realtime via RPC. Please ensure it is enabled in the dashboard.'
    )
  } else {
    console.log('Realtime enabled successfully!')
  }
}

enableRealtime()
