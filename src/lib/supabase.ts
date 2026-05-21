// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase' // Cuando generes los tipos automáticos

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Cliente tipado - autocompletado mágico en todo tu código
export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Tipo auxiliar para las respuestas
export type Tables = Database['public']['Tables']
export type Product = Tables['products']['Row']
export type Order = Tables['orders']['Row']