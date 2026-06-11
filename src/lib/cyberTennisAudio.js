/** Web Audio synth "pong" for cyber tennis hits */

export function createPongAudio() {
  let ctx = null

  function ensureContext() {
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return null
      ctx = new Ctx()
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    return ctx
  }

  function playPong({ combo = 1 } = {}) {
    const audio = ensureContext()
    if (!audio) return

    const t = audio.currentTime
    const baseFreq = 320 + Math.min(combo, 12) * 18

    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(baseFreq, t)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, t + 0.04)

    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)

    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start(t)
    osc.stop(t + 0.15)
  }

  function dispose() {
    ctx?.close?.()
    ctx = null
  }

  return { playPong, dispose }
}
