/**
 * Mock 5D word embeddings for Word Gravity Field.
 * Vectors are clustered: similar within Space / Animals / Food, distant across clusters.
 */

export const EMBEDDING_CLUSTERS = {
  space: ['UNIVERSE', 'STAR', 'ROCKET', 'GALAXY', 'PLANET', 'MOON'],
  animals: ['DOG', 'CAT', 'LION', 'BEAR', 'BIRD'],
  food: ['APPLE', 'BANANA', 'BURGER', 'PIZZA', 'TACO', 'MELON'],
}

/** Cluster centroids in 5D semantic space */
const CENTROIDS = {
  space: [0.92, 0.88, 0.12, 0.08, 0.18],
  animals: [0.1, 0.14, 0.9, 0.86, 0.2],
  food: [0.12, 0.08, 0.16, 0.1, 0.94],
}

/** Per-word jitter so neighbors in a cluster stay close but not identical */
const WORD_OFFSETS = {
  UNIVERSE: [0.02, 0.03, 0, 0.01, 0.02],
  STAR: [0.04, -0.02, 0.02, 0, 0.01],
  ROCKET: [-0.03, 0.05, 0.01, -0.02, 0.03],
  GALAXY: [0.01, 0.04, -0.01, 0.03, -0.02],
  PLANET: [-0.02, -0.03, 0.03, 0.02, 0.01],
  MOON: [0.03, 0.01, -0.02, -0.01, 0.04],
  DOG: [0.02, -0.03, 0.04, 0.02, -0.01],
  CAT: [-0.02, 0.04, -0.02, 0.03, 0.02],
  LION: [0.03, 0.02, 0.05, -0.02, 0.01],
  BEAR: [-0.03, -0.02, 0.01, 0.04, -0.02],
  BIRD: [0.01, 0.05, -0.03, -0.01, 0.03],
  APPLE: [0.03, 0.02, -0.02, 0.01, 0.04],
  BANANA: [-0.02, 0.04, 0.01, -0.02, 0.05],
  BURGER: [0.04, -0.01, 0.02, 0.03, -0.03],
  PIZZA: [-0.01, -0.03, 0.03, 0.02, 0.06],
  TACO: [0.02, 0.01, -0.01, 0.04, 0.02],
  MELON: [-0.04, 0.02, 0.01, -0.03, 0.03],
}

function buildVector(clusterKey, word) {
  const base = CENTROIDS[clusterKey]
  const offset = WORD_OFFSETS[word] ?? [0, 0, 0, 0, 0]
  return base.map((v, i) => v + offset[i])
}

function buildDictionary() {
  const dict = {}
  for (const [clusterKey, words] of Object.entries(EMBEDDING_CLUSTERS)) {
    for (const word of words) {
      dict[word] = buildVector(clusterKey, word)
    }
  }
  return dict
}

/** @type {Record<string, number[]>} */
export const WORD_EMBEDDINGS = buildDictionary()

export const EMBEDDING_DIM = 5

export function normalizeWordKey(word) {
  return String(word ?? '')
    .trim()
    .toUpperCase()
}

/**
 * Cosine similarity between two vectors (0–1 for our non-negative mock embeddings).
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA?.length || !vecB?.length || vecA.length !== vecB.length) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < vecA.length; i += 1) {
    dot += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  if (denom === 0) return 0
  return dot / denom
}

export function getEmbedding(word) {
  return WORD_EMBEDDINGS[normalizeWordKey(word)] ?? null
}

export function cosineSimilarityBetweenWords(wordA, wordB) {
  const a = getEmbedding(wordA)
  const b = getEmbedding(wordB)
  if (!a || !b) return 0
  return cosineSimilarity(a, b)
}

/** Similarity of a word to the black-hole target word */
export function similarityToTarget(word, targetWord) {
  return cosineSimilarityBetweenWords(word, targetWord)
}

export function formatVectorArray(vec, decimals = 2) {
  if (!vec?.length) return '[ — ]'
  return `[${vec.map((v) => v.toFixed(decimals)).join(', ')}]`
}

/** Snapshot for AI Vector Scanner UI when a word is spawned */
export function buildVectorScan(spawnWord, targetWord) {
  const word = normalizeWordKey(spawnWord)
  const target = normalizeWordKey(targetWord)
  const vector = getEmbedding(word)
  const targetVector = getEmbedding(target)
  if (!vector || !targetVector) {
    return {
      word,
      target,
      vector: null,
      targetVector: null,
      similarity: 0,
      dotProduct: 0,
      normSpawn: 0,
      normTarget: 0,
      spawnedAt: Date.now(),
    }
  }

  let dotProduct = 0
  let normSpawnSq = 0
  let normTargetSq = 0
  for (let i = 0; i < vector.length; i += 1) {
    dotProduct += vector[i] * targetVector[i]
    normSpawnSq += vector[i] * vector[i]
    normTargetSq += targetVector[i] * targetVector[i]
  }
  const normSpawn = Math.sqrt(normSpawnSq)
  const normTarget = Math.sqrt(normTargetSq)
  const similarity = cosineSimilarity(vector, targetVector)

  return {
    word,
    target,
    vector,
    targetVector,
    similarity,
    dotProduct,
    normSpawn,
    normTarget,
    spawnedAt: Date.now(),
  }
}

export const VECTOR_SCANNER_EDUCATION =
  'AI turns words into lists of numbers (Vectors). If two words mean similar things, their numbers point in the same direction! We use Cosine Similarity to measure this.'

function pickRandomFrom(arr, exclude) {
  const pool = arr.filter((w) => w !== exclude)
  if (!pool.length) return arr[0]
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * One word per cluster for the ammo bar (semantic variety).
 */
export function pickAmmoWords(targetWord, count = 3) {
  const target = normalizeWordKey(targetWord)
  const picks = [
    pickRandomFrom(EMBEDDING_CLUSTERS.space, target),
    pickRandomFrom(EMBEDDING_CLUSTERS.animals, target),
    pickRandomFrom(EMBEDDING_CLUSTERS.food, target),
  ]
  return picks.slice(0, count)
}

export function formatWordLabel(word) {
  const key = normalizeWordKey(word)
  return key.charAt(0) + key.slice(1).toLowerCase()
}

export function allDictionaryWords() {
  return Object.keys(WORD_EMBEDDINGS)
}
