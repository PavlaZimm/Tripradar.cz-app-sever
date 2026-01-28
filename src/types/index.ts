/**
 * TripRadar Sever - Typove definice
 *
 * Tento soubor obsahuje vsechny sdilene typy pro aplikaci.
 */

// ============================================
// Databazove entity (Supabase)
// ============================================

export interface Trip {
  id: string
  name: string
  slug: string
  description: string
  route_json: RouteData
  metadata_schema: MetadataSchema
  created_at: string
  updated_at: string
}

export interface RouteData {
  waypoints: Waypoint[]
  total_distance_km: number
  estimated_duration_min: number
}

export interface Waypoint {
  lat: number
  lng: number
  name: string
  order: number
}

export interface MetadataSchema {
  configurable_fields: ConfigurableField[]
}

export interface ConfigurableField {
  key: string
  label: string
  type: 'boolean' | 'select' | 'number'
  default_value: boolean | string | number
}

export interface RadarPoint {
  id: string
  trip_id: string
  name: string
  description: string
  category: RadarPointCategory
  coords: {
    lat: number
    lng: number
  }
  content: RadarPointContent
  created_at: string
}

export type RadarPointCategory = 'food' | 'history' | 'event' | 'kids' | 'nature'

export interface RadarPointContent {
  title: string
  description: string
  images?: string[]
  opening_hours?: string
  contact?: string
  url?: string
}

export interface Order {
  id: string
  trip_id: string
  user_email: string
  preferences: UserPreferences
  status: OrderStatus
  stripe_payment_intent_id?: string
  pdf_url?: string
  created_at: string
  updated_at: string
}

export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled'

export interface UserPreferences {
  gastro: boolean
  history: boolean
  kids: boolean
  include_weekend_events: boolean
}

// ============================================
// UI komponenty
// ============================================

export interface ScratchCardProps {
  revealContent: string
  coverImage?: string
  onReveal?: () => void
}

export interface RadarProps {
  points: RadarPoint[]
  userPreferences: UserPreferences
  onPointReached?: (point: RadarPoint) => void
}

// ============================================
// API Response typy
// ============================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

export interface StripeCheckoutMetadata {
  trip_id: string
  preferences: string // JSON stringified UserPreferences
  user_email: string
}
