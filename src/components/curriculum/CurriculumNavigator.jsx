import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { moduleSelectionKey, isModuleSelected } from './curriculumUtils'

/**
 * @param {{
 *   curriculum: import('./curriculumUtils.js').CurriculumLevel[],
 *   summary: { lessons: number },
 *   selected: import('./curriculumUtils.js').SelectedModule | null,
 *   onSelectModule: (mod: import('./curriculumUtils.js').SelectedModule) => void,
 *   completedLessons?: string[],
 * }} props
 */
export default function CurriculumNavigator({
  curriculum,
  summary,
  selected,
  onSelectModule,
  completedLessons = [],
}) {
  const [openThemes, setOpenThemes] = useState(() => {
    const initial = new Set()
    const first = curriculum?.[0]
    if (first?.themes?.[0]) initial.add(`${first.id}:${first.themes[0].id}`)
    return initial
  })

  const toggleTheme = (levelId, themeId) => {
    const key = `${levelId}:${themeId}`
    setOpenThemes((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const levels = useMemo(() => curriculum || [], [curriculum])
  const totalLessons = summary?.lessons ?? 0

  const progressPercent = totalLessons
    ? Math.round((completedLessons.length / totalLessons) * 100)
    : 0

  const countModuleComplete = (mod) => mod.lessons.filter((l) => completedLessons.includes(l.id)).length

  return (
    <aside className="curriculum-nav h-full flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/80 bg-slate-900/80">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/90">IOAI</p>
        <h2 className="text-lg font-bold text-white mt-0.5">Curriculum Navigator</h2>
        <p className="text-xs text-slate-400 mt-1">Select a module to explore lessons</p>

        <div className="mt-4 pt-4 border-t border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300">Overall progress</span>
            <span className="tabular-nums text-cyan-400 font-bold transition-all duration-300">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(52,211,153,0.35)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 tabular-nums transition-all duration-300">
            {completedLessons.length} / {totalLessons} lessons complete
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-5 curriculum-nav-scroll">
        {levels.length === 0 ? (
          <p className="text-sm text-slate-500 px-2">
            No curriculum in database yet. Run{' '}
            <code className="text-cyan-400/80">npm run seed:ioai-curriculum</code>.
          </p>
        ) : null}

        {levels.map((level) => (
          <section key={level.id}>
            <h3 className="text-base sm:text-lg font-black text-white mb-2 flex items-center gap-2 px-1">
              <span aria-hidden>{level.emoji}</span>
              {level.title}
            </h3>

            <div className="space-y-1">
              {level.themes.map((theme) => {
                const themeKey = `${level.id}:${theme.id}`
                const isOpen = openThemes.has(themeKey)

                return (
                  <div
                    key={themeKey}
                    className="rounded-xl border border-slate-700/50 bg-slate-800/40 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTheme(level.id, theme.id)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-700/30 transition-colors"
                    >
                      <ChevronDown
                        className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-0' : '-rotate-90'
                        }`}
                        aria-hidden
                      />
                      <span className="text-sm font-semibold text-slate-200 flex-1">{theme.title}</span>
                      <span className="text-[10px] text-slate-500 tabular-nums">{theme.modules.length}</span>
                    </button>

                    {isOpen ? (
                      <ul className="pb-2 px-2 space-y-0.5">
                        {theme.modules.map((mod) => {
                          const modKey = moduleSelectionKey(level.id, theme.id, mod.id)
                          const active = isModuleSelected(selected, modKey)
                          const modDone = countModuleComplete(mod)

                          return (
                            <li key={modKey}>
                              <button
                                type="button"
                                onClick={() =>
                                  onSelectModule({
                                    levelId: level.id,
                                    themeId: theme.id,
                                    moduleId: mod.id,
                                    levelTitle: level.title,
                                    themeTitle: theme.title,
                                    moduleTitle: mod.title,
                                    levelEmoji: level.emoji,
                                    lessons: mod.lessons,
                                  })
                                }
                                className={[
                                  'w-full text-left rounded-lg px-3 py-2.5 text-sm transition-all duration-300',
                                  active
                                    ? 'bg-cyan-500/15 text-cyan-100 border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                                    : modDone === mod.lessons.length && mod.lessons.length > 0
                                      ? 'text-emerald-300/90 border border-emerald-500/30 bg-emerald-500/5'
                                      : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-700/40 hover:border-slate-600/60',
                                ].join(' ')}
                              >
                                <span className="font-medium block truncate">{mod.title}</span>
                                <span className="text-[10px] text-slate-500 mt-0.5 block transition-all duration-300">
                                  {modDone > 0 ? (
                                    <span className={modDone === mod.lessons.length ? 'text-emerald-400' : ''}>
                                      {modDone}/{mod.lessons.length} complete
                                    </span>
                                  ) : (
                                    <span>{mod.lessons.length} lessons</span>
                                  )}
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  )
}
