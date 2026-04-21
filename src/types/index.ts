export interface Company {
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

export interface Shareholder {
  id: string
  company_id: string
  name: string
  share_percent: number
  shares: number | null
  share_value: number | null
  shareholder_type: string
  created_at: string
}

export interface Round {
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

export interface RoundParticipant {
  id: string
  round_id: string
  investor_name: string
  investment: number
  share_percent: number
  created_at: string
}

export type ShareholderType = 'founder' | 'investor' | 'employee' | 'advisor' | 'other'
export type RoundType = 'equity' | 'convertible' | 'safe' | 'debt'
