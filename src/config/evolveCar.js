/** Evolve! AI Car — Matter.js track drawing & car physics */

export const TRACK_BRUSH_SIZE = 16
export const TRACK_BRUSH_SPACING = 10
export const ARENA_WALL_THICKNESS = 28

/** Collision categories: walls vs cars (cars ignore each other) */
export const COLLISION_WALL = 0x0001
export const COLLISION_CAR = 0x0002

/** Top-down: no world gravity */
export const WORLD_GRAVITY = { x: 0, y: 0 }

export const CAR_WIDTH = 34
export const CAR_LENGTH = 52
export const DRIVE_FORCE = 0.0018
export const STEER_TORQUE = 0.00042
export const LIDAR_MAX_RANGE = 300
export const SENSOR_ANGLES_DEG = [-60, -30, 0, 30, 60]
export const LIDAR_HIT_RATIO = 0.92

/** Neuroevolution */
export const NN_INPUTS = 5
export const NN_HIDDEN = 6
export const NN_OUTPUTS = 2

export const POPULATION_SIZE = 50
export const ELITE_RATE = 0.1
export const MUTATION_RATE = 0.2
export const MUTATION_SCALE = 0.35
export const GENERATION_MAX_MS = 14_000
export const SPAWN_ANGLE = -Math.PI / 2

/** Reward function modes (student-tunable) */
export const REWARD_SPEED = 'speed'
export const REWARD_SAFETY = 'safety'

/** Safety: lidar closer than this ratio of max range counts as a close call (per frame) */
export const CLOSE_CALL_RATIO = 0.38
export const CLOSE_CALL_PENALTY = 6
/** Per-frame sum of (1 − normalized distance) across 5 rays */
export const PROXIMITY_FRAME_WEIGHT = 0.45
