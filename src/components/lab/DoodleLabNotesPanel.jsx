import {
  BookOpen,
  Gauge,
  Lightbulb,
  Tags,
  X,
} from 'lucide-react'
import {
  DOODLE_LAB_NOTES_SECTIONS,
  DOODLE_LAB_NOTES_TITLE,
} from '../../config/doodleLabNotes'

const SECTION_ICONS = {
  labels: Tags,
  tip: Lightbulb,
  meter: Gauge,
}

function NotesContent({ showClose, onClose }) {
  return (
    <>
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" aria-hidden />
          <div>
            <p className="text-sm font-black text-indigo-900">{DOODLE_LAB_NOTES_TITLE}</p>
            <p className="text-[10px] text-indigo-600/90 font-medium">
              Supervised learning · Overfitting · Uncertainty
            </p>
          </div>
        </div>
        {showClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] rounded-lg border border-indigo-200 text-indigo-600 hover:bg-white flex items-center justify-center"
            aria-label="Close AI Lab Notes"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
        {DOODLE_LAB_NOTES_SECTIONS.map((section) => {
          const Icon = SECTION_ICONS[section.icon] ?? Lightbulb
          const isTip = section.icon === 'tip'
          const isMeter = section.icon === 'meter'

          return (
            <section
              key={section.title}
              className={`rounded-xl border p-4 ${
                isTip
                  ? 'border-amber-300 bg-amber-50'
                  : isMeter
                    ? 'border-sky-300 bg-sky-50'
                    : 'border-violet-200 bg-violet-50/80'
              }`}
            >
              <p
                className={`text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5 ${
                  isTip
                    ? 'text-amber-800'
                    : isMeter
                      ? 'text-sky-800'
                      : 'text-violet-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
                {section.title}
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">{section.body}</p>
              {isTip && (
                <p className="text-[11px] font-semibold text-amber-900/80 mt-3 pt-3 border-t border-amber-200">
                  Try it: train five identical circles, then test a messy oval in Test Mode!
                </p>
              )}
            </section>
          )
        })}

        <p className="text-[10px] text-slate-500 leading-relaxed px-1">
          MobileNet turns doodles into numbers; KNN compares new doodles to your labeled examples.
        </p>
      </div>
    </>
  )
}

/**
 * AI Lab Notes — desktop sidebar (xl+) and mobile bottom sheet.
 */
export default function DoodleLabNotesPanel({ mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden xl:flex w-[min(100%,300px)] shrink-0 flex-col min-h-0 rounded-2xl border-2 border-indigo-200 bg-white shadow-lg overflow-hidden"
        aria-label={DOODLE_LAB_NOTES_TITLE}
      >
        <NotesContent />
      </aside>

      {/* Mobile / tablet sheet */}
      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] xl:hidden"
            aria-label="Close AI Lab Notes"
            onClick={onMobileClose}
          />
          <aside
            className="fixed z-50 inset-x-0 bottom-0 max-h-[min(88vh,720px)] xl:hidden flex flex-col rounded-t-2xl border-t-2 border-indigo-300 bg-white shadow-2xl overflow-hidden"
            aria-label={DOODLE_LAB_NOTES_TITLE}
          >
            <NotesContent showClose onClose={onMobileClose} />
          </aside>
        </>
      )}
    </>
  )
}
