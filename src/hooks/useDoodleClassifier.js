import { useCallback, useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as knnClassifier from '@tensorflow-models/knn-classifier'

/**
 * Loads MobileNet + KNN and exposes addExample(canvas, classId).
 */
export function useDoodleClassifier() {
  const mobilenetRef = useRef(null)
  const knnRef = useRef(null)
  const [aiStatus, setAiStatus] = useState('loading')
  const [aiError, setAiError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      setAiStatus('loading')
      setAiError(null)
      try {
        await tf.setBackend('webgl')
        await tf.ready()

        const [net, knn] = await Promise.all([
          mobilenet.load({ version: 2, alpha: 0.5 }),
          Promise.resolve(knnClassifier.create()),
        ])

        if (cancelled) {
          knn.dispose()
          return
        }

        mobilenetRef.current = net
        knnRef.current = knn
        setAiStatus('ready')
      } catch (err) {
        if (!cancelled) {
          console.error('Doodle classifier init failed:', err)
          setAiError(err?.message ?? 'Failed to load AI models')
          setAiStatus('error')
        }
      }
    }

    init()

    return () => {
      cancelled = true
      knnRef.current?.dispose()
      knnRef.current = null
      mobilenetRef.current = null
    }
  }, [])

  const addExample = useCallback(async (canvas, classId) => {
    const net = mobilenetRef.current
    const knn = knnRef.current
    if (!net || !knn) {
      throw new Error('AI is still initializing')
    }
    if (!canvas?.width || !canvas?.height) {
      throw new Error('Canvas is empty')
    }

    const imageTensor = tf.browser.fromPixels(canvas)
    try {
      const features = net.infer(imageTensor, true)
      knn.addExample(features, classId)
      features.dispose()
    } finally {
      imageTensor.dispose()
    }
  }, [])

  /** Extract features and run KNN predictClass (Test Mode). */
  const predictMonster = useCallback(async (canvas, k = 5) => {
    const net = mobilenetRef.current
    const knn = knnRef.current
    if (!net || !knn) return null

    const imageTensor = tf.browser.fromPixels(canvas)
    try {
      const features = net.infer(imageTensor, true)
      const result = await knn.predictClass(features, k)
      features.dispose()
      return result
    } finally {
      imageTensor.dispose()
    }
  }, [])

  const isReady = aiStatus === 'ready'

  return {
    aiStatus,
    aiError,
    isReady,
    addExample,
    predictMonster,
    predictFromCanvas: predictMonster,
    knnRef,
  }
}
