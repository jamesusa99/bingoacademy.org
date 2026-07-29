/**
 * Vercel serverless — Prompt Wizard knight chat
 */
import { handleKnightChatRequest } from '../lib/knightChat.js'

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const body = await request.json()
    return await handleKnightChatRequest(body)
  } catch (err) {
    console.error('[api/knight-chat]', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Knight chat failed' },
      { status: 500 }
    )
  }
}
