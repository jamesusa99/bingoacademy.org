export default function AuthAlert({ variant = 'error', children }) {
  const styles =
    variant === 'success'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : variant === 'info'
        ? 'bg-sky-50 border-sky-200 text-sky-800'
        : 'bg-red-50 border-red-200 text-red-700'

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`} role="alert">
      {children}
    </div>
  )
}
