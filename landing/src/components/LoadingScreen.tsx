import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const words = ['Design', 'Create', 'Inspire']

interface Props {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: Props) {
  const [count, setCount] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const duration = 2700
    const start = startRef.current

    const frame = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const current = Math.floor(progress * 100)
      setCount(Math.min(current, 100))
      setWordIndex(Math.floor((elapsed / 900) % 3))

      if (progress < 1) {
        requestAnimationFrame(frame)
      } else {
        setTimeout(onComplete, 400)
      }
    }
    requestAnimationFrame(frame)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[9999] bg-bg flex flex-col justify-between p-8 md:p-12">
      <div className="text-xs text-muted uppercase tracking-[0.3em]">
        <motion.span
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Portfolio
        </motion.span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={wordIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary/80"
          >
            {words[wordIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex-1 max-w-[300px]">
          <div className="h-[3px] bg-stroke/50 rounded-full overflow-hidden">
            <div
              className="h-full accent-gradient rounded-full"
              style={{
                transform: `scaleX(${count / 100})`,
                transformOrigin: 'left',
                boxShadow: '0 0 8px rgba(137, 170, 204, 0.35)',
              }}
            />
          </div>
        </div>

        <div className="text-6xl md:text-8xl lg:text-9xl font-display text-text-primary tabular-nums leading-none">
          {String(count).padStart(3, '0')}
        </div>
      </div>
    </div>
  )
}
