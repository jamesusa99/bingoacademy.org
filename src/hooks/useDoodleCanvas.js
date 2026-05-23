import { useCallback, useEffect, useRef } from 'react'

const STROKE_COLOR = '#000000'
const BG_COLOR = '#ffffff'
const LINE_WIDTH = 8
const LINE_CAP = 'round'
const LINE_JOIN = 'round'

function getPoint(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}

/**
 * HTML5 canvas drawing with mouse + touch; backing store matches display × DPR (no stretch).
 */
export function useDoodleCanvas({ lineWidth = LINE_WIDTH } = {}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef(null)
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })

  const paintLine = useCallback((from, to) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = STROKE_COLOR
    ctx.lineWidth = lineWidth * sizeRef.current.dpr
    ctx.lineCap = LINE_CAP
    ctx.lineJoin = LINE_JOIN
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
  }, [lineWidth])

  const fillBackground = useCallback((ctx, width, height) => {
    ctx.fillStyle = BG_COLOR
    ctx.fillRect(0, 0, width, height)
  }, [])

  const setupCanvas = useCallback(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const cssW = Math.max(200, Math.floor(rect.width))
    const cssH = Math.max(200, Math.floor(rect.height))
    const pixelW = Math.floor(cssW * dpr)
    const pixelH = Math.floor(cssH * dpr)

    const prevW = canvas.width
    const prevH = canvas.height
    let snapshot = null
    if (prevW > 0 && prevH > 0 && (prevW !== pixelW || prevH !== pixelH)) {
      const prevCtx = canvas.getContext('2d')
      if (prevCtx) snapshot = prevCtx.getImageData(0, 0, prevW, prevH)
    }

    canvas.width = pixelW
    canvas.height = pixelH
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    sizeRef.current = { width: pixelW, height: pixelH, dpr, cssW, cssH }

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    fillBackground(ctx, pixelW, pixelH)

    if (snapshot) {
      const off = document.createElement('canvas')
      off.width = prevW
      off.height = prevH
      off.getContext('2d')?.putImageData(snapshot, 0, 0)
      ctx.drawImage(off, 0, 0, prevW, prevH, 0, 0, pixelW, pixelH)
    }
  }, [fillBackground])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    fillBackground(ctx, canvas.width, canvas.height)
    lastPointRef.current = null
    drawingRef.current = false
  }, [fillBackground])

  const exportSnapshot = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0) return null
    try {
      return canvas.toDataURL('image/png')
    } catch {
      return null
    }
  }, [])

  const isBlank = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas?.width) return true
    const ctx = canvas.getContext('2d')
    if (!ctx) return true
    const { width, height } = canvas
    const data = ctx.getImageData(0, 0, width, height).data
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) return false
    }
    return true
  }, [])

  const startStroke = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawingRef.current = true
    lastPointRef.current = getPoint(canvas, clientX, clientY)
  }, [])

  const continueStroke = useCallback((clientX, clientY) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const point = getPoint(canvas, clientX, clientY)
    const last = lastPointRef.current
    if (last) paintLine(last, point)
    lastPointRef.current = point
  }, [paintLine])

  const endStroke = useCallback(() => {
    drawingRef.current = false
    lastPointRef.current = null
  }, [])

  useEffect(() => {
    setupCanvas()
    const container = containerRef.current
    if (!container) return undefined

    const ro = new ResizeObserver(() => {
      setupCanvas()
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [setupCanvas])

  const pointerHandlers = {
    onMouseDown: (e) => {
      e.preventDefault()
      startStroke(e.clientX, e.clientY)
    },
    onMouseMove: (e) => {
      if (!drawingRef.current) return
      e.preventDefault()
      continueStroke(e.clientX, e.clientY)
    },
    onMouseUp: endStroke,
    onMouseLeave: endStroke,
    onTouchStart: (e) => {
      if (e.touches.length !== 1) return
      e.preventDefault()
      const t = e.touches[0]
      startStroke(t.clientX, t.clientY)
    },
    onTouchMove: (e) => {
      if (!drawingRef.current || e.touches.length !== 1) return
      e.preventDefault()
      const t = e.touches[0]
      continueStroke(t.clientX, t.clientY)
    },
    onTouchEnd: (e) => {
      e.preventDefault()
      endStroke()
    },
    onTouchCancel: endStroke,
  }

  return {
    containerRef,
    canvasRef,
    clearCanvas,
    exportSnapshot,
    isBlank,
    pointerHandlers,
  }
}
