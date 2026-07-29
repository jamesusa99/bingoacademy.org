import {
  CANVAS_H,
  CANVAS_W,
  ELITE_RATE,
  MUTATION_RATE,
  MUTATION_SCALE,
  NN_HIDDEN,
  NN_INPUTS,
  NN_OUTPUTS,
  POPULATION_SIZE,
} from '../../config/marsLander.js'

function randWeight(scale = 0.7) {
  return (Math.random() * 2 - 1) * scale
}

export class LanderBrain {
  constructor(weights = null) {
    if (weights) {
      this.weights = weights
      return
    }
    this.weights = {
      ih: Array.from({ length: NN_HIDDEN }, () =>
        Array.from({ length: NN_INPUTS }, () => randWeight())
      ),
      bh: Array.from({ length: NN_HIDDEN }, () => randWeight(0.3)),
      ho: Array.from({ length: NN_OUTPUTS }, () =>
        Array.from({ length: NN_HIDDEN }, () => randWeight())
      ),
      bo: Array.from({ length: NN_OUTPUTS }, () => randWeight(0.3)),
    }
  }

  static random() {
    return new LanderBrain()
  }

  clone() {
    const w = this.weights
    return new LanderBrain({
      ih: w.ih.map((row) => [...row]),
      bh: [...w.bh],
      ho: w.ho.map((row) => [...row]),
      bo: [...w.bo],
    })
  }

  mutate(rate = MUTATION_RATE, scale = MUTATION_SCALE) {
    const mutateArr = (arr) =>
      arr.map((v) => (Math.random() < rate ? v + (Math.random() * 2 - 1) * scale : v))
    const w = this.weights
    w.ih = w.ih.map((row) => mutateArr(row))
    w.bh = mutateArr(w.bh)
    w.ho = w.ho.map((row) => mutateArr(row))
    w.bo = mutateArr(w.bo)
    return this
  }

  forward(inputs) {
    const { ih, bh, ho, bo } = this.weights
    const hidden = []
    for (let h = 0; h < NN_HIDDEN; h += 1) {
      let sum = bh[h]
      for (let i = 0; i < NN_INPUTS; i += 1) sum += ih[h][i] * (inputs[i] ?? 0)
      hidden.push(Math.tanh(sum))
    }
    const outputs = []
    for (let o = 0; o < NN_OUTPUTS; o += 1) {
      let sum = bo[o]
      for (let h = 0; h < NN_HIDDEN; h += 1) sum += ho[o][h] * hidden[h]
      outputs.push(Math.tanh(sum))
    }
    return outputs
  }

  /** @returns {{ thrust: boolean, rotate: number }} rotate in [-1,1] */
  decide(inputs) {
    const [rawThrust, rawRotate] = this.forward(inputs)
    return {
      thrust: rawThrust > 0.15,
      rotate: rawRotate,
    }
  }
}

export function createInitialGeneration() {
  return Array.from({ length: POPULATION_SIZE }, (_, i) => ({
    brain: LanderBrain.random(),
    isChampion: i === 0,
  }))
}

export function breedNextGeneration(ranked) {
  const sorted = [...ranked].sort((a, b) => b.fitness - a.fitness)
  const eliteCount = Math.max(1, Math.floor(sorted.length * ELITE_RATE))
  const elites = sorted.slice(0, eliteCount)
  const genomes = []
  for (let i = 0; i < POPULATION_SIZE; i += 1) {
    if (i === 0) {
      genomes.push({ brain: elites[0].brain.clone(), isChampion: true })
      continue
    }
    const parent = elites[Math.floor(Math.random() * eliteCount)]
    genomes.push({
      brain: parent.brain.clone().mutate(),
      isChampion: false,
    })
  }
  return genomes
}

/** Deterministic jagged canyon + flat landing pad */
export function buildTerrain(seed = 42) {
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }

  const points = []
  const padWidth = 90
  const padCenter = CANVAS_W * 0.58
  const padLeft = padCenter - padWidth / 2
  const padRight = padCenter + padWidth / 2
  const padY = CANVAS_H - 78

  let x = 0
  let y = CANVAS_H - 120
  points.push({ x: 0, y: CANVAS_H })
  points.push({ x: 0, y })

  while (x < CANVAS_W) {
    const nextX = Math.min(CANVAS_W, x + 28 + rand() * 40)
    if (x < padLeft && nextX >= padLeft) {
      points.push({ x: padLeft, y })
      points.push({ x: padLeft, y: padY })
      points.push({ x: padRight, y: padY })
      x = padRight
      y = padY
      continue
    }
    if (x >= padLeft && x < padRight) {
      x = padRight
      y = padY
      points.push({ x, y })
      continue
    }
    const cliff = rand() > 0.72
    y = Math.min(
      CANVAS_H - 40,
      Math.max(CANVAS_H - 220, y + (cliff ? (rand() - 0.35) * 70 : (rand() - 0.5) * 28))
    )
    x = nextX
    points.push({ x, y })
  }

  points.push({ x: CANVAS_W, y: CANVAS_H })
  points.push({ x: 0, y: CANVAS_H })

  return {
    points,
    pad: { left: padLeft, right: padRight, y: padY, center: padCenter },
  }
}

export function groundYAt(terrain, x) {
  const pts = terrain.points
  for (let i = 0; i < pts.length - 1; i += 1) {
    const a = pts[i]
    const b = pts[i + 1]
    if (x >= a.x && x <= b.x) {
      const t = a.x === b.x ? 0 : (x - a.x) / (b.x - a.x)
      return a.y + (b.y - a.y) * t
    }
  }
  return CANVAS_H - 40
}

export function distanceToPad(lander, pad) {
  const cx = (pad.left + pad.right) / 2
  return Math.hypot(lander.x - cx, lander.y - pad.y)
}
