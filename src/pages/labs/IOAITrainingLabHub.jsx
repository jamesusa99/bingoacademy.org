import { Link } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import SkillTreeModule from '../../components/ioaiLab/SkillTreeModule'
import SkillRadar from '../../components/ioaiLab/SkillRadar'
import {
  IOAI_MODULES,
  IOAI_LAB_TAGLINE,
  IOAI_LAB_SUBTITLE,
  IOAI_LAB_HREF,
  skillRadarValues,
} from '../../config/ioaiTrainingLab'
import { useIOAILabProgress } from '../../hooks/useIOAILabProgress'

export default function IOAITrainingLabHub() {
  const { progress, stats } = useIOAILabProgress()
  const radar = skillRadarValues(progress)

  return (
    <div className="ioai-lab-page min-h-[60vh]">
      <PageMeta
        title="IOAI Training Lab — Zero-Setup, Learn by Doing | Bingo Academy"
        description="Kaggle Learn–style IOAI training: Jupyter notebooks in the browser, CPU labs with JupyterLite, GPU labs in the cloud. No local CUDA setup."
      />

      <header className="border-b border-amber-500/20 bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <nav className="text-xs text-slate-400 mb-4 flex flex-wrap gap-2">
            <Link to="/courses/ioai" className="hover:text-cyan-400">
              IOAI Courses
            </Link>
            <span>/</span>
            <Link to="/labs?line=ioai" className="hover:text-cyan-400">
              Labs
            </Link>
            <span>/</span>
            <span className="text-amber-300">Training Lab</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 mb-2">🏕️ IOAI Training Lab</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">{IOAI_LAB_TAGLINE}</h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">{IOAI_LAB_SUBTITLE}</p>

          <div className="flex flex-wrap gap-3 mt-6">
            <div className="rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-3 text-center min-w-[100px]">
              <div className="text-xl font-bold text-white">
                {stats.completedCount}/{stats.totalLabs}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Labs done</div>
            </div>
            <div className="rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-3 text-center min-w-[100px]">
              <div className="text-xl font-bold text-cyan-400">{stats.moduleA.done}/{stats.moduleA.total}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Module A</div>
            </div>
            <div className="rounded-xl bg-slate-800/80 border border-violet-500/30 px-4 py-3 text-center min-w-[100px]">
              <div className="text-xl font-bold text-violet-300">{stats.gpuHours}h</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">GPU bounty</div>
            </div>
          </div>

          {progress.moduleAComplete && stats.gpuHours > 0 ? (
            <p className="mt-4 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2 inline-block">
              🎁 GPU Bounty unlocked — {stats.gpuHours}h T4 for Module B & C labs
            </p>
          ) : (
            <p className="mt-4 text-xs text-slate-400">
              Complete Module A checkpoints (80%+) to unlock <strong className="text-amber-300">10 GPU hours</strong>
            </p>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-white">Skill tree</h2>
            {IOAI_MODULES.map((mod) => (
              <SkillTreeModule key={mod.id} module={mod} progress={progress} />
            ))}
          </div>
          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
              <h3 className="text-sm font-bold text-white mb-1">IOAI skill radar</h3>
              <p className="text-xs text-slate-400 mb-4">Your profile vs national-team readiness</p>
              <SkillRadar values={radar} />
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-300">How it works</p>
              <p>
                <strong className="text-cyan-400">Left:</strong> tutorial with copy-paste snippets
              </p>
              <p>
                <strong className="text-cyan-400">Right:</strong> JupyterLite (CPU) or cloud GPU notebook
              </p>
              <p>
                <strong className="text-cyan-400">Bottom:</strong> hidden auto-grader with hints
              </p>
              <Link to="/exploration" className="inline-block text-violet-400 hover:underline mt-2">
                AI Exploration games are separate →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
