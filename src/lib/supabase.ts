// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

console.log('Supabase URL:', supabaseUrl ? 'Configurada' : 'FALTA')
console.log('Supabase Key:', supabaseKey ? 'Configurada' : 'FALTA')

if (!supabaseUrl || !supabaseKey) {
  console.error('FALTAN LAS VARIABLES DE ENTORNO DE SUPABASE')
}

export const supabase = createClient(supabaseUrl, supabaseKey)