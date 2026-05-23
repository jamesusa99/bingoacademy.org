import { NN_HIDDEN, NN_INPUTS, NN_OUTPUTS } from '../../config/evolveCar.js'

function randWeight(scale = 0.6) {
  return (Math.random() * 2 - 1) * scale
}

/**
 * Lightweight feedforward network: 5 lidar → 6 hidden → accel + steer.
 */
export class NeuralNetwork {
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
    return new NeuralNetwork()
  }

  clone() {
    const w = this.weights
    return new NeuralNetwork({
      ih: w.ih.map((row) => [...row]),
      bh: [...w.bh],
      ho: w.ho.map((row) => [...row]),
      bo: [...w.bo],
    })
  }

  /** Add Gaussian-ish noise to weights */
  mutate(rate = 0.2, scale = 0.35) {
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
      for (let i = 0; i < NN_INPUTS; i += 1) {
        sum += ih[h][i] * (inputs[i] ?? 0)
      }
      hidden.push(Math.tanh(sum))
    }

    const outputs = []
    for (let o = 0; o < NN_OUTPUTS; o += 1) {
      let sum = bo[o]
      for (let h = 0; h < NN_HIDDEN; h += 1) {
        sum += ho[o][h] * hidden[h]
      }
      outputs.push(Math.tanh(sum))
    }
    return outputs
  }

  /** Map network outputs to drive commands */
  predictDrive(normalizedSensorDistances) {
    const [rawAccel, rawSteer] = this.forward(normalizedSensorDistances)
    return {
      acceleration: (rawAccel + 1) / 2,
      steering: rawSteer,
    }
  }
}
