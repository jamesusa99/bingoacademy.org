import {
  ELITE_RATE,
  MUTATION_RATE,
  MUTATION_SCALE,
  POPULATION_SIZE,
} from '../../config/evolveCar.js'
import { NeuralNetwork } from './NeuralNetwork.js'

/**
 * Build genomes for a new generation from prior cars sorted by fitness.
 * @param {Array<{ brain: NeuralNetwork, fitness: number }>} rankedCars
 * @returns {Array<{ brain: NeuralNetwork, isChampion: boolean }>}
 */
export function breedNextGeneration(rankedCars) {
  const sorted = [...rankedCars].sort((a, b) => b.fitness - a.fitness)
  const eliteCount = Math.max(1, Math.floor(sorted.length * ELITE_RATE))
  const elites = sorted.slice(0, eliteCount)

  const genomes = []
  for (let i = 0; i < POPULATION_SIZE; i += 1) {
    if (i === 0) {
      genomes.push({
        brain: elites[0].brain.clone(),
        isChampion: true,
      })
      continue
    }
    const parent = elites[Math.floor(Math.random() * eliteCount)]
    genomes.push({
      brain: parent.brain.clone().mutate(MUTATION_RATE, MUTATION_SCALE),
      isChampion: false,
    })
  }
  return genomes
}

/** First generation — all random brains */
export function createInitialGeneration() {
  return Array.from({ length: POPULATION_SIZE }, (_, i) => ({
    brain: NeuralNetwork.random(),
    isChampion: i === 0,
  }))
}
