export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const windowSize = 5
  let start = Math.max(1, currentPage - Math.floor(windowSize / 2))
  let end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)

  const pages = []
  for (let p = start; p <= end; p += 1) pages.push(p)

  return (
    <nav className="course-pagination flex flex-wrap justify-center items-center gap-2 mt-8" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="course-pagination__btn"
      >
        ← Previous
      </button>
      {start > 1 ? (
        <>
          <button type="button" onClick={() => onPageChange(1)} className="course-pagination__btn">
            1
          </button>
          {start > 2 ? <span className="text-slate-500 px-1">…</span> : null}
        </>
      ) : null}
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`course-pagination__btn ${page === currentPage ? 'course-pagination__btn--active' : ''}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      {end < totalPages ? (
        <>
          {end < totalPages - 1 ? <span className="text-slate-500 px-1">…</span> : null}
          <button type="button" onClick={() => onPageChange(totalPages)} className="course-pagination__btn">
            {totalPages}
          </button>
        </>
      ) : null}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="course-pagination__btn"
      >
        Next →
      </button>
    </nav>
  )
}
