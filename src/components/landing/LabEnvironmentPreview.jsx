/** Static mock of the IOAI dual-pane Jupyter lab — for /ioai-masterclass landing. */

const SAMPLE_CODE = `# IOAI Lab 1 — Python lists
ioai_topics = [
    "computer vision",
    "natural language",
    "reinforcement learning",
]

for i, topic in enumerate(ioai_topics, 1):
    print(f"{i}. {topic}")`

export default function LabEnvironmentPreview() {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 h-11 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-bold text-white truncate">
            BingoAcademy IOAI Lab
            <span className="text-slate-600 font-normal mx-1.5">·</span>
            <span className="text-cyan-400">Lab 1: Python for AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-[10px] text-slate-500 tabular-nums">1/12 labs</span>
          <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-[8%] rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" />
          </div>
          <span className="text-[10px] font-semibold text-cyan-400 tabular-nums">8%</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[320px] sm:min-h-[380px]">
        <div className="flex-1 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/50 p-4 sm:p-5 overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-500/80 mb-3">Tutorial</p>
          <h3 className="text-sm font-bold text-white mb-2">Python Lists for IOAI</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Competition scripts rely on clean list operations. Build{' '}
            <code className="text-cyan-300/90 bg-slate-800 px-1 rounded">ioai_topics</code> with exactly three
            strings — then run cells on the right.
          </p>
          <ul className="text-[11px] text-slate-500 space-y-1.5 list-disc pl-4">
            <li>List comprehensions for compact transforms</li>
            <li>Try/except so one bad row does not crash your exam block</li>
            <li>Submit &amp; Check — instant autograder feedback</li>
          </ul>
        </div>

        <div className="flex-1 flex flex-col bg-slate-950 min-h-[220px]">
          <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-slate-800 text-[10px]">
            <span className="font-mono text-slate-500">workspace.py</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">CPU · Pyodide</span>
          </div>
          <pre className="flex-1 p-3 sm:p-4 text-[11px] sm:text-xs font-mono text-emerald-100/90 leading-relaxed overflow-auto">
            {SAMPLE_CODE}
          </pre>
          <div className="shrink-0 border-t border-slate-800 p-3 bg-slate-900/80">
            <div className="flex gap-2 mb-2">
              <span className="text-[10px] px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-semibold">Run Code</span>
              <span className="text-[10px] px-3 py-1.5 rounded-lg bg-violet-600 text-white font-semibold">
                Submit &amp; Check
              </span>
            </div>
            <p className="text-[10px] font-mono text-emerald-400/90">
              1. computer vision
              <br />
              2. natural language
              <br />
              3. reinforcement learning
              <br />
              <span className="text-emerald-300">✅ Correct! You have mastered Python lists.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
