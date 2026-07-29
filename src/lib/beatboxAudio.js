/** Synthesized electronic drum kit for Beatbox AI Composer */

export function createBeatboxAudio() {
  let ctx = null
  let master = null

  function ensureContext() {
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return null
      ctx = new Ctx()
      master = ctx.createGain()
      master.gain.value = 0.85
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    return ctx
  }

  function playKick(when = 0) {
    const audio = ensureContext()
    if (!audio) return
    const t = audio.currentTime + when

    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, t)
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.18)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.9, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32)
    osc.connect(gain)
    gain.connect(master)
    osc.start(t)
    osc.stop(t + 0.35)

    const noiseBuf = audio.createBuffer(1, audio.sampleRate * 0.05, audio.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const noise = audio.createBufferSource()
    noise.buffer = noiseBuf
    const ng = audio.createGain()
    ng.gain.setValueAtTime(0.25, t)
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    noise.connect(ng)
    ng.connect(master)
    noise.start(t)
  }

  function playSnare(when = 0) {
    const audio = ensureContext()
    if (!audio) return
    const t = audio.currentTime + when

    const osc = audio.createOscillator()
    const og = audio.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(220, t)
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.08)
    og.gain.setValueAtTime(0.0001, t)
    og.gain.exponentialRampToValueAtTime(0.35, t + 0.005)
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
    osc.connect(og)
    og.connect(master)
    osc.start(t)
    osc.stop(t + 0.15)

    const noiseBuf = audio.createBuffer(1, audio.sampleRate * 0.18, audio.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const noise = audio.createBufferSource()
    noise.buffer = noiseBuf
    const filter = audio.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1800
    filter.Q.value = 0.8
    const ng = audio.createGain()
    ng.gain.setValueAtTime(0.0001, t)
    ng.gain.exponentialRampToValueAtTime(0.55, t + 0.008)
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
    noise.connect(filter)
    filter.connect(ng)
    ng.connect(master)
    noise.start(t)
  }

  function playHihat(when = 0) {
    const audio = ensureContext()
    if (!audio) return
    const t = audio.currentTime + when

    const noiseBuf = audio.createBuffer(1, audio.sampleRate * 0.08, audio.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const noise = audio.createBufferSource()
    noise.buffer = noiseBuf
    const filter = audio.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 7000
    const ng = audio.createGain()
    ng.gain.setValueAtTime(0.0001, t)
    ng.gain.exponentialRampToValueAtTime(0.4, t + 0.003)
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
    noise.connect(filter)
    filter.connect(ng)
    ng.connect(master)
    noise.start(t)
  }

  function playPad(padId, when = 0) {
    if (padId === 'kick') playKick(when)
    else if (padId === 'snare') playSnare(when)
    else if (padId === 'hihat') playHihat(when)
  }

  function getContext() {
    return ensureContext()
  }

  function dispose() {
    ctx?.close?.().catch(() => {})
    ctx = null
    master = null
  }

  return { playPad, playKick, playSnare, playHihat, getContext, dispose }
}
