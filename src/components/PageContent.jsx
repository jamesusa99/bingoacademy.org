/** Main page body — full width with fluid side padding (mobile-safe). */
export default function PageContent({ children, className = '' }) {
  return <div className={`page-content w-full ${className}`.trim()}>{children}</div>
}
