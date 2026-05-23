import {
  LIDAR_MAX_RANGE,
  POPULATION_SIZE,
  REWARD_SAFETY,
  SPAWN_ANGLE,
} from '../../config/evolveCar.js'
import { breedNextGeneration, createInitialGeneration } from './genetics.js'
import {
  accumulateRewardSamples,
  computeFitness,
  resetRewardStats,
} from './fitness.js'
import { Car } from './Car.js'

function spawnOffset(index, total) {
  const ring = Math.floor(index / 10)
  const angle = (index / total) * Math.PI * 2
  const radius = 6 + ring * 14
  return {
    dx: Math.cos(angle) * radius,
    dy: Math.sin(angle) * radius,
  }
}

/**
 * Manages a generation of AI cars with neuroevolution.
 */
export class PopulationManager {
  /**
   * @param {Matter.World} world
   * @param {{ x: number, y: number, angle?: number }} spawnPoint
   */
  constructor(world, spawnPoint) {
    this.world = world
    this.spawnPoint = { ...spawnPoint, angle: spawnPoint.angle ?? SPAWN_ANGLE }
    this.generation = 0
    this.cars = []
    this.bestFitness = 0
    this.lastChampionFitness = 0
    this.rewardMode = REWARD_SAFETY
  }

  setRewardMode(mode) {
    this.rewardMode = mode
  }

  spawnGeneration(genomes) {
    this.clear()
    this.generation += 1
    const { x, y, angle } = this.spawnPoint

    genomes.forEach((genome, index) => {
      const off = spawnOffset(index, genomes.length)
      const car = new Car(this.world, x + off.dx, y + off.dy, {
        angle: angle + (index - genomes.length / 2) * 0.02,
        isChampion: genome.isChampion,
        brain: genome.brain,
        startX: x,
        startY: y,
      })
      resetRewardStats(car)
      this.cars.push(car)
    })
  }

  finalizeCar(car) {
    computeFitness(car, this.rewardMode)
  }

  startEvolution() {
    this.spawnGeneration(createInitialGeneration())
  }

  nextGeneration() {
    const ranked = this.cars.map((car) => ({
      brain: car.brain,
      fitness: car.fitness,
    }))
    this.lastChampionFitness = ranked.length ? Math.max(...ranked.map((r) => r.fitness)) : 0
    const genomes = breedNextGeneration(ranked)
    this.spawnGeneration(genomes)
  }

  clear() {
    this.cars.forEach((car) => car.destroy())
    this.cars = []
  }

  get livingCount() {
    return this.cars.filter((c) => !c.isDead).length
  }

  allDead() {
    return this.cars.length > 0 && this.livingCount === 0
  }

  updateFitness() {
    let best = 0
    this.cars.forEach((car) => {
      if (car.isDead) return
      accumulateRewardSamples(car)
      const f = computeFitness(car, this.rewardMode)
      if (f > best) best = f
    })
    this.cars.forEach((car) => {
      if (!car.isDead) return
      if (car.fitness > best) best = car.fitness
    })
    this.bestFitness = best
    return best
  }

  generationBestFitness() {
    if (!this.cars.length) return 0
    return Math.max(...this.cars.map((c) => c.fitness))
  }

  /** Normalized lidar inputs for NN */
  static sensorInputs(car) {
    return car.sensorReadings.map((r) =>
      Math.min(1, Math.max(0, r.distance / LIDAR_MAX_RANGE))
    )
  }
}
