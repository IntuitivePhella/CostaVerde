export type Database = {
  public: {
    Tables: {
      boats: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          daily_rate: number
          capacity: number
          location: string
          owner_id: string
          status: 'available' | 'maintenance' | 'rented'
          images: string[]
          specifications: {
            length: number
            year: number
            manufacturer: string
            model: string
            features: string[]
          }
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          daily_rate: number
          capacity: number
          location: string
          owner_id: string
          status?: 'available' | 'maintenance' | 'rented'
          images: string[]
          specifications: {
            length: number
            year: number
            manufacturer: string
            model: string
            features: string[]
          }
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          daily_rate?: number
          capacity?: number
          location?: string
          owner_id?: string
          status?: 'available' | 'maintenance' | 'rented'
          images?: string[]
          specifications?: {
            length: number
            year: number
            manufacturer: string
            model: string
            features: string[]
          }
        }
      }
      reservations: {
        Row: {
          id: string
          created_at: string
          boat_id: string
          user_id: string
          start_date: string
          end_date: string
          total_amount: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'paid' | 'refunded'
          payment_intent_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          boat_id: string
          user_id: string
          start_date: string
          end_date: string
          total_amount: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string
        }
        Update: {
          id?: string
          created_at?: string
          boat_id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          total_amount?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          avatar_url: string
          email: string
          phone: string
          role: 'user' | 'owner' | 'admin'
          status: 'active' | 'inactive' | 'suspended'
          verification_status: 'pending' | 'verified' | 'rejected'
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          avatar_url?: string
          email: string
          phone: string
          role?: 'user' | 'owner' | 'admin'
          status?: 'active' | 'inactive' | 'suspended'
          verification_status?: 'pending' | 'verified' | 'rejected'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          avatar_url?: string
          email?: string
          phone?: string
          role?: 'user' | 'owner' | 'admin'
          status?: 'active' | 'inactive' | 'suspended'
          verification_status?: 'pending' | 'verified' | 'rejected'
        }
      }
    }
  }
} 