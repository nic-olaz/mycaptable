import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { solveRound, dilute, formatEur, formatPercent, type SolveFor } from '@/lib/calculator'
import { ArrowLeft, Calculator } from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import LoginModal from '@/components/LoginModal'
import { toast } from '@/lib/use-toast'
import { useCapTable } from '@/context/CapTableContext'

type FieldName = 'pre_money' | 'investment' | 'investor_percent'

const FIELD_LABELS: Record<FieldName, string> = {
  pre_money: 'Pre-Money Valuation',
  investment: 'Investment',
  investor_percent: 'Investor Stake',
}

const FIELD_SOLVE_LABELS: Record<FieldName, string> = {
  pre_money: 'Pre-Money Valuation',
  investment: 'Investment',
  investor_percent: 'Investor Stake',
}

const FIELD_PREFIX: Record<FieldName, string> = {
  pre_money: '€',
  investment: '€',
  investor_percent: '%',
}

export default function RoundCalculator() {
  const navigate = useNavigate()
  const { shareholders: guestShareholders, openLoginModal } = useCapTable()

  const [userId, setUserId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [solveFor, setSolveFor] = useState<SolveFor>('investor_percent')

  const [fields, setFields] = useState<Record<FieldName, string>>({
    pre_money: '',
    investment: '',
    investor_percent: '',
  })

  const [result, setResult] = useState<{
    pre_money: number
    investment: number
    investor_percent: number
    post_money: number
  } | null>(null)

  const [calcError, setCalcError] = useState<string | null>(null)
  const [investorName, setInvestorName] = useState('')

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  function handleFieldChange(field: FieldName, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }))
    setResult(null)
    setCalcError(null)
  }

  function handleSolveForChange(field: SolveFor) {
    setSolveFor(field)
    setFields((prev) => ({ ...prev, [field]: '' }))
    setResult(null)
    setCalcError(null)
  }

  function calculate() {
    setCalcError(null)
    try {
      const pre_money = fields.pre_money ? parseFloat(fields.pre_money) : undefined
      const investment = fields.investment ? parseFloat(fields.investment) : undefined
      const investor_percent_raw = fields.investor_percent
        ? parseFloat(fields.investor_percent) / 100
        : undefined

      const res = solveRound({
        solveFor,
        pre_money,
        investment,
        investor_percent: investor_percent_raw,
      })
      setResult(res)
    } catch (err) {
      setCalcError(err instanceof Error ? err.message : 'Calculation error')
    }
  }

  async function saveRound() {
    if (!result || !userId) {
      openLoginModal()
      return
    }

    setSaving(true)
    try {
      const roundName = `Round ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`

      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)

      const companyId = companies?.[0]?.id as string | undefined

      if (!companyId) {
        toast({
          variant: 'destructive',
          title: 'No company found',
          description: 'Save your cap table first.',
        })
        setSaving(false)
        return
      }

      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .insert({
          company_id: companyId,
          name: roundName,
          round_type: 'equity',
          pre_money: result.pre_money,
          investment: result.investment,
          investor_percent: result.investor_percent,
        })
        .select('id')
        .single()

      if (roundError) throw roundError

      const { error: participantError } = await supabase
        .from('round_participants')
        .insert({
          round_id: roundData.id,
          investor_name: investorName.trim() || 'New Investor',
          investment: result.investment,
          share_percent: result.investor_percent,
        })

      if (participantError) throw participantError

      toast({
        title: 'Round saved',
        description: `"${roundName}" has been added successfully.`,
      })

      void navigate('/dashboard')
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error saving round',
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setSaving(false)
    }
  }

  const shareholders = guestShareholders.map((s) => ({
    name: s.name,
    share_percent: s.share_percent,
  }))

  const dilutedTable = result
    ? dilute(
        shareholders,
        result.investor_percent,
        investorName.trim() || 'New Investor',
      )
    : null

  function getDiff(entry: { name: string; share_percent: number; diluted_from: number }) {
    if (entry.diluted_from === 0) return null
    return entry.share_percent - entry.diluted_from
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <AppHeader />
      <LoginModal />

      <main className="max-w-2xl mx-auto px-4 pb-16">
        {/* Back */}
        <div className="mt-8 mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#6b6860] hover:text-[#1a1917] transition-colors duration-150"
          >
            <ArrowLeft className="h-4 w-4" />
            Cap Table
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6860] mb-2">
            Simulate funding round
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[#1a1917]">
            Enter two values,<br />we calculate the third.
          </h1>
        </div>

        {/* What to calculate */}
        <div className="bg-white border border-[#e4e2db] rounded-xl p-5 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6860] mb-3">
            What should we calculate?
          </p>
          <div className="flex flex-col gap-2">
            {(['pre_money', 'investment', 'investor_percent'] as const).map((field) => (
              <label
                key={field}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150 ${
                    solveFor === field
                      ? 'border-[#1a3a2a] bg-[#1a3a2a]'
                      : 'border-[#ccc9c0] group-hover:border-[#1a3a2a]'
                  }`}
                >
                  {solveFor === field && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
                <input
                  type="radio"
                  name="solveFor"
                  value={field}
                  checked={solveFor === field}
                  onChange={() => handleSolveForChange(field)}
                  className="sr-only"
                />
                <span className={`text-sm transition-colors duration-150 ${
                  solveFor === field
                    ? 'font-medium text-[#1a1917]'
                    : 'text-[#6b6860] group-hover:text-[#1a1917]'
                }`}>
                  {FIELD_SOLVE_LABELS[field]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Input fields */}
        <div className="bg-white border border-[#e4e2db] rounded-xl p-5 mb-6 space-y-5">
          {(['pre_money', 'investment', 'investor_percent'] as const).map((field) => {
            const isDisabled = solveFor === field
            return (
              <div key={field}>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor={field}
                    className={`text-xs font-semibold uppercase tracking-widest ${
                      isDisabled ? 'text-[#a09e99]' : 'text-[#6b6860]'
                    }`}
                  >
                    {FIELD_LABELS[field]}
                  </label>
                  {isDisabled && (
                    <span className="flex items-center gap-1 text-xs text-[#a09e99]">
                      <Calculator className="h-3 w-3" />
                      calculated
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium font-tabular select-none ${
                    isDisabled ? 'text-[#a09e99]' : 'text-[#6b6860]'
                  }`}>
                    {FIELD_PREFIX[field]}
                  </span>
                  <input
                    id={field}
                    type="number"
                    min="0"
                    step={field === 'investor_percent' ? '0.1' : '1000'}
                    value={isDisabled ? '' : fields[field]}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    disabled={isDisabled}
                    placeholder={
                      isDisabled
                        ? '–'
                        : field === 'investor_percent'
                          ? '20'
                          : field === 'investment'
                            ? '1,000,000'
                            : '4,000,000'
                    }
                    className={`w-full pl-8 pr-4 py-2.5 text-sm border-2 rounded-lg font-tabular text-[#1a1917] placeholder:text-[#a09e99] focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:ring-offset-1 transition-all duration-150 ${
                      isDisabled
                        ? 'border-dashed border-[#ccc9c0] bg-[#f1f0ed] text-[#a09e99] cursor-not-allowed'
                        : 'border-[#e4e2db] bg-white hover:border-[#ccc9c0]'
                    }`}
                  />
                </div>
              </div>
            )
          })}

          {/* Investor Name */}
          <div>
            <label
              htmlFor="investor-name"
              className="text-xs font-semibold uppercase tracking-widest text-[#6b6860] block mb-1.5"
            >
              Investor name
            </label>
            <input
              id="investor-name"
              type="text"
              value={investorName}
              onChange={(e) => setInvestorName(e.target.value)}
              placeholder="e.g. VC Fund Alpha (optional)"
              className="w-full px-3 py-2.5 text-sm border border-[#e4e2db] rounded-lg bg-white text-[#1a1917] placeholder:text-[#a09e99] focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:ring-offset-1 transition-colors"
            />
          </div>

          {calcError && (
            <div className="rounded-lg border border-[#fce8e6] bg-[#fce8e6] p-3 text-sm text-[#c0392b]">
              {calcError}
            </div>
          )}

          <button
            onClick={calculate}
            className="w-full py-3 px-6 bg-[#1a3a2a] text-white rounded-lg text-sm font-medium hover:bg-[#152e22] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#1a3a2a] focus-visible:ring-offset-2"
          >
            Calculate
          </button>
        </div>

        {/* Result */}
        {result ? (
          <div className="space-y-6">
            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-[#e4e2db]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99]">Result</span>
              <div className="flex-1 border-t border-[#e4e2db]" />
            </div>

            {/* Post-Money Highlight */}
            <div className="bg-white border border-[#e4e2db] rounded-xl p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6860] mb-2">
                Post-Money Valuation
              </p>
              <p className="text-5xl font-bold font-tabular text-[#1a3a2a] tracking-tight">
                {formatEur(result.post_money)}
              </p>

              {/* Key metrics */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#f1f0ed]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] mb-1">
                    Pre-Money
                  </p>
                  <p className="text-base font-semibold font-tabular text-[#1a1917]">
                    {formatEur(result.pre_money)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] mb-1">
                    Investment
                  </p>
                  <p className="text-base font-semibold font-tabular text-[#1a1917]">
                    {formatEur(result.investment)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] mb-1">
                    Investor Stake
                  </p>
                  <p className="text-base font-semibold font-tabular text-[#1a1917]">
                    {formatPercent(result.investor_percent)}
                  </p>
                </div>
              </div>
            </div>

            {/* Diluted Cap Table */}
            {dilutedTable && dilutedTable.length > 0 && (
              <div className="bg-white border border-[#e4e2db] rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-[#e4e2db]">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6860]">
                    Diluted Cap Table
                  </p>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-[1fr_auto_auto_auto] px-5 py-2.5 border-b border-[#f1f0ed]">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99]">
                    Name
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] text-right w-20">
                    Before
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] text-right w-20">
                    After
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] text-right w-16">
                    Change
                  </span>
                </div>

                {dilutedTable.map((entry, i) => {
                  const diff = getDiff(entry)
                  const isNew = entry.diluted_from === 0
                  return (
                    <div
                      key={i}
                      className={`grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-3 border-b border-[#f1f0ed] last:border-0 ${
                        isNew ? 'bg-[#d8f3dc]/30' : 'hover:bg-[#f8f7f4]'
                      } transition-colors duration-150`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1a1917]">{entry.name}</span>
                        {isNew && (
                          <span className="px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[#d8f3dc] text-[#1a3a2a] rounded">
                            new
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-tabular text-right text-[#a09e99] w-20">
                        {isNew ? '–' : formatPercent(entry.diluted_from)}
                      </span>
                      <span className="text-sm font-tabular font-medium text-right text-[#1a1917] w-20">
                        {formatPercent(entry.share_percent)}
                      </span>
                      <span className={`text-sm font-tabular font-medium text-right w-16 ${
                        isNew
                          ? 'text-[#2d6a4f]'
                          : diff !== null && diff < 0
                            ? 'text-red-600'
                            : 'text-[#2d6a4f]'
                      }`}>
                        {isNew
                          ? `+${formatPercent(entry.share_percent)}`
                          : diff !== null
                            ? `${diff < 0 ? '' : '+'}${formatPercent(diff)}`
                            : '–'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={() => { void saveRound() }}
              disabled={saving}
              className="w-full py-3 px-6 border border-[#1a3a2a] text-[#1a3a2a] rounded-lg text-sm font-medium hover:bg-[#1a3a2a] hover:text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#1a3a2a] focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : userId
                  ? 'Save round'
                  : 'Sign in & save round'}
            </button>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center border border-dashed border-[#ccc9c0] rounded-xl">
            <Calculator className="h-8 w-8 text-[#ccc9c0]" />
            <p className="text-sm text-[#a09e99]">
              Enter values and click Calculate
            </p>
            {shareholders.length === 0 && (
              <p className="text-xs text-[#a09e99]">
                Dilution will show once shareholders are added
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
