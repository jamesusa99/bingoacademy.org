import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { Play, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { computeLabel } from '../../config/ioaiTrainingLab'

const CONSOLE_TONE = {
  normal: 'text-emerald-400/95',
  error: 'text-red-400',
  success: 'text-emerald-300',
  hint: 'text-amber-300',
}

export default function NotebookPane({
  lab,
  code,
  onChange,
  onRun,
  onSubmitCheck,
  onClear,
  output,
  outputTone = 'normal',
  running,
  checking = false,
  pyodideLoading = false,
  pyodideError,
}) {
  const isLite = lab?.runtime === 'jupyterlite'
  const busy = pyodideLoading || running || checking

  const runDisabled = busy || Boolean(pyodideError)
  const runLabel = pyodideLoading
    ? 'Initializing Python Engine…'
    : running
      ? 'Running…'
      : 'Run Code'

  const checkLabel = checking ? 'Checking…' : 'Submit & Check'

  return (
    <div className="ioai-notebook-pane flex-1 min-h-0 lg:w-1/2 lg:flex-none flex flex-col bg-slate-950">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-slate-700 bg-slate-900/90 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-400">workspace.py</span>
          <span
            className={`px-2 py-0.5 rounded-full font-semibold transition-colors duration-300 ${
              pyodideLoading
                ? 'bg-amber-500/20 text-amber-300'
                : lab?.compute === 'cpu'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-violet-500/20 text-violet-300'
            }`}
          >
            {pyodideLoading
              ? 'Python: Loading…'
              : lab?.compute === 'cpu'
                ? 'CPU: Ready'
                : 'GPU T4: Running (2h limit)'}
          </span>
        </div>
        {lab ? <span className="text-slate-500">{computeLabel(lab.compute)}</span> : null}
      </div>

      {pyodideError ? (
        <div className="shrink-0 px-3 py-2 bg-red-950/50 border-b border-red-800/40 text-[11px] text-red-300">
          Failed to load Python engine: {pyodideError}
        </div>
      ) : isLite ? (
        <div className="shrink-0 px-3 py-2 bg-cyan-950/40 border-b border-cyan-800/30 text-[11px] text-cyan-200/90">
          {pyodideLoading
            ? 'Loading Pyodide from CDN — first run may take a few seconds…'
            : 'Pyodide · Python runs in your browser — zero server setup'}
        </div>
      ) : (
        <div className="shrink-0 px-3 py-2 bg-violet-950/40 border-b border-violet-800/30 text-[11px] text-violet-200/90">
          Cloud notebook · PyTorch pre-installed · Railway / Modal backend (coming online)
        </div>
      )}

      <div className="flex-1 min-h-[200px] flex flex-col border-b border-slate-800">
        <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 bg-slate-900/80 border-b border-slate-800">
          <span className="text-slate-500 font-mono text-xs">Editor</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRun}
              disabled={runDisabled}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 transition-all duration-200 max-w-[200px] sm:max-w-none"
            >
              {pyodideLoading || running ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden />
              )}
              <span className="truncate">{runLabel}</span>
            </button>
            <button
              type="button"
              onClick={onSubmitCheck}
              disabled={runDisabled}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-50 transition-all duration-200 shadow-[0_0_0_0_rgba(251,191,36,0)] hover:shadow-[0_0_16px_rgba(251,191,36,0.35)]"
            >
              {checking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden />
              )}
              <span className="truncate">{checkLabel}</span>
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto">
          <CodeMirror
            value={code}
            height="100%"
            theme={vscodeDark}
            extensions={[python()]}
            onChange={onChange}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
              indentOnInput: true,
            }}
            className="h-full text-sm"
          />
        </div>
      </div>

      <div className="flex-1 min-h-[140px] max-h-[45%] lg:max-h-none flex flex-col">
        <div className="shrink-0 flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
          <span className="text-slate-500 font-mono text-xs">Console Output</span>
          <button
            type="button"
            onClick={onClear}
            disabled={!output}
            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-3 h-3" aria-hidden />
            Clear
          </button>
        </div>
        <div
          className={`ioai-console flex-1 min-h-0 overflow-auto bg-black p-4 font-mono text-xs sm:text-sm whitespace-pre-wrap transition-colors duration-500 ${CONSOLE_TONE[outputTone] || CONSOLE_TONE.normal} ${outputTone === 'success' ? 'ioai-console--success' : ''} ${outputTone === 'hint' ? 'ioai-console--hint' : ''}`}
        >
          {output || <span className="text-slate-600 italic">Run your code to see output here…</span>}
        </div>
      </div>
    </div>
  )
}
