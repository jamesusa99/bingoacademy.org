export default function AdminAlert({ type = 'info', children, onDismiss }) {
  const styles = {
    info: 'bg-sky-50 border-sky-200 text-sky-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-red-50 border-red-200 text-red-900',
  }

  return (
    <div className={`mb-4 rounded-xl border px-4 py-3 text-sm flex items-start justify-between gap-3 ${styles[type] || styles.info}`}>
      <div>{children}</div>
      {onDismiss ? (
        <button type="button" onClick={onDismiss} className="text-current opacity-60 hover:opacity-100" aria-label="Dismiss">
          ×
        </button>
      ) : null}
    </div>
  )
}
