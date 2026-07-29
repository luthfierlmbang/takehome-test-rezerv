import { motion } from 'framer-motion'
import { Info } from '@phosphor-icons/react'
import { buildDayPreview } from '../lib/slots'
import type { BookingData } from '../context/BookingContext'

/**
 * Shows the operator the customer-facing result of the price rules: every start time for
 * the day with the price it would actually charge.
 *
 * Prices reflect *all* rules, so the number shown is the real one, but only the slots
 * owned by `ruleId` are filled — otherwise a later rule stealing hours from this one
 * would be invisible.
 *
 * Revealed by the rule card's existing "Preview" button rather than a separate accordion
 * control, so the design's own affordance does the work.
 */
export function PricePreview({ data, ruleId }: { data: BookingData; ruleId: string }) {
  const slots = buildDayPreview({
    from: data.bookableFrom,
    until: data.bookableUntil,
    interval: data.slotInterval,
    basePrice: data.basePrice,
    rules: data.priceRules,
  })

  const rule = data.priceRules.find((r) => r.id === ruleId)
  const ownedCount = slots.filter((s) => s.ruledBy === ruleId).length
  const takenCount = slots.filter((s) => s.ruledBy !== null && s.ruledBy !== ruleId).length

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div className="mt-4 rounded-lg bg-brand-surfaceMuted p-4">
        {slots.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-brand-textMuted">
            <Info size={16} />
            Set the bookable hours on the Schedule step to preview what customers will pay.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-black">
              What a customer sees on{' '}
              <span className="font-medium">{rule?.appliesOn ? rule.appliesOn.toLowerCase() : 'these days'}</span>
              {' — '}
              <span className="font-medium">{ownedCount}</span> of {slots.length} slots use this rule
            </p>

            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => {
                const isOwn = slot.ruledBy === ruleId
                const isOther = slot.ruledBy !== null && !isOwn
                return (
                  <span
                    key={slot.time}
                    className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs ${
                      isOwn
                        ? 'bg-brand-primary text-white'
                        : isOther
                          ? 'border border-brand-primary/40 bg-white text-brand-textMuted'
                          : 'border border-brand-border bg-white text-brand-textMuted'
                    }`}
                  >
                    {slot.time}
                    <span className={isOwn ? 'font-semibold' : 'font-medium text-black'}>${slot.price || '—'}</span>
                  </span>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-brand-textMuted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />
                This rule
              </span>
              {takenCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full border border-brand-primary/40 bg-white" />
                  Another rule ({takenCount})
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border border-brand-border bg-white" />
                Base price
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
