import { useEffect } from 'react'
import { ORG_JSON_LD } from '../config/programs'

export default function PageMeta({ title, description, jsonLd }) {
  useEffect(() => {
    if (title) document.title = title
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    if (description) meta.setAttribute('content', description)

    const scriptId = 'page-json-ld'
    let script = document.getElementById(scriptId)
    const payload = jsonLd ?? (title?.includes('Bingo Academy') && !jsonLd ? ORG_JSON_LD : null)
    if (!payload) {
      script?.remove()
      return
    }
    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(payload)
  }, [title, description, jsonLd])

  return null
}
