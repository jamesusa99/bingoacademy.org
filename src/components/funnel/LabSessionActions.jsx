import { CloudUpload, Download } from 'lucide-react'

export default function LabSessionActions({ onSaveProgress, onDownloadReport, savedHint = false }) {
  return (
    <div className="border-t border-emerald-500/20 bg-emerald-950/30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-emerald-300/90">
          {savedHint
            ? 'Progress synced to your account ✓'
            : 'Checkpoint cleared — save or export before you leave.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSaveProgress}
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 min-h-[44px]"
          >
            <CloudUpload className="w-4 h-4" aria-hidden />
            Save progress
          </button>
          <button
            type="button"
            onClick={onDownloadReport}
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10 min-h-[44px]"
          >
            <Download className="w-4 h-4" aria-hidden />
            Download lab report
          </button>
        </div>
      </div>
    </div>
  )
}
