import confetti from 'canvas-confetti'

/** Multi-burst confetti for checkpoint clears */
export function celebrateCheckpoint() {
  const colors = ['#06b6d4', '#10b981', '#fbbf24', '#a78bfa', '#f472b6']
  const duration = 2800
  const end = Date.now() + duration

  confetti({
    particleCount: 100,
    spread: 90,
    startVelocity: 42,
    origin: { y: 0.58 },
    colors,
    ticks: 200,
  })

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 62,
      origin: { x: 0, y: 0.72 },
      colors,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 62,
      origin: { x: 1, y: 0.72 },
      colors,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()

  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 120,
      scalar: 0.9,
      origin: { y: 0.75 },
      colors,
    })
  }, 350)
}
