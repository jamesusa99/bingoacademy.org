function renderInline(text) {
  return text
}

export default function IoaiQuestionStem({ stem }) {
  const parts = String(stem || '').split(/```(?:python)?\n?/)
  if (parts.length === 1) {
    return <p className="text-base text-bingo-dark leading-relaxed whitespace-pre-wrap">{stem}</p>
  }

  return (
    <div className="space-y-3">
      {parts.map((chunk, index) => {
        const trimmed = chunk.replace(/\n```$/, '').replace(/```$/, '')
        if (!trimmed.trim()) return null
        if (index % 2 === 1) {
          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-xl bg-slate-950 text-slate-100 text-[12px] sm:text-[13px] leading-relaxed p-4 border border-slate-800"
            >
              <code className="whitespace-pre">{trimmed.replace(/\n$/, '')}</code>
            </pre>
          )
        }
        return (
          <p key={index} className="text-base text-bingo-dark leading-relaxed whitespace-pre-wrap">
            {renderInline(trimmed.trim())}
          </p>
        )
      })}
    </div>
  )
}
