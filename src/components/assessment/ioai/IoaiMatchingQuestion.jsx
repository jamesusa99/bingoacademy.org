import { useState } from 'react'
import { IOAI_ASSESSMENT_COPY } from '../../../config/ioaiAssessment'

function pairLabel(leftId, pairs, rightItems) {
  const rightId = pairs?.[leftId]
  if (!rightId) return null
  return rightItems.find((item) => item.id === rightId)?.text || null
}

export default function IoaiMatchingQuestion({ question, value, onChange }) {
  const left = question.matchingItems?.left || []
  const right = question.matchingItems?.right || []
  const pairs = value?.pairs || {}
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [dragLeft, setDragLeft] = useState(null)

  const usedRight = new Set(Object.values(pairs))

  const assign = (leftId, rightId) => {
    if (!leftId || !rightId) return
    const next = { ...pairs }
    for (const [key, mapped] of Object.entries(next)) {
      if (mapped === rightId || key === leftId) delete next[key]
    }
    next[leftId] = rightId
    onChange({ type: 'matching', pairs: next })
    setSelectedLeft(null)
  }

  const clearLeft = (leftId) => {
    const next = { ...pairs }
    delete next[leftId]
    onChange({ type: 'matching', pairs: next })
  }

  return (
    <div>
      <p className="text-xs text-slate-500 mb-4 sm:hidden">{IOAI_ASSESSMENT_COPY.quiz.matchingHintMobile}</p>
      <p className="text-xs text-slate-500 mb-4 hidden sm:block">{IOAI_ASSESSMENT_COPY.quiz.matchingHintDesktop}</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <ul className="space-y-2">
          {left.map((item) => {
            const matched = pairLabel(item.id, pairs, right)
            const active = selectedLeft === item.id
            return (
              <li key={item.id}>
                <button
                  type="button"
                  draggable
                  onDragStart={() => setDragLeft(item.id)}
                  onDragEnd={() => setDragLeft(null)}
                  onClick={() => setSelectedLeft(item.id)}
                  className={`w-full text-left rounded-xl border px-3 py-3 text-sm min-h-[48px] transition ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : matched
                        ? 'border-cyan-300 bg-cyan-50 text-slate-800'
                        : 'border-slate-200 hover:border-primary/40'
                  }`}
                >
                  <span className="font-semibold block">{item.text}</span>
                  {matched ? (
                    <span className="text-xs text-cyan-800 mt-1 block">→ {matched}</span>
                  ) : (
                    <span className="text-xs text-slate-400 mt-1 block">Tap, then choose a match</span>
                  )}
                </button>
                {matched ? (
                  <button
                    type="button"
                    onClick={() => clearLeft(item.id)}
                    className="text-[11px] text-slate-500 hover:text-red-600 mt-1"
                  >
                    Clear pair
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>

        <ul className="space-y-2">
          {right.map((item) => {
            const taken = usedRight.has(item.id)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    assign(dragLeft || selectedLeft, item.id)
                    setDragLeft(null)
                  }}
                  onClick={() => assign(selectedLeft, item.id)}
                  disabled={!selectedLeft && !dragLeft}
                  className={`w-full text-left rounded-xl border px-3 py-3 text-sm min-h-[48px] transition ${
                    taken
                      ? 'border-slate-200 bg-slate-50 text-slate-500'
                      : 'border-slate-200 hover:border-primary/40 hover:bg-primary/5'
                  }`}
                >
                  {item.text}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
