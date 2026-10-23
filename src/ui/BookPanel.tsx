import { AnimatePresence, motion } from 'framer-motion'
import { books } from '../content/site'
import { useRoom } from '../lib/store'
import { useMobile } from '../lib/useMobile'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * 书的阅读面板。刻意不用站内那套深色玻璃，而是一张纸：
 * 从书架抽下一本书，看到的应该是暖的、有纤维的纸面。
 */
export default function BookPanel() {
  const bookId = useRoom((s) => s.book)
  const setBook = useRoom((s) => s.setBook)
  const mobile = useMobile()

  const index = bookId ? books.findIndex((b) => b.id === bookId) : -1
  const book = index >= 0 ? books[index] : null

  return (
    <AnimatePresence>
      {book && (
        <motion.aside
          key={book.id}
          role="dialog"
          aria-modal="true"
          aria-label={`${book.title} 阅读笔记`}
          initial={mobile ? { y: '100%' } : { x: '102%' }}
          animate={mobile ? { y: 0 } : { x: 0 }}
          exit={mobile ? { y: '100%' } : { x: '102%' }}
          transition={{ duration: 0.78, ease: EASE }}
          className={
            mobile
              ? 'fixed inset-x-0 bottom-0 z-40 flex h-[86dvh] flex-col overflow-hidden rounded-t-[16px] bg-[#ece3d2] text-[#2b241c] shadow-[0_-20px_60px_rgba(0,0,0,0.45)]'
              : 'fixed right-0 top-0 z-40 flex h-full w-[min(468px,42vw)] flex-col overflow-hidden border-l-[3px] border-[#c6b696] bg-[#ece3d2] text-[#2b241c] shadow-[-24px_0_70px_rgba(0,0,0,0.5)]'
          }
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(96,74,42,0.028) 0px, rgba(96,74,42,0.028) 1px, transparent 1px, transparent 6px)',
          }}
        >
          {mobile && (
            <div className="flex justify-center pt-2.5">
              <span className="h-[3px] w-9 rounded-full bg-[#2b241c]/20" />
            </div>
          )}

          <header className="flex shrink-0 items-start justify-between px-7 pb-4 pt-6 md:px-9 md:pt-9">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-[#94826a]">
                SHELF — {String(index + 1).padStart(2, '0')}
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.22em] text-[#94826a]/80">
                {book.tag}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBook(null)}
              aria-label="合上这本书"
              className="group mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#2b241c]/20 transition-colors duration-400 hover:border-[#2b241c]/60 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#2b241c]/50"
            >
              <span className="relative block h-3 w-3">
                <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#2b241c]/60" />
                <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#2b241c]/60" />
              </span>
            </button>
          </header>

          <div className="thin-scroll flex-1 overflow-y-auto overscroll-contain px-7 pb-10 md:px-9">
            <h2 className="font-serif text-[30px] leading-[1.4] tracking-[0.01em] text-[#241d16]">
              {book.title}
            </h2>
            <p className="mt-3 text-[12px] tracking-[0.12em] text-[#7d6c55]">{book.author}</p>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#2b241c]/15" />
              <span className="font-mono text-[9px] tracking-[0.26em] text-[#94826a]">
                READING NOTE
              </span>
            </div>

            <p className="mt-6 whitespace-pre-line text-[14px] leading-[2.15] text-[#3b3227]">
              {book.note}
            </p>

            <div className="mt-12 flex items-center justify-between border-t border-[#2b241c]/12 pt-4">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#94826a]">
                — {String(index + 1).padStart(2, '0')} —
              </span>
              <button
                type="button"
                onClick={() => setBook(null)}
                className="font-mono text-[10px] tracking-[0.18em] text-[#6b5a44] transition-colors duration-400 hover:text-[#241d16] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#2b241c]/50"
              >
                合上 / ESC
              </button>
            </div>

            <p className="mt-8 font-serif text-[11.5px] leading-[2] text-[#94826a]">
              书脊上的名字是画上去的，不是贴图。这一整间房子，没有一张外部图片。
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
