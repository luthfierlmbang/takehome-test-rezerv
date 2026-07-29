import { motion } from 'framer-motion'
import { buildDayPreview } from '../lib/slots'
import type { BookingData } from '../context/BookingContext'

/**
 * Shows the operator the customer-facing result of the price rules: every start time for
 * the day with the price it would actually charge.
 *
 * Prices reflect *all* rules, so the number shown is the real one, but only the slots
 * owned by `ruleId` are filled — otherwise a later rule stealing hours from this one
 * would be invisible.
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

  return (
    // Opacity only. An `animate={{ height: 'auto' }}` here froze partway — the wrapper
    // stuck at ~22px around 82px of content, clipping the preview to a sliver — the same
    // way Framer's width animation misbehaves in the uploader.
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
      <div className="flex flex-col gap-4 pt-2">
        <span className="text-base font-medium leading-[26px] text-black">
          Price on Every {rule?.appliesOn || 'day'}
        </span>

        {slots.length === 0 ? (
          <p className="text-sm text-brand-textMuted">
            Set the bookable hours on the Schedule step to preview what customers will pay.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
              const isOwn = slot.ruledBy === ruleId
              return (
                <span
                  key={slot.time}
                  className={`flex h-8 items-center rounded-2xl border px-2 py-1 text-sm ${
                    isOwn
                      ? 'border-brand-border bg-brand-primary text-white'
                      : 'border-brand-border bg-brand-surfaceMuted text-[#52525B]'
                  }`}
                >
                  {slot.time} price{' '}
                  <span className={`ml-1 font-semibold ${isOwn ? 'text-white' : 'text-black'}`}>
                    ${slot.price || '—'}
                  </span>
                </span>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
