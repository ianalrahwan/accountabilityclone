import { cancelStakeContract } from '@/app/actions'
import type { StakeContract, DeductionLog } from '@/lib/types'

const FREQ_LABELS: Record<string, string> = {
  daily: 'Daily',
  '3x_week': '3x per week',
  weekly: 'Weekly',
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function PayoutBadge({ status }: { status: string | null }) {
  if (!status) return null
  const colors: Record<string, string> = {
    SUCCESS: 'text-green-600',
    MOCK: 'text-blue-600',
    FAILED: 'text-red-600',
    SKIPPED: 'text-yellow-600',
    PENDING: 'text-gray-500',
    'N/A': 'text-gray-400',
  }
  return (
    <span className={`text-xs font-medium ${colors[status] || 'text-gray-500'}`}>
      {status}
    </span>
  )
}

export default function StakeContractCard({
  contract,
  deductions,
  totalPeriods,
  checkedInPeriods,
  stakePerPeriod,
}: {
  contract: StakeContract
  deductions: DeductionLog[]
  totalPeriods: number
  checkedInPeriods: number
  stakePerPeriod: number
}) {
  const missedDeductions = deductions.filter(d => d.was_missed)
  const totalDeducted = missedDeductions.reduce((sum, d) => sum + d.amount_cents, 0)

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">Financial Stake</h2>
        <StatusBadge status={contract.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Total stake</p>
          <p className="text-lg font-bold text-gray-900">{formatCents(contract.total_stake_cents)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Per period</p>
          <p className="text-lg font-bold text-gray-900">{formatCents(stakePerPeriod)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Progress</p>
          <p className="text-lg font-bold text-gray-900">
            {checkedInPeriods}/{totalPeriods}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Deducted</p>
          <p className={`text-lg font-bold ${totalDeducted > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCents(totalDeducted)}
          </p>
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p>
          <span className="text-gray-400">Frequency:</span> {FREQ_LABELS[contract.frequency] || contract.frequency}
        </p>
        <p>
          <span className="text-gray-400">Period:</span> {contract.starts_at} to {contract.ends_at}
        </p>
        <p>
          <span className="text-gray-400">Recipient:</span> {contract.recipient_email}
        </p>
      </div>

      {/* Deduction history */}
      {deductions.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Deduction History
          </h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {deductions.map(d => (
              <div key={d.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-gray-600 font-mono text-xs">{d.period_key}</span>
                <div className="flex items-center gap-2">
                  {d.was_missed ? (
                    <span className="text-red-500 text-xs">-{formatCents(d.amount_cents)}</span>
                  ) : (
                    <span className="text-green-500 text-xs">OK</span>
                  )}
                  <PayoutBadge status={d.payout_status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel button */}
      {contract.status === 'active' && (
        <form
          action={async () => {
            'use server'
            await cancelStakeContract(contract.id)
          }}
          className="mt-4 border-t border-gray-100 pt-3"
        >
          <button
            type="submit"
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Cancel stake contract
          </button>
        </form>
      )}
    </section>
  )
}
