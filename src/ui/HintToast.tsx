import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRoom } from '../lib/store'

const KEY = 'room01:visited'

/** 第一次进来的人不知道房间里能点，给一次 5 秒的提示，之后不再打扰 */
export default function HintToast() {
  const booted = useRoom((s) => s.booted)
  const [show, setShow] = useState(false)
  const [coarse, setCoarse] = useState(false)

  useEffect(() => {
    if (!booted) return

    let seen = true
    try {
      seen = window.localStorage.getItem(KEY) === '1'
    } catch {
      seen = false
    }
    if (seen) return

    setCoarse(window.matchMedia('(pointer: coarse)').matches)
    setShow(true)
    try {
      window.localStorage.setItem(KEY, '1')
    } catch {
      /* 隐私模式下写不进去就每次提示，无伤大雅 */
    }

    const id = window.setTimeout(() => setShow(false), 5200)
    return () => window.clearTimeout(id)
  }, [booted])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-x-0 top-[19%] z-30 flex justify-center px-6 md:top-[16%]"
        >
          <p className="border border-paper/12 bg-ink/70 px-4 py-2.5 font-mono text-[10px] tracking-[0.16em] text-paper/65 backdrop-blur-md">
            {coarse ? '轻点房间里的物件，或下方的编号' : '点击物件进入 · 拖动环视 · 键盘 1–4'}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
