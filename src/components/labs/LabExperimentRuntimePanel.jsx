import { Link } from 'react-router-dom'
import { hasExperimentRuntime, normalizeRuntimeConfig, runtimeTypeLabel } from '../../config/labExperimentRuntime'
import { LAB_EXPERIMENTS_PORTAL } from '../../config/labExperiments'

export default function LabExperimentRuntimePanel({ runtimeConfig, owned }) {
  const config = normalizeRuntimeConfig(runtimeConfig)
  if (!hasExperimentRuntime(config)) return null

  if (!owned) {
    return (
      <div className="lab-workspace__stage lab-workspace__stage--empty">
        <p className="text-sm text-slate-500">{LAB_EXPERIMENTS_PORTAL.runtimeLocked}</p>
      </div>
    )
  }

  const height = config.embedHeight || 520

  if (config.type === 'external_link') {
    return (
      <div className="lab-workspace__stage flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-slate-400">{runtimeTypeLabel(config.type, 'en')}</p>
        <a
          href={config.url}
          target={config.openInNewTab ? '_blank' : undefined}
          rel={config.openInNewTab ? 'noopener noreferrer' : undefined}
          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm px-6 py-3 transition"
        >
          {LAB_EXPERIMENTS_PORTAL.openRuntimeLink}
        </a>
      </div>
    )
  }

  if (config.type === 'programming' && config.labId) {
    return (
      <div className="lab-workspace__stage flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-slate-400">{LAB_EXPERIMENTS_PORTAL.runtimeProgramming}</p>
        <Link
          to={`/labs/ioai/training-lab/${encodeURIComponent(config.labId)}`}
          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm px-6 py-3 transition"
        >
          {LAB_EXPERIMENTS_PORTAL.startProgramming} →
        </Link>
      </div>
    )
  }

  if (config.type === 'interactive') {
    const href = config.internalPath || config.url
    if (href?.startsWith('/')) {
      return (
        <div className="lab-workspace__runtime-frame" style={{ minHeight: height }}>
          <iframe title="Interactive lab" src={href} className="w-full h-full min-h-[inherit] border-0 rounded-xl" />
        </div>
      )
    }
    if (config.url) {
      return (
        <div className="lab-workspace__runtime-frame" style={{ minHeight: height }}>
          <iframe title="Interactive lab" src={config.url} className="w-full h-full min-h-[inherit] border-0 rounded-xl" allow="camera; microphone; fullscreen" />
        </div>
      )
    }
  }

  if (config.type === 'install_package' && config.url) {
    return (
      <div className="lab-workspace__stage flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-slate-400">{LAB_EXPERIMENTS_PORTAL.runtimeDownload}</p>
        <a
          href={config.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm px-6 py-3 transition"
        >
          {config.downloadLabel || LAB_EXPERIMENTS_PORTAL.downloadFile}
        </a>
      </div>
    )
  }

  if ((config.type === 'iframe' || config.type === 'html_page') && config.url) {
    return (
      <div className="lab-workspace__runtime-frame" style={{ minHeight: height }}>
        <iframe
          title={LAB_EXPERIMENTS_PORTAL.runtimeIframeTitle}
          src={config.url}
          className="w-full h-full min-h-[inherit] border-0 rounded-xl bg-white"
          allow="camera; microphone; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
        />
      </div>
    )
  }

  return (
    <div className="lab-workspace__stage lab-workspace__stage--empty">
      <p className="text-sm text-slate-500">{LAB_EXPERIMENTS_PORTAL.runtimeNotConfigured}</p>
    </div>
  )
}
