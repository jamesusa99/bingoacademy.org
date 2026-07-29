/** Mars Lander: RL Evolution — physics, NN, and reward knobs */

export const CANVAS_W = 900
export const CANVAS_H = 520

export const GRAVITY = 0.045
export const THRUST = 0.11
export const ROTATE_SPEED = 0.045
export const FUEL_MAX = 100
export const FUEL_BURN = 0.085
export const LANDER_W = 18
export const LANDER_H = 22

/** Soft landing thresholds */
export const SAFE_VY = 1.35
export const SAFE_VX = 1.1
export const SAFE_ANGLE = 0.35

export const POPULATION_SIZE = 50
export const ELITE_RATE = 0.12
export const MUTATION_RATE = 0.22
export const MUTATION_SCALE = 0.4
export const GENERATION_MAX_STEPS = 900

export const NN_INPUTS = 6
export const NN_HIDDEN = 8
export const NN_OUTPUTS = 2

/** Default student-tunable reward weights */
export const DEFAULT_REWARDS = {
  softLanding: 100,
  crash: 50,
  fuelWaste: 10,
  uprightBonus: 15,
  padProximity: 20,
}

export const REWARD_SLIDERS = [
  {
    key: 'softLanding',
    label: 'Soft landing bonus',
    hint: 'Reward for touching the pad slowly & upright',
    min: 0,
    max: 200,
  },
  {
    key: 'crash',
    label: 'Crash / cliff penalty',
    hint: 'Deducted when you hit rocks or land too hard',
    min: 0,
    max: 120,
  },
  {
    key: 'fuelWaste',
    label: 'Fuel waste penalty',
    hint: 'Cost for burning fuel (lower = allow thruster spam)',
    min: 0,
    max: 40,
  },
  {
    key: 'uprightBonus',
    label: 'Upright bonus',
    hint: 'Ongoing reward for staying near vertical',
    min: 0,
    max: 40,
  },
  {
    key: 'padProximity',
    label: 'Pad proximity',
    hint: 'Reward for getting closer to the landing zone',
    min: 0,
    max: 50,
  },
]
