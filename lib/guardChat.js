import { convertToModelMessages, streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { GUARD_SYSTEM_PROMPT } from '../src/config/guardPrompt.js'

export { GUARD_SYSTEM_PROMPT }

/**
 * @param {{ messages: import('ai').UIMessage[] }} body
 * @returns {Promise<Response>}
 */
export async function handleChatRequest(body) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      {
        error:
          'OPENAI_API_KEY is not configured. Add it to .env.local (dev) or Railway/Vercel environment variables.',
      },
      { status: 503 }
    )
  }

  const { messages } = body ?? {}
  if (!Array.isArray(messages)) {
    return Response.json({ error: 'messages array required' }, { status: 400 })
  }

  const result = streamText({
    model: openai(process.env.OPENAI_MODEL || 'gpt-4o-mini'),
    system: GUARD_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
