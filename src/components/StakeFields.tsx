'use client'

import { useState, useEffect } from 'react'

export default function StakeFields() {
  const [hasStake, setHasStake] = useState(false)
  const [timezone, setTimezone] = useState('UTC')

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  // Default start = today, end = 30 days from now
  const today = new Date().toISOString().split('T')[0]
  const defaultEnd = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  return (
    <div className="border-t border-gray-100 pt-5">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={hasStake}
          onChange={(e) => setHasStake(e.target.checked)}
          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
        />
        <span className="text-sm font-medium text-gray-700">
          Put money on the line
        </span>
      </label>

      <input type="hidden" name="has_stake" value={hasStake ? 'true' : 'false'} />

      {hasStake && (
        <div className="mt-4 space-y-4 pl-6 border-l-2 border-indigo-100">
          <div>
            <label htmlFor="total_stake" className="block text-sm font-medium text-gray-700 mb-1">
              Stake amount (USD) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                id="total_stake"
                name="total_stake"
                type="number"
                min="1"
                max="10000"
                step="0.01"
                required
                placeholder="50.00"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              This amount will be split across all check-in periods. Miss a check-in, lose a portion.
            </p>
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Reporting frequency <span className="text-red-500">*</span>
            </label>
            <select
              id="frequency"
              name="frequency"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="daily">Daily</option>
              <option value="3x_week">3x per week</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="starts_at" className="block text-sm font-medium text-gray-700 mb-1">
                Start date <span className="text-red-500">*</span>
              </label>
              <input
                id="starts_at"
                name="starts_at"
                type="date"
                required
                defaultValue={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="ends_at" className="block text-sm font-medium text-gray-700 mb-1">
                End date <span className="text-red-500">*</span>
              </label>
              <input
                id="ends_at"
                name="ends_at"
                type="date"
                required
                defaultValue={defaultEnd}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="recipient_email" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient email <span className="text-red-500">*</span>
            </label>
            <input
              id="recipient_email"
              name="recipient_email"
              type="email"
              required
              placeholder="friend@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              This person receives your money when you miss a check-in.
            </p>
          </div>

          <input type="hidden" name="timezone" value={timezone} />
        </div>
      )}
    </div>
  )
}
