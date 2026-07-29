import { handleKnightChatRequest } from '../../../lib/knightChat.js'

/**
 * Optional Next-style route; Vite/API server uses POST /api/knight-chat.
 */
export async function POST(req) {
  const body = await req.json()
  return handleKnightChatRequest(body)
}
