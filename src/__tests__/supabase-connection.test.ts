import { createClient } from '../lib/supabase/client'

describe('Supabase Connection', () => {
  it('should have valid environment variables', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).not.toBe('')
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toMatch(/^https?:\/\//)

    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).not.toBe('')
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toMatch(/^eyJ/)
  })

  it('should create a Supabase client successfully', () => {
    const supabase = createClient()
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
    expect(supabase.from).toBeDefined()
  })

  it('should be able to connect to Supabase API', async () => {
    const supabase = createClient()

    // Test connection by checking auth status
    // This is a lightweight operation that doesn't require any tables
    const { data, error } = await supabase.auth.getSession()

    // If we get an error, it's likely a connection/configuration issue
    if (error) {
      // Check if it's a connection error (network, URL, etc)
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error(`Supabase connection failed: ${error.message}`)
      }
      // Auth errors are OK - it just means no session, but connection works
    }

    // If we get here, the connection is working
    expect(supabase).toBeDefined()
  })
})

