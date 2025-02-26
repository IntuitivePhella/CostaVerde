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
          created_at: string
          updated_at: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          document_number: string | null
          bio: string | null
          is_owner: boolean
          email: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          document_number?: string | null
          bio?: string | null
          is_owner?: boolean
          email?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          document_number?: string | null
          bio?: string | null
          is_owner?: boolean
          email?: string | null
        }
      }
      boats: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          type: string
          description: string
          capacity: number
          price_per_day: number
          location: string
          is_active: boolean
          owner_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          type: string
          description: string
          capacity: number
          price_per_day: number
          location: string
          is_active?: boolean
          owner_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          type?: string
          description?: string
          capacity?: number
          price_per_day?: number
          location?: string
          is_active?: boolean
          owner_id?: string
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          boat_id: string
          user_id: string
          start_date: string
          end_date: string
          total_price: number
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          boat_id: string
          user_id: string
          start_date: string
          end_date: string
          total_price: number
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          boat_id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          total_price?: number
          status?: string
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          booking_id: string
          user_id: string
          rating: number
          comment: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          booking_id: string
          user_id: string
          rating: number
          comment?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          booking_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 
} 