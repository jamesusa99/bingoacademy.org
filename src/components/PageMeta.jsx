import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE_BRAND, SITE_DEFAULT_SEO, SITE_OG, SITE_TWITTER, SITE_URL } from '../config/siteSeo'

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function upsertLink(rel, href) {
  if (!href) return
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Sets document title, meta keywords/description, Open Graph, Twitter Card, and optional JSON-LD.
 */
export default function PageMeta({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType,
  canonical,
  jsonLd,
  noindex,
}) {
  const { pathname } = useLocation()

  const fullTitle = title || SITE_DEFAULT_SEO.title
  const desc = description || SITE_DEFAULT_SEO.description
  const kw = keywords || SITE_DEFAULT_SEO.keywords
  const ogT = ogTitle || SITE_OG.title
  const ogD = ogDescription || desc
  const ogImg = ogImage || SITE_OG.image
  const ogU = ogUrl || `${SITE_URL}${pathname === '/' ? '' : pathname}`
  const ogTy = ogType || SITE_OG.type
  const canon = canonical || ogU

  useEffect(() => {
    document.title = fullTitle
    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'keywords', kw)
    if (noindex) {
      upsertMeta('name', 'robots', 'noindex, follow')
    } else {
      const robots = document.querySelector('meta[name="robots"]')
      robots?.remove()
    }

    upsertMeta('property', 'og:title', ogT)
    upsertMeta('property', 'og:description', ogD)
    upsertMeta('property', 'og:image', ogImg)
    upsertMeta('property', 'og:url', ogU)
    upsertMeta('property', 'og:type', ogTy)
    upsertMeta('property', 'og:site_name', SITE_BRAND)

    upsertMeta('name', 'twitter:card', SITE_TWITTER.card)
    upsertMeta('name', 'twitter:title', ogT)
    upsertMeta('name', 'twitter:description', ogD)
    upsertMeta('name', 'twitter:image', ogImg)

    upsertLink('canonical', canon)
  }, [fullTitle, desc, kw, ogT, ogD, ogImg, ogU, ogTy, canon, noindex])

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
