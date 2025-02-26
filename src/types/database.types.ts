export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          document_type: 'cpf' | 'cnpj' | null
          document_number: string | null
          user_type: 'owner' | 'client' | 'admin'
          is_verified: boolean
        }
        Insert: {
          id: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          document_type?: 'cpf' | 'cnpj' | null
          document_number?: string | null
          user_type: 'owner' | 'client' | 'admin'
          is_verified?: boolean
        }
        Update: {
          id?: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          document_type?: 'cpf' | 'cnpj' | null
          document_number?: string | null
          user_type?: 'owner' | 'client' | 'admin'
          is_verified?: boolean
        }
      }
      boats: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          owner_id: string
          name: string
          description: string | null
          boat_type: string
          capacity: number
          length: number
          year: number | null
          location: Json
          base_price: number
          status: 'active' | 'inactive' | 'maintenance'
          features: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          owner_id: string
          name: string
          description?: string | null
          boat_type: string
          capacity: number
          length: number
          year?: number | null
          location: Json
          base_price: number
          status?: 'active' | 'inactive' | 'maintenance'
          features?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          owner_id?: string
          name?: string
          description?: string | null
          boat_type?: string
          capacity?: number
          length?: number
          year?: number | null
          location?: Json
          base_price?: number
          status?: 'active' | 'inactive' | 'maintenance'
          features?: Json | null
        }
      }
      boat_images: {
        Row: {
          id: string
          boat_id: string
          url: string
          is_main: boolean
          created_at: string
        }
        Insert: {
          id?: string
          boat_id: string
          url: string
          is_main?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          boat_id?: string
          url?: string
          is_main?: boolean
          created_at?: string
        }
      }
      availability: {
        Row: {
          id: string
          boat_id: string
          start_date: string
          end_date: string
          price_modifier: number
          status: 'available' | 'blocked' | 'reserved'
        }
        Insert: {
          id?: string
          boat_id: string
          start_date: string
          end_date: string
          price_modifier?: number
          status?: 'available' | 'blocked' | 'reserved'
        }
        Update: {
          id?: string
          boat_id?: string
          start_date?: string
          end_date?: string
          price_modifier?: number
          status?: 'available' | 'blocked' | 'reserved'
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          boat_id: string
          client_id: string
          start_date: string
          end_date: string
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'paid' | 'refunded'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          boat_id: string
          client_id: string
          start_date: string
          end_date: string
          total_price: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          boat_id?: string
          client_id?: string
          start_date?: string
          end_date?: string
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded'
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          booking_id: string
          rating: number
          comment: string | null
          response: string | null
          response_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          booking_id: string
          rating: number
          comment?: string | null
          response?: string | null
          response_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          booking_id?: string
          rating?: number
          comment?: string | null
          response?: string | null
          response_date?: string | null
        }
      }
    }
  }
} 