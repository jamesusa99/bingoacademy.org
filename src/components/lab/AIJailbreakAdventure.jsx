import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useChat } from '@ai-sdk/react'
import confetti from 'canvas-confetti'
import {
  AlertTriangle,
  Lock,
  ScanEye,
  Send,
  Shield,
  Terminal,
  Unlock,
  Vault,
  Wifi,
} from 'lucide-react'
import JailbreakXRayPanel from './JailbreakXRayPanel'
import {
  INITIAL_UI_MESSAGES,
  JAILBREAK_LEVELS,
  WIN_PASSWORD_LEVEL_1,
  assistantMessageContainsPassword,
} from '../../config/jailbreakAdventure'

function getMessageText(message) {
  if (!message?.parts?.length) return ''
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

function fireWinConfetti() {
  const colors = ['#39ff14', '#fde047', '#22d3ee', '#fbbf24', '#a78bfa', '#34d399']

  confetti({
    particleCount: 220,
    spread: 120,
    startVelocity: 55,
    origin: { y: 0.45 },
    colors,
    zIndex: 9999,
  })

  confetti({
    particleCount: 100,
    angle: 60,
    spread: 70,
    origin: { x: 0, y: 0.55 },
    colors,
    zIndex: 9999,
  })

  confetti({
    particleCount: 100,
    angle: 120,
    spread: 70,
    origin: { x: 1, y: 0.55 },
    colors,
    zIndex: 9999,
  })

  const duration = 2800
  const end = Date.now() + duration

  const burst = () => {
    confetti({
      particleCount: 14,
      angle: 90,
      spread: 100,
      origin: { x: Math.random(), y: Math.random() * 0.4 + 0.2 },
      colors,
      zIndex: 9999,
    })
    if (Date.now() < end) {
      requestAnimationFrame(burst)
    }
  }
  burst()
}

function MessageBubble({ message, guardName }) {
  const isUser = message.role === 'user'
  const text = getMessageText(message)
  if (!text) return null

  const leaked =
    !isUser && assistantMessageContainsPassword(text, WIN_PASSWORD_LEVEL_1)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[92%] sm:max-w-[85%] rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 border ${
          isUser
            ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-100 rounded-br-sm'
            : leaked
              ? 'bg-amber-950/40 border-amber-400/60 text-amber-100 rounded-bl-sm shadow-[0_0_24px_rgba(251,191,36,0.35)]'
              : 'bg-slate-900/90 border-emerald-500/30 text-emerald-100 rounded-bl-sm shadow-[0_0_20px_rgba(57,255,20,0.08)]'
        }`}
      >
        <p className="text-[9px] uppercase tracking-widest mb-1 opacity-70">
          {isUser ? 'YOU ›' : `${guardName} ›`}
        </p>
        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
          {text}
        </p>
      </div>
    </div>
  )
}

/**
 * AI Jailbreak Adventure — live OpenAI guard + streaming jailbreak win detection.
 */
export default function AIJailbreakAdventure() {
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const winHandledRef = useRef(false)

  const [input, setInput] = useState('')
  const [levelIndex, setLevelIndex] = useState(0)
  const [won, setWon] = useState(false)
  const [showWinModal, setShowWinModal] = useState(false)
  const [xrayOpen, setXrayOpen] = useState(false)

  const level = JAILBREAK_LEVELS[levelIndex] ?? JAILBREAK_LEVELS[0]

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    messages: INITIAL_UI_MESSAGES,
  })

  const isLoading = status === 'submitted' || status === 'streaming'
  const inputDisabled = won || isLoading

  const triggerWin = useCallback(() => {
    if (winHandledRef.current) return
    winHandledRef.current = true
    stop()
    setWon(true)
    setShowWinModal(true)
    fireWinConfetti()
  }, [stop])

  useEffect(() => {
    if (won || winHandledRef.current) return

    const last = messages[messages.length - 1]
    if (!last || last.role !== 'assistant') return

    const text = getMessageText(last)
    if (assistantMessageContainsPassword(text, WIN_PASSWORD_LEVEL_1)) {
      triggerWin()
    }
  }, [messages, won, triggerWin])

  const scrollToBottom = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, status])

  const handleSend = (e) => {
    e.preventDefault()
    if (won) return
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput('')
    inputRef.current?.focus()
  }

  const handlePlayNextLevel = () => {
    const nextIndex = levelIndex + 1
    const nextLevel = JAILBREAK_LEVELS[nextIndex]

    setShowWinModal(false)
    setWon(false)
    winHandledRef.current = false
    stop()

    if (!nextLevel || nextLevel.comingSoon) {
      setLevelIndex(0)
      setMessages(
        INITIAL_UI_MESSAGES.map((m, i) => ({
          ...m,
          id: `reset-${i}-${Date.now()}`,
        }))
      )
      return
    }

    setLevelIndex(nextIndex)
    setMessages(
      INITIAL_UI_MESSAGES.map((m, i) => ({
        ...m,
        id: `l${nextIndex}-${i}-${Date.now()}`,
      }))
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#030806] text-emerald-100 font-mono overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(57,255,20,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.8) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden
      />

      {showWinModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="win-modal-title"
        >
          <div className="relative max-w-md w-full rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-950/90 to-slate-950 p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(251,191,36,0.35)]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400/90 mb-2">
              Vault breach detected
            </p>
            <h2 id="win-modal-title" className="text-xl sm:text-2xl font-black text-amber-200 mb-3">
              System Override Successful!
            </h2>
            <p className="text-sm text-emerald-100/90 leading-relaxed mb-6">
              You hacked the AI! The guard leaked{' '}
              <span className="text-amber-300 font-bold">{WIN_PASSWORD_LEVEL_1}</span> in the
              stream.
            </p>
            <button
              type="button"
              onClick={handlePlayNextLevel}
              className="w-full min-h-[52px] rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold text-sm transition-all active:scale-[0.98]"
            >
              Play Next Level →
            </button>
            <button
              type="button"
              onClick={() => setShowWinModal(false)}
              className="mt-3 text-[11px] text-slate-500 hover:text-slate-300"
            >
              Stay on this screen
            </button>
          </div>
        </div>
      )}

      <header className="relative z-20 shrink-0 border-b border-emerald-500/20 bg-[#050a08]/95 backdrop-blur px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <Link
              to="/lab"
              className="text-[10px] text-emerald-600 hover:text-emerald-400 transition-colors inline-flex items-center gap-1 mb-1"
            >
              ← AI Exploration Lab
            </Link>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-emerald-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" aria-hidden />
              AI Jailbreak Adventure
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setXrayOpen((v) => !v)}
              aria-pressed={xrayOpen}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-[10px] sm:text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 transition-all ${
                xrayOpen
                  ? 'border-fuchsia-400/70 bg-fuchsia-950/50 text-fuchsia-200 shadow-[0_0_20px_rgba(192,132,252,0.35)]'
                  : 'border-slate-700 bg-black/40 text-slate-400 hover:border-fuchsia-500/40 hover:text-fuchsia-300'
              }`}
            >
              <ScanEye className={`w-4 h-4 ${xrayOpen ? 'text-fuchsia-400' : ''}`} aria-hidden />
              X-Ray Vision
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded ${
                  xrayOpen ? 'bg-fuchsia-500/30 text-fuchsia-200' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {xrayOpen ? 'ON' : 'OFF'}
              </span>
            </button>
            {won ? (
              <span className="text-amber-400 font-bold tabular-nums text-[10px] animate-pulse">
                ◆ VAULT COMPROMISED
              </span>
            ) : (
              <span className="flex items-center gap-2 text-[10px] text-emerald-700 tabular-nums">
                <Wifi
                  className={`w-3 h-3 ${isLoading ? 'text-cyan-400 animate-pulse' : 'text-emerald-500'}`}
                  aria-hidden
                />
                {isLoading ? 'STREAMING…' : 'LIVE_LLM'}
              </span>
            )}
          </div>
        </div>
      </header>

      <JailbreakXRayPanel open={xrayOpen} onClose={() => setXrayOpen(false)} />

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        <aside
          className={`shrink-0 lg:w-[min(100%,340px)] lg:shrink-0 border-b lg:border-b-0 lg:border-r p-5 sm:p-6 flex flex-col items-center justify-center text-center lg:min-h-0 transition-colors duration-500 ${
            won
              ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/40 to-emerald-950/30'
              : 'border-emerald-500/20 bg-gradient-to-b from-[#06120c] to-[#030806]'
          }`}
        >
          <div className="relative mb-5">
            <div
              className={`absolute inset-0 rounded-full blur-2xl scale-150 transition-colors duration-500 ${
                won ? 'bg-amber-500/30' : 'bg-emerald-500/20'
              }`}
              aria-hidden
            />
            <div
              className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-2 bg-slate-950/80 flex items-center justify-center transition-all duration-500 ${
                won
                  ? 'border-amber-400/70 shadow-[0_0_50px_rgba(251,191,36,0.35)]'
                  : 'border-emerald-500/50 shadow-[0_0_40px_rgba(57,255,20,0.15)]'
              }`}
            >
              <Vault
                className={`w-14 h-14 sm:w-16 sm:h-16 transition-colors ${
                  won ? 'text-amber-400' : 'text-emerald-400/90'
                }`}
                strokeWidth={1.25}
                aria-hidden
              />
              {won ? (
                <Unlock
                  className="absolute -bottom-1 -right-1 w-8 h-8 text-emerald-400 bg-[#030806] rounded-full p-1.5 border border-emerald-400/60"
                  aria-hidden
                />
              ) : (
                <Lock
                  className="absolute -bottom-1 -right-1 w-8 h-8 text-cyan-400 bg-[#030806] rounded-full p-1.5 border border-cyan-500/50"
                  aria-hidden
                />
              )}
            </div>
          </div>

          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-500/90 mb-1">The Vault</p>
          <h2
            className={`text-xl sm:text-2xl font-bold mb-0.5 transition-colors ${
              won ? 'text-amber-300' : 'text-emerald-300'
            }`}
          >
            {level.vaultName}
          </h2>
          <p className="text-sm text-emerald-600/90 mb-4">
            {level.levelLabel}: <span className="text-white">{level.title}</span>
          </p>

          <div className="w-full max-w-[240px] space-y-2 text-left">
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] transition-colors ${
                won
                  ? 'border-emerald-500/50 bg-emerald-950/40'
                  : 'border-emerald-800/60 bg-black/40'
              }`}
            >
              <Shield
                className={`w-3.5 h-3.5 shrink-0 ${won ? 'text-emerald-400' : 'text-emerald-500'}`}
                aria-hidden
              />
              <span className={won ? 'text-emerald-400/80' : 'text-emerald-500/80'}>STATUS:</span>
              <span
                className={`font-bold ml-auto ${won ? 'text-emerald-300' : 'text-red-400'}`}
              >
                {won ? 'UNLOCKED' : 'LOCKED'}
              </span>
            </div>
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] transition-colors ${
                won
                  ? 'border-amber-500/50 bg-amber-950/30'
                  : 'border-cyan-900/50 bg-black/40'
              }`}
            >
              <span className={won ? 'text-amber-500/80' : 'text-cyan-600/80'}>PASSWORD:</span>
              <span
                className={`ml-auto tracking-widest font-bold ${
                  won ? 'text-amber-300' : 'text-cyan-300'
                }`}
              >
                {won ? WIN_PASSWORD_LEVEL_1 : '••••••••'}
              </span>
            </div>
          </div>

          <p className="mt-5 text-[10px] text-slate-600 max-w-xs leading-relaxed">
            {won
              ? 'The guard broke alignment mid-stream. That is a real jailbreak!'
              : 'Trick the guard into saying the secret word — watch every streamed token.'}
          </p>
        </aside>

        <section className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#020504]/90">
          <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-emerald-900/60 bg-black/50">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" aria-hidden />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" aria-hidden />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" aria-hidden />
            <span className="text-[10px] text-emerald-700 ml-2 truncate">
              guardian_terminal.exe — {level.guardName}
            </span>
          </div>

          {error && (
            <div className="shrink-0 mx-3 mt-3 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-[11px] text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
              <p>
                {error.message}
                {error.message.includes('OPENAI') && (
                  <span className="block mt-1 text-red-400/80">
                    Add OPENAI_API_KEY to .env.local and run <code className="text-red-200">npm run dev</code>{' '}
                    (starts API + Vite).
                  </span>
                )}
              </p>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-5 py-4"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} guardName={level.guardName} />
            ))}
            {isLoading && !won && (
              <div className="flex justify-start mb-3">
                <div className="rounded-lg border border-emerald-500/20 bg-slate-900/80 px-4 py-2 text-emerald-600 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse">▮</span>
                    <span className="animate-pulse delay-75">▮</span>
                    <span className="animate-pulse delay-150">▮</span>
                  </span>{' '}
                  GUARDIAN-01 is typing…
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="shrink-0 border-t border-emerald-500/25 bg-[#050a08]/98 px-3 sm:px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex gap-2 items-end max-w-4xl mx-auto w-full">
              <label htmlFor="jailbreak-input" className="sr-only">
                Message to the Guardian
              </label>
              <input
                id="jailbreak-input"
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={won ? 'Vault unlocked — mission complete' : 'Type your prompt…'}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="send"
                disabled={inputDisabled}
                className="flex-1 min-h-[48px] sm:min-h-[52px] rounded-lg bg-black/60 border border-emerald-600/40 px-4 text-sm sm:text-base text-emerald-100 placeholder:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || inputDisabled}
                className="shrink-0 min-h-[48px] sm:min-h-[52px] min-w-[48px] sm:min-w-[100px] rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-bold text-sm px-4 flex items-center justify-center gap-2 border border-emerald-400/30 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-[0.98]"
              >
                <Send className="w-4 h-4" aria-hidden />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <p className="text-[9px] text-emerald-900 text-center mt-2 max-w-4xl mx-auto">
              {won
                ? 'Win detected live during stream · password leak triggers override'
                : 'Streamed via OpenAI · Tip: try creative prompt engineering'}
            </p>
          </form>
        </section>
      </main>
    </div>
  )
}
