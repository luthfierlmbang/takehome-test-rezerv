import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Trash, UploadSimple } from '@phosphor-icons/react'
import uploadFolderUrl from '../assets/upload-folder.svg'
import padelCourtUrl from '../assets/padel-court.png'

type UploadState = 'empty' | 'uploading' | 'done'

/**
 * Simulated uploader: "browse files" runs a real progress animation and lands on the
 * design's filled state, so the upload micro-interaction is demonstrable without
 * needing the user to pick a file from disk.
 *
 * States are swapped by plain conditional rendering rather than AnimatePresence —
 * `mode="wait"` exits do not settle reliably here, which would strand the empty state.
 */
export function ImageUploader({
  hasImage,
  onChange,
}: {
  hasImage: boolean
  onChange: (hasImage: boolean) => void
}) {
  const [state, setState] = useState<UploadState>(hasImage ? 'done' : 'empty')
  const [progress, setProgress] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function startUpload() {
    if (state === 'uploading') return
    timers.current.forEach(clearTimeout)
    timers.current = []
    setState('uploading')
    setProgress(0)

    // Stepped progress reads as real transfer rather than a single linear sweep.
    const steps = [12, 34, 58, 79, 93, 100]
    steps.forEach((value, i) => {
      timers.current.push(setTimeout(() => setProgress(value), (i + 1) * 260))
    })
    timers.current.push(
      setTimeout(
        () => {
          setState('done')
          onChange(true)
        },
        steps.length * 260 + 200,
      ),
    )
  }

  function reset() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setState('empty')
    setProgress(0)
    onChange(false)
  }

  if (state === 'uploading') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="flex h-[284px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-brand-primary text-center"
      >
        <motion.img
          src={uploadFolderUrl}
          alt=""
          className="h-[84px] w-[84px]"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="w-56">
          <div
            role="progressbar"
            aria-label="Uploading image"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 w-full overflow-hidden rounded-full bg-brand-surfaceMuted"
          >
            <motion.div
              className="h-full rounded-full bg-brand-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-2 text-sm text-brand-textMuted">Uploading… {progress}%</p>
        </div>
      </motion.div>
    )
  }

  if (state === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-4"
      >
        <div className="relative">
          <motion.img
            src={padelCourtUrl}
            alt="Service"
            className="h-[374px] w-full rounded-lg object-cover"
            // Opacity only: a scale animation leaves the image a few px short of the
            // design's 374px if it settles even slightly under 1.
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 320, damping: 18 }}
            className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-medium text-brand-primary shadow-sm"
          >
            <CheckCircle size={14} weight="fill" />
            Uploaded
          </motion.span>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={reset}
            className="flex h-8 flex-1 items-center justify-center gap-2 rounded-lg border border-[#F5A3A3] text-xs font-semibold text-[#D92D20] transition-colors hover:bg-[#FEF3F2]"
          >
            <Trash size={16} />
            Remove
          </button>
          <button
            type="button"
            onClick={startUpload}
            className="flex h-8 flex-1 items-center justify-center gap-2 rounded-lg border border-brand-border text-xs font-semibold text-[#0B0B0B] transition-colors hover:bg-brand-surfaceMuted"
          >
            <UploadSimple size={16} />
            Change image
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="flex h-[284px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-brand-border text-center"
    >
      <motion.img
        src={uploadFolderUrl}
        alt=""
        className="h-[84px] w-[84px]"
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      />
      <p className="text-base leading-[26px] text-black">
        Drag &amp; Drop or{' '}
        <button type="button" onClick={startUpload} className="text-brand-primary underline">
          browse files
        </button>
      </p>
      <span className="text-sm text-black">JPEG, PNG</span>
    </motion.div>
  )
}
