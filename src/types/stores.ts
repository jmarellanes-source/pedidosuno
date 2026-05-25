// src/types/stores.ts
import type { Database } from './supabase'

export type Store        = Database['public']['Tables']['stores']['Row']
export type StoreInsert  = Database['public']['Tables']['stores']['Insert']
export type StoreUpdate  = Database['public']['Tables']['stores']['Update']
export type StoreMember  = Database['public']['Tables']['store_members']['Row']
export type AuditLog     = Database['public']['Tables']['audit_logs']['Row']
export type Profile      = Database['public']['Tables']['profiles']['Row']

/** Store con el conteo de productos (join) */
export type StoreWithCount = Store & {
  product_count: number
}

/** Miembro con datos del perfil */
export type MemberWithProfile = StoreMember & {
  profiles: Pick<Profile, 'full_name' | 'avatar_url' | 'phone'>
}

export type StoreRole = 'owner' | 'employee'

export type DaySchedule = {
  open: string   // "09:00"
  close: string  // "18:00"
  closed: boolean
}

export type WeekSchedule = {
  lun: DaySchedule
  mar: DaySchedule
  mie: DaySchedule
  jue: DaySchedule
  vie: DaySchedule
  sab: DaySchedule
  dom: DaySchedule
}

export const DEFAULT_SCHEDULE: WeekSchedule = {
  lun: { open: '09:00', close: '18:00', closed: false },
  mar: { open: '09:00', close: '18:00', closed: false },
  mie: { open: '09:00', close: '18:00', closed: false },
  jue: { open: '09:00', close: '18:00', closed: false },
  vie: { open: '09:00', close: '18:00', closed: false },
  sab: { open: '10:00', close: '14:00', closed: false },
  dom: { open: '10:00', close: '14:00', closed: true  },
}

export const DAY_LABELS: Record<keyof WeekSchedule, string> = {
  lun: 'Lunes',
  mar: 'Martes',
  mie: 'Miércoles',
  jue: 'Jueves',
  vie: 'Viernes',
  sab: 'Sábado',
  dom: 'Domingo',
}