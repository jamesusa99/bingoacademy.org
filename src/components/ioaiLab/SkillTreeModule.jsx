import { Link } from 'react-router-dom'
import { labsForModule, isModuleUnlocked, labSessionPath } from '../../config/ioaiTrainingLab'

const MODULE_STYLES = {
  amber: 'border-amber-500/40 bg-amber-500/5',
  cyan: 'border-cyan-500/40 bg-cyan-500/5',
  violet: 'border-violet-500/40 bg-violet-500/5',
}

export default function SkillTreeModule({ module, progress }) {
  const labs = labsForModule(module.id)
  const unlocked = isModuleUnlocked(module.id, progress)

  return (
    <section className={`ioai-lab-module rounded-2xl border-2 p-5 sm:p-6 ${MODULE_STYLES[module.color]}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Module {module.letter} · {module.subtitle}
          </p>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-1">
            <span>{module.icon}</span> {module.title}
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">{module.goal}</p>
        </div>
        {!unlocked ? (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30">
            🔒 Locked
          </span>
        ) : (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ✓ Unlocked
          </span>
        )}
      </div>

      {!unlocked && module.unlockRequirement ? (
        <p className="text-xs text-amber-200/80 mb-4 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/20">
          {module.unlockRequirement}
        </p>
      ) : null}

      <ol className="space-y-2">
        {labs.map((lab) => {
          const done = progress.completedLabs.includes(lab.id)
          const disabled = !unlocked
          return (
            <li key={lab.id}>
              {disabled ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/50 px-4 py-3 opacity-60">
                  <span className="text-lg grayscale">{done ? '✅' : '🔒'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-400">
                      Lab {lab.number}: {lab.title}
                    </p>
                    <p className="text-xs text-slate-500">{lab.subtitle}</p>
                  </div>
                </div>
              ) : (
                <Link
                  to={labSessionPath(lab.id)}
                  className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 hover:border-cyan-500/50 hover:bg-slate-800/80 transition group"
                >
                  <span className="text-lg">{done ? '✅' : lab.number}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition">
                      Lab {lab.number}: {lab.title}
                    </p>
                    <p className="text-xs text-slate-400">{lab.subtitle} · {lab.duration}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">{lab.runtime}</span>
                  <span className="text-cyan-400 text-sm shrink-0" aria-hidden>
                    →
                  </span>
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
