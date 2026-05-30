import { useEffect } from 'react'

const DEFAULT_TITLE = 'Bingo Academy — AI Courses & Labs'
const DEFAULT_DESC =
  'AI courses, exploration labs, and certification for self-learners, IOAI competition teams, and K12 schools.'

/**
 * Sets document title + meta description. Optional JSON-LD for SEO.
 */
export default function PageMeta({ title, description, jsonLd }) {
  const fullTitle = title || DEFAULT_TITLE
  const desc = description || DEFAULT_DESC

  useEffect(() => {
    document.title = fullTitle

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = desc
  }, [fullTitle, desc])

  useEffect(() => {
    if (!jsonLd) return undefined
    const id = 'page-json-ld'
    let el = document.getElementById(id)
    if (!el) {
      el = document.createElement('script')
      el.id = id
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(jsonLd)
    return () => {
      el?.remove()
    }
  }, [jsonLd])

  return null
}
