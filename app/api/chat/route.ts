import { handleChatRequest } from '../../../lib/guardChat.js'

/**
 * Next.js App Router API route (Vercel AI SDK).
 * For the Vite dev server, the same handler runs via server/index.mjs at POST /api/chat.
 */
export async function POST(req: Request) {
  const body = await req.json()
  return handleChatRequest(body)
}
