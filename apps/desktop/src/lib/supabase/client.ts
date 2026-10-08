import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const SUPABASE_URL = process.env['VITE_SUPABASE_URL'] || 'https://demo-cabinet-slimani.supabase.co'
const SUPABASE_ANON_KEY = process.env['VITE_SUPABASE_ANON_KEY'] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.demo'

/**
 * Client Supabase Desktop App via @supabase/supabase-js
 */
export function createClient() {
  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}
