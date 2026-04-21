/**
 * Round Calculator – 3-Parameter-Solver
 *
 * Formeln:
 *   post_money = pre_money + investment
 *   investor_percent = investment / post_money
 *   pre_money = investment * (1 - investor_percent) / investor_percent
 *   investment = pre_money * investor_percent / (1 - investor_percent)
 */

export type SolveFor = 'pre_money' | 'investment' | 'investor_percent'

export interface RoundParams {
  solveFor: SolveFor
  pre_money?: number
  investment?: number
  investor_percent?: number // Dezimalzahl, z.B. 0.2 für 20%
}

export interface RoundResult {
  pre_money: number
  investment: number
  investor_percent: number
  post_money: number
}

export function solveRound(params: RoundParams): RoundResult {
  const { solveFor, pre_money, investment, investor_percent } = params

  switch (solveFor) {
    case 'pre_money': {
      if (investment === undefined || investor_percent === undefined) {
        throw new Error('investment und investor_percent sind erforderlich um pre_money zu berechnen')
      }
      if (investor_percent <= 0 || investor_percent >= 1) {
        throw new Error('investor_percent muss zwischen 0 und 1 (exklusiv) liegen')
      }
      const computed_pre = (investment * (1 - investor_percent)) / investor_percent
      const computed_post = computed_pre + investment
      return {
        pre_money: computed_pre,
        investment,
        investor_percent,
        post_money: computed_post,
      }
    }

    case 'investment': {
      if (pre_money === undefined || investor_percent === undefined) {
        throw new Error('pre_money und investor_percent sind erforderlich um investment zu berechnen')
      }
      if (investor_percent <= 0 || investor_percent >= 1) {
        throw new Error('investor_percent muss zwischen 0 und 1 (exklusiv) liegen')
      }
      const computed_inv = (pre_money * investor_percent) / (1 - investor_percent)
      const computed_post = pre_money + computed_inv
      return {
        pre_money,
        investment: computed_inv,
        investor_percent,
        post_money: computed_post,
      }
    }

    case 'investor_percent': {
      if (pre_money === undefined || investment === undefined) {
        throw new Error('pre_money und investment sind erforderlich um investor_percent zu berechnen')
      }
      const computed_post = pre_money + investment
      if (computed_post <= 0) {
        throw new Error('post_money muss positiv sein')
      }
      const computed_pct = investment / computed_post
      return {
        pre_money,
        investment,
        investor_percent: computed_pct,
        post_money: computed_post,
      }
    }

    default: {
      throw new Error(`Unbekannter solveFor-Wert: ${solveFor as string}`)
    }
  }
}

export interface ShareholderEntry {
  name: string
  share_percent: number
}

export interface DilutedShareholderEntry {
  name: string
  share_percent: number
  diluted_from: number
}

/**
 * Berechnet die Verwässerung bestehender Gesellschafter nach einer neuen Investitionsrunde.
 * Alle bestehenden Anteile werden proportional um den neuen Investorenanteil reduziert.
 *
 * @param shareholders  Bestehende Gesellschafter mit Anteilen (als Dezimalzahlen, Summe = 1)
 * @param newInvestorPercent  Anteil des neuen Investors (z.B. 0.2 für 20%)
 * @param newInvestorName  Name des neuen Investors
 */
export function dilute(
  shareholders: ShareholderEntry[],
  newInvestorPercent: number,
  newInvestorName: string,
): DilutedShareholderEntry[] {
  if (newInvestorPercent <= 0 || newInvestorPercent >= 1) {
    throw new Error('newInvestorPercent muss zwischen 0 und 1 (exklusiv) liegen')
  }

  const dilutionFactor = 1 - newInvestorPercent

  const dilutedExisting: DilutedShareholderEntry[] = shareholders.map((s) => ({
    name: s.name,
    share_percent: s.share_percent * dilutionFactor,
    diluted_from: s.share_percent,
  }))

  const newInvestor: DilutedShareholderEntry = {
    name: newInvestorName,
    share_percent: newInvestorPercent,
    diluted_from: 0,
  }

  return [...dilutedExisting, newInvestor]
}

/** Formatiert eine Zahl als Euro-Betrag */
export function formatEur(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Formatiert eine Dezimalzahl als Prozentzahl (z.B. 0.2 → "20,00 %") */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
