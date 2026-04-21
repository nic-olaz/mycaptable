import { supabase } from './supabase'

export interface GuestShareholder {
  id: string // lokale UUID
  name: string
  share_percent: number // Dezimalzahl, z.B. 0.5 für 50 %
  shares?: number
  shareholder_type: 'founder' | 'investor' | 'employee' | 'advisor' | 'other'
}

export interface GuestCompany {
  name: string
  legal_form: string
  share_capital: number | null
}

export interface GuestState {
  company: GuestCompany | null
  shareholders: GuestShareholder[]
}

const STORAGE_KEY = 'mycaptable_guest'

const DEFAULT_STATE: GuestState = {
  company: null,
  shareholders: [],
}

export function loadGuestState(): GuestState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    return JSON.parse(raw) as GuestState
  } catch {
    return DEFAULT_STATE
  }
}

export function saveGuestState(state: GuestState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearGuestState(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/** Generiert eine einfache UUID v4 ohne externe Abhängigkeit */
export function generateLocalId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Speichert den Guest State aus localStorage in Supabase.
 * Wird nach erfolgreichem Login aufgerufen.
 * Bei Fehler bleibt der localStorage-Eintrag erhalten, damit keine Daten verloren gehen.
 */
export async function saveGuestStateToSupabase(userId: string): Promise<void> {
  const state = loadGuestState()

  // Nichts zu speichern
  if (!state.company && state.shareholders.length === 0) return

  const company = state.company ?? {
    name: 'Mein Startup',
    legal_form: 'GmbH',
    share_capital: 25000,
  }

  try {
    // Company anlegen
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: company.name,
        legal_form: company.legal_form,
        share_capital: company.share_capital,
        currency: 'EUR',
        user_id: userId,
      })
      .select('id')
      .single()

    if (companyError) throw companyError

    // Gesellschafter anlegen
    if (state.shareholders.length > 0) {
      const shareholdersPayload = state.shareholders.map((s) => ({
        company_id: companyData.id as string,
        name: s.name,
        share_percent: s.share_percent,
        shares: s.shares ?? null,
        shareholder_type: s.shareholder_type,
      }))

      const { error: shareholdersError } = await supabase
        .from('shareholders')
        .insert(shareholdersPayload)

      if (shareholdersError) throw shareholdersError
    }

    // Nur bei Erfolg leeren
    clearGuestState()
  } catch (err) {
    // localStorage bewusst behalten damit Daten nicht verloren gehen
    console.error('Fehler beim Speichern des Guest States in Supabase:', err)
    throw err
  }
}
