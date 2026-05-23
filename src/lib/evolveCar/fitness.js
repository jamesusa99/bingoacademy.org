import {
  CLOSE_CALL_PENALTY,
  CLOSE_CALL_RATIO,
  LIDAR_MAX_RANGE,
  PROXIMITY_FRAME_WEIGHT,
  REWARD_SAFETY,
  REWARD_SPEED,
} from '../../config/evolveCar.js'

export function distanceFromStart(car) {
  const dx = car.body.position.x - car.startX
  const dy = car.body.position.y - car.startY
  return Math.hypot(dx, dy)
}

/**
 * Per physics tick — accumulate speed & wall proximity while alive.
 */
export function accumulateRewardSamples(car) {
  if (car.isDead || !car.sensorReadings?.length) return

  const { x, y } = car.body.velocity
  const speed = Math.hypot(x, y)
  car.speedSum += speed
  car.speedSampleCount += 1

  let minDist = LIDAR_MAX_RANGE
  let proximityFrame = 0
  car.sensorReadings.forEach((ray) => {
    const d = Math.min(LIDAR_MAX_RANGE, Math.max(0, ray.distance))
    if (d < minDist) minDist = d
    proximityFrame += (1 - d / LIDAR_MAX_RANGE) * PROXIMITY_FRAME_WEIGHT
  })

  car.proximityPenaltySum += proximityFrame
  if (minDist < LIDAR_MAX_RANGE * CLOSE_CALL_RATIO) {
    car.closeCallCount += 1
  }
}

/**
 * @param {import('./Car.js').Car} car
 * @param {typeof REWARD_SPEED | typeof REWARD_SAFETY} rewardMode
 */
export function computeFitness(car, rewardMode) {
  const distance = distanceFromStart(car)
  car.distanceTraveled = distance

  if (rewardMode === REWARD_SPEED) {
    const avgSpeed =
      car.speedSampleCount > 0 ? car.speedSum / car.speedSampleCount : 0
    car.fitness = distance * avgSpeed
  } else {
    const penalty =
      car.closeCallCount * CLOSE_CALL_PENALTY + car.proximityPenaltySum
    car.fitness = Math.max(0, distance - penalty)
  }

  if (car.fitness > car.maxFitness) car.maxFitness = car.fitness
  return car.fitness
}

export function resetRewardStats(car) {
  car.speedSum = 0
  car.speedSampleCount = 0
  car.closeCallCount = 0
  car.proximityPenaltySum = 0
  car.distanceTraveled = 0
  car.fitness = 0
  car.maxFitness = 0
}
