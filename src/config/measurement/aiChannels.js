/**
 * AI search / assistant referral detection.
 * ChatGPT search adds utm_source=chatgpt.com on outbound links.
 */

export const AI_CHANNEL_DEFS = {
  ai_chatgpt: {
    label: 'ChatGPT',
    utmSources: ['chatgpt.com', 'chatgpt', 'openai'],
    referrerHosts: ['chatgpt.com', 'chat.openai.com', 'openai.com'],
    dashboard: 'Google Search Console → Generative AI performance',
  },
  ai_bing: {
    label: 'Bing / Copilot',
    utmSources: ['bing', 'copilot', 'microsoft'],
    referrerHosts: ['bing.com', 'copilot.microsoft.com', 'www.bing.com'],
    dashboard: 'Bing Webmaster Tools → AI Performance',
  },
  ai_perplexity: {
    label: 'Perplexity',
    utmSources: ['perplexity', 'perplexity.ai'],
    referrerHosts: ['perplexity.ai', 'www.perplexity.ai'],
    dashboard: 'Manual query logs + referrer in analytics_events',
  },
  ai_other: {
    label: 'Other AI assistant',
    utmSources: ['you.com', 'phind', 'gemini', 'claude'],
    referrerHosts: ['you.com', 'phind.com', 'gemini.google.com', 'claude.ai'],
    dashboard: 'Referrer + utm in analytics_events',
  },
}

export const ORGANIC_SEARCH_HOSTS = [
  'google.',
  'bing.com',
  'yahoo.',
  'duckduckgo.com',
  'baidu.com',
  'yandex.',
]
