import { motion } from 'framer-motion'
import { buildDayPreview, scheduleGroups } from '../lib/slots'
import type { BookingData } from '../context/BookingContext'

/** Days a rule's "applies on" scope can actually land on. */
const WEEKENDS = ['Saturday', 'Sunday']
function daysInScope(appliesOn: string, days: string[]): string[] {
  if (appliesOn === 'Weekends') return days.filter((d) => WEEKENDS.includes(d))
  if (appliesOn === 'Weekdays') return days.filter((d) => !WEEKENDS.includes(d))
  return days
}

/**
 * Shows the operator the customer-facing result of the price rules: every start time for
 * the day with the price it would actually charge.
 *
 * Prices reflect *all* rules, so the number shown is the real one, but only the slots
 * owned by `ruleId` are filled — otherwise a later rule stealing hours from this one
 * would be invisible.
 */
export function PricePreview({ data, ruleId }: { data: BookingData; ruleId: string }) {
  const rule = data.priceRules.find((r) => r.id === ruleId)

  // One block per distinct set of hours the rule's days run on. Days that share hours —
  // which is all of them until the operator says otherwise — collapse into one block, so
  // this reads exactly as it did before per-day hours existed.
  const blocks = scheduleGroups(data)
    .map((group) => ({ ...group, days: daysInScope(rule?.appliesOn ?? '', group.days) }))
    .filter((group) => group.days.length)
    .map((group) => ({
      days: group.days,
      interval: group.interval,
      slots: buildDayPreview({
        from: group.from,
        until: group.until,
        interval: group.interval,
        basePrice: data.basePrice,
        rules: data.priceRules,
      }),
    }))
    .filter((block) => block.slots.length)

  return (
    // Opacity only. An `animate={{ height: 'auto' }}` here froze partway — the wrapper
    // stuck at ~22px around 82px of content, clipping the preview to a sliver — the same
    // way Framer's width animation misbehaves in the uploader.
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
      <div className="flex flex-col gap-4 pt-2">
        <span className="text-base font-medium leading-[26px] text-black">
          {/* Figma's wording is "Price on Every <scope>", which doubles up on "Every day". */}
          {rule?.appliesOn === 'Every day' ? 'Price on Every day' : `Price on Every ${rule?.appliesOn || 'day'}`}
        </span>

        {blocks.length === 0 ? (
          <p className="text-sm text-brand-textMuted">
            Set the bookable hours on the Schedule step to preview what customers will pay.
          </p>
        ) : (
          blocks.map((block) => (
            <div key={block.days.join()} className="flex flex-col gap-2">
              {/* Naming the days only earns its space once the rule spans more than one schedule. */}
              {blocks.length > 1 && (
                <span className="text-sm text-brand-textMuted">
                  {block.days.join(', ')} · {block.interval}
                </span>
              )}
              <div className="flex flex-wrap gap-2">
                {block.slots.map((slot) => {
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
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}
