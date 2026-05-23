import Matter from 'matter-js'
import {
  CAR_LENGTH,
  CAR_WIDTH,
  COLLISION_CAR,
  COLLISION_WALL,
  DRIVE_FORCE,
  LIDAR_HIT_RATIO,
  LIDAR_MAX_RANGE,
  SENSOR_ANGLES_DEG,
  STEER_TORQUE,
} from '../../config/evolveCar.js'

function raycastToWalls(wallBodies, start, end) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const maxLen = Math.hypot(dx, dy)
  if (maxLen < 1) {
    return { distance: 0, hit: false, endX: end.x, endY: end.y }
  }

  const fullHits = Matter.Query.ray(wallBodies, start, end, 2)
  if (!fullHits.length) {
    return { distance: maxLen, hit: false, endX: end.x, endY: end.y }
  }

  const nx = dx / maxLen
  const ny = dy / maxLen
  let lo = 0
  let hi = maxLen

  for (let i = 0; i < 14; i += 1) {
    const mid = (lo + hi) / 2
    const midEnd = { x: start.x + nx * mid, y: start.y + ny * mid }
    const hits = Matter.Query.ray(wallBodies, start, midEnd, 2)
    if (hits.length) hi = mid
    else lo = mid
  }

  const distance = hi
  const close = distance < maxLen * LIDAR_HIT_RATIO
  return {
    distance,
    hit: close,
    endX: start.x + nx * distance,
    endY: start.y + ny * distance,
  }
}

/**
 * AI Car — Matter.js body, lidar, optional neural brain, fitness tracking.
 */
export class Car {
  constructor(world, x, y, options = {}) {
    this.world = world
    this.isDead = false
    this.isChampion = options.isChampion ?? false
    this.brain = options.brain ?? null
    this.acceleration = 0
    this.steering = 0
    this.startX = options.startX ?? x
    this.startY = options.startY ?? y
    this.fitness = 0
    this.maxFitness = 0
    this.speedSum = 0
    this.speedSampleCount = 0
    this.closeCallCount = 0
    this.proximityPenaltySum = 0
    this.distanceTraveled = 0

    this.sensorReadings = SENSOR_ANGLES_DEG.map((angleDeg) => ({
      angleDeg,
      distance: LIDAR_MAX_RANGE,
      hit: false,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
    }))

    const w = options.width ?? CAR_WIDTH
    const h = options.length ?? CAR_LENGTH

    this.body = Matter.Bodies.rectangle(x, y, w, h, {
      label: 'car',
      friction: 0.12,
      frictionAir: 0.09,
      frictionStatic: 0.08,
      restitution: 0.05,
      density: 0.0035,
      chamfer: { radius: 5 },
      collisionFilter: {
        category: COLLISION_CAR,
        mask: COLLISION_WALL,
      },
    })

    if (options.angle != null) {
      Matter.Body.setAngle(this.body, options.angle)
    }

    this.body.plugin.car = this
    Matter.World.add(world, this.body)
  }

  drive(acceleration, steering) {
    if (this.isDead) return
    this.acceleration = Math.max(0, Math.min(1, acceleration))
    this.steering = Math.max(-1, Math.min(1, steering))
  }

  applyDriveForces() {
    if (this.isDead) return

    const { body } = this
    const angle = body.angle
    const forceMag = this.acceleration * DRIVE_FORCE * body.mass

    Matter.Body.applyForce(body, body.position, {
      x: Math.cos(angle) * forceMag,
      y: Math.sin(angle) * forceMag,
    })

    Matter.Body.setAngularVelocity(
      body,
      body.angularVelocity + this.steering * STEER_TORQUE
    )
  }

  updateSensors(wallBodies) {
    const { x, y } = this.body.position
    const heading = this.body.angle

    this.sensorReadings = SENSOR_ANGLES_DEG.map((angleDeg) => {
      const worldAngle = heading + (angleDeg * Math.PI) / 180
      const end = {
        x: x + Math.cos(worldAngle) * LIDAR_MAX_RANGE,
        y: y + Math.sin(worldAngle) * LIDAR_MAX_RANGE,
      }
      const cast = raycastToWalls(wallBodies, { x, y }, end)
      return {
        angleDeg,
        distance: cast.distance,
        hit: cast.hit,
        startX: x,
        startY: y,
        endX: cast.endX,
        endY: cast.endY,
      }
    })
  }

  kill() {
    if (this.isDead) return
    this.isDead = true
    this.acceleration = 0
    this.steering = 0
    Matter.Body.setVelocity(this.body, { x: 0, y: 0 })
    Matter.Body.setAngularVelocity(this.body, 0)
    Matter.Sleeping.set(this.body, true)
  }

  destroy() {
    Matter.World.remove(this.world, this.body)
  }
}
