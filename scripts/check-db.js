const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('Checking company_profiles...')
  const { data: profiles, error: pError } = await supabase.from('company_profiles').select('*')
  if (pError) console.error('Error fetching profiles:', pError)
  else console.log('Profiles:', profiles)

  console.log('Checking company_members...')
  const { data: members, error: mError } = await supabase.from('company_members').select('*')
  if (mError) console.error('Error fetching members:', mError)
  else console.log('Members:', members)
}

checkDatabase()
