/**
 * Vercel serverless handler — same logic as app/api/chat/route.ts
 */
import { handleChatRequest } from '../lib/guardChat.js'

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const body = await request.json()
    return await handleChatRequest(body)
  } catch (err) {
    console.error('[api/chat]', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Chat request failed' },
      { status: 500 }
    )
  }
}
