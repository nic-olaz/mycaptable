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
      companies: {
        Row: {
          id: string
          name: string
          legal_form: string
          founded_at: string | null
          share_capital: number
          currency: string
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          legal_form?: string
          founded_at?: string | null
          share_capital: number
          currency?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          legal_form?: string
          founded_at?: string | null
          share_capital?: number
          currency?: string
          user_id?: string | null
          updated_at?: string
        }
      }
      shareholders: {
        Row: {
          id: string
          company_id: string
          name: string
          share_percent: number
          shares: number | null
          share_value: number | null
          shareholder_type: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          share_percent: number
          shares?: number | null
          share_value?: number | null
          shareholder_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          share_percent?: number
          shares?: number | null
          share_value?: number | null
          shareholder_type?: string
        }
      }
      rounds: {
        Row: {
          id: string
          company_id: string
          name: string
          round_type: string
          pre_money: number | null
          investment: number | null
          post_money: number | null
          investor_percent: number | null
          closed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          round_type?: string
          pre_money?: number | null
          investment?: number | null
          investor_percent?: number | null
          closed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          round_type?: string
          pre_money?: number | null
          investment?: number | null
          investor_percent?: number | null
          closed_at?: string | null
        }
      }
      round_participants: {
        Row: {
          id: string
          round_id: string
          investor_name: string
          investment: number
          share_percent: number
          created_at: string
        }
        Insert: {
          id?: string
          round_id: string
          investor_name: string
          investment: number
          share_percent: number
          created_at?: string
        }
        Update: {
          id?: string
          round_id?: string
          investor_name?: string
          investment?: number
          share_percent?: number
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
