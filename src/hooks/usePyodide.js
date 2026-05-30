import { useCallback, useEffect, useRef, useState } from 'react'

/** Match CDN bundle — client-only, no SSR */
const PYODIDE_VERSION = '0.29.4'
export const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

let pyodideInstancePromise = null

function loadPyodideScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Pyodide requires a browser environment'))
  }
  if (window.loadPyodide) {
    return Promise.resolve(window.loadPyodide)
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pyodide-cdn]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.loadPyodide))
      existing.addEventListener('error', () => reject(new Error('Failed to load Pyodide script')))
      return
    }
    const script = document.createElement('script')
    script.src = `${PYODIDE_CDN}pyodide.js`
    script.dataset.pyodideCdn = 'true'
    script.onload = () => {
      if (window.loadPyodide) resolve(window.loadPyodide)
      else reject(new Error('Pyodide loaded but loadPyodide is missing'))
    }
    script.onerror = () => reject(new Error('Failed to load Pyodide from CDN'))
    document.head.appendChild(script)
  })
}

async function getPyodideInstance() {
  if (!pyodideInstancePromise) {
    pyodideInstancePromise = (async () => {
      const loadPyodide = await loadPyodideScript()
      return loadPyodide({ indexURL: PYODIDE_CDN })
    })()
  }
  return pyodideInstancePromise
}

function silenceIo(pyodide) {
  pyodide.setStdout({ batched: () => {} })
  pyodide.setStderr({ batched: () => {} })
}

function captureIo(pyodide) {
  const stdoutChunks = []
  const stderrChunks = []
  pyodide.setStdout({
    batched: (msg) => {
      stdoutChunks.push(msg)
    },
  })
  pyodide.setStderr({
    batched: (msg) => {
      stderrChunks.push(msg)
    },
  })
  return { stdoutChunks, stderrChunks }
}

export function usePyodide() {
  const pyodideRef = useRef(null)
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getPyodideInstance()
      .then((pyodide) => {
        if (cancelled) return
        pyodideRef.current = pyodide
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err instanceof Error ? err : new Error(String(err)))
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const ensurePyodide = useCallback(async () => {
    const pyodide = pyodideRef.current ?? (await getPyodideInstance())
    pyodideRef.current = pyodide
    return pyodide
  }, [])

  const runPython = useCallback(
    async (code) => {
      const pyodide = await ensurePyodide()
      const { stdoutChunks, stderrChunks } = captureIo(pyodide)

      try {
        await pyodide.runPythonAsync(code)
        const stdout = stdoutChunks.join('')
        const stderr = stderrChunks.join('')
        if (stderr) {
          return { output: stderr.trim() || stdout || '(no output)', isError: false }
        }
        return { output: stdout || '(no output)', isError: false }
      } catch (err) {
        const message = err?.message || String(err)
        const stderr = stderrChunks.join('')
        const combined = [stderr, message].filter(Boolean).join('\n').trim()
        return { output: combined || 'Python execution failed', isError: true }
      }
    },
    [ensurePyodide]
  )

  /** Evaluate test expression in the same global namespace (stdout suppressed). */
  const runPythonTest = useCallback(
    async (testCode) => {
      const pyodide = await ensurePyodide()
      silenceIo(pyodide)

      try {
        const result = await pyodide.runPythonAsync(testCode)
        return { passed: result === true, isNameError: false, error: null }
      } catch (err) {
        const message = err?.message || String(err)
        const isNameError = /NameError|name 'ioai_topics' is not defined|not defined/i.test(message)
        return { passed: false, isNameError, error: message }
      }
    },
    [ensurePyodide]
  )

  /** Run user code, then silently grade against Pyodide globals. */
  const runAndGrade = useCallback(
    async (userCode, testCode) => {
      const runResult = await runPython(userCode)
      if (runResult.isError) {
        return { ...runResult, passed: false, isNameError: false }
      }

      const testResult = await runPythonTest(testCode)
      return {
        output: runResult.output,
        isError: false,
        passed: testResult.passed,
        isNameError: testResult.isNameError,
        testError: testResult.error,
      }
    },
    [runPython, runPythonTest]
  )

  return {
    status,
    loadError,
    isLoading: status === 'loading',
    isReady: status === 'ready',
    runPython,
    runPythonTest,
    runAndGrade,
  }
}
