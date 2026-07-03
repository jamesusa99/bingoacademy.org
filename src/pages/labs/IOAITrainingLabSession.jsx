import { useState, useCallback, useMemo, useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import LabSessionLayout from '../../components/ioaiLab/LabSessionLayout'
import TutorialPane, { DEFAULT_PYTHON_LISTS_MD } from '../../components/ioaiLab/TutorialPane'
import NotebookPane from '../../components/ioaiLab/NotebookPane'
import AssessmentDock from '../../components/ioaiLab/AssessmentDock'
import {
  getLabById,
  getLabContent,
  getModule,
  IOAI_LAB_HREF,
  IOAI_LABS,
  isModuleUnlocked,
  loadProgress,
} from '../../config/ioaiTrainingLab'
import { useIOAILabProgress } from '../../hooks/useIOAILabProgress'
import { usePyodide } from '../../hooks/usePyodide'
import { celebrateCheckpoint } from '../../utils/labCelebration'
import { usePlgAhaMoment } from '../../hooks/usePlgAhaMoment'
import PlgAhaMomentModal from '../../components/plg/PlgAhaMomentModal'
import { useLazyAuth } from '../../contexts/LazyAuthContext'
import { useAuth } from '../../contexts/AuthContext'
import LabSessionActions from '../../components/funnel/LabSessionActions'
import {
  buildLabReportMarkdown,
  consumePendingAuthAction,
  downloadTextFile,
} from '../../lib/lazyRegistration'

function gradeLegacy(code, grader, output) {
  const hints = []
  for (const needle of grader.mustInclude || []) {
    if (!code.includes(needle)) {
      hints.push(`Include: ${needle}`)
    }
  }
  if (grader.runExpect && !output.includes(grader.runExpect)) {
    hints.push(`Expected output to contain "${grader.runExpect}" — click Run Code first`)
  }
  if (hints.length) {
    return { ok: false, hints, message: hints[0] }
  }
  return { ok: true }
}

function appendLine(base, line) {
  const trimmed = base?.trim()
  if (!trimmed || trimmed === '(no output)') return line
  return `${trimmed}\n\n${line}`
}

export default function IOAITrainingLabSession() {
  const { labId } = useParams()
  const { isAuthenticated } = useAuth()
  const { gateAction } = useLazyAuth()
  const { open: ahaOpen, close: closeAha, trigger: triggerAha } = usePlgAhaMoment('python-lists-lab-1')
  const lab = getLabById(labId)
  const content = getLabContent(labId)
  const { markLabComplete, stats } = useIOAILabProgress()
  const {
    isLoading: pyodideLoading,
    isReady: pyodideReady,
    loadError: pyodideLoadError,
    runPython,
    runAndGrade,
  } = usePyodide()

  const [code, setCode] = useState(content.starterCode)
  const [output, setOutput] = useState('')
  const [outputTone, setOutputTone] = useState('normal')
  const [running, setRunning] = useState(false)
  const [checking, setChecking] = useState(false)
  const [dockStatus, setDockStatus] = useState('idle')
  const [dockMessage, setDockMessage] = useState('')
  const [progressCelebrate, setProgressCelebrate] = useState(false)
  const [progressSynced, setProgressSynced] = useState(false)

  const progress = loadProgress()
  const module = lab ? getModule(lab.moduleId) : null
  const unlocked = lab && module ? isModuleUnlocked(lab.moduleId, progress) : false

  const progressPercent = useMemo(
    () => Math.round((stats.completedCount / stats.totalLabs) * 100),
    [stats.completedCount, stats.totalLabs]
  )

  useEffect(() => {
    if (!progressCelebrate) return undefined
    const timer = setTimeout(() => setProgressCelebrate(false), 1200)
    return () => clearTimeout(timer)
  }, [progressCelebrate])

  const downloadReport = useCallback(() => {
    if (!lab) return
    const markdown = buildLabReportMarkdown({
      lab,
      code,
      output,
      passed: dockStatus === 'pass',
    })
    downloadTextFile(`ioai-lab-${labId}-report.md`, markdown)
  }, [lab, labId, code, output, dockStatus])

  const markProgressSynced = useCallback(() => {
    setProgressSynced(true)
  }, [])

  const handleSaveProgress = useCallback(() => {
    gateAction({
      copyKey: 'saveProgress',
      pendingAction: { type: 'lab-save', labId },
      onAuthed: markProgressSynced,
    })
  }, [gateAction, labId, markProgressSynced])

  const handleDownloadReport = useCallback(() => {
    gateAction({
      copyKey: 'downloadReport',
      pendingAction: { type: 'lab-download', labId },
      onAuthed: downloadReport,
    })
  }, [gateAction, labId, downloadReport])

  useEffect(() => {
    if (!isAuthenticated || !labId) return
    const pending = consumePendingAuthAction()
    if (!pending || pending.labId !== labId) return
    if (pending.type === 'lab-save') {
      markProgressSynced()
    }
    if (pending.type === 'lab-download') {
      downloadReport()
    }
  }, [isAuthenticated, labId, markProgressSynced, downloadReport])

  const tutorialMarkdown =
    content.tutorialMarkdown ||
    (labId === 'lab-1' ? DEFAULT_PYTHON_LISTS_MD : null)

  const executeCode = useCallback(
    async (source) => {
      if (!pyodideReady) {
        return {
          output: pyodideLoadError?.message || 'Python engine is still loading…',
          isError: true,
        }
      }
      return runPython(source)
    },
    [pyodideReady, pyodideLoadError, runPython]
  )

  const handleRun = useCallback(async () => {
    if (pyodideLoading || running || checking) return
    setRunning(true)
    setOutputTone('normal')
    try {
      const result = await executeCode(code)
      setOutput(result.output)
      setOutputTone(result.isError ? 'error' : 'normal')
      setDockStatus(result.isError ? 'error' : 'idle')
      setDockMessage(result.isError ? 'Fix Python errors before submitting' : '')
    } finally {
      setRunning(false)
    }
  }, [code, executeCode, pyodideLoading, running, checking])

  const handleClear = useCallback(() => {
    setOutput('')
    setOutputTone('normal')
    setDockStatus('idle')
    setDockMessage('')
  }, [])

  const handleSubmitCheck = useCallback(async () => {
    if (pyodideLoading || running || checking) return
    setChecking(true)
    setDockStatus('idle')
    setDockMessage('')

    const grader = content.grader

    try {
      if (grader?.type === 'pyodide' && grader.testCode) {
        if (!pyodideReady) {
          setOutput(pyodideLoadError?.message || 'Python engine is still loading…')
          setOutputTone('error')
          setDockStatus('error')
          return
        }

        const result = await runAndGrade(code, grader.testCode)

        if (result.isError) {
          setOutput(result.output)
          setOutputTone('error')
          setDockStatus('error')
          setDockMessage('Fix Python errors before submitting')
          return
        }

        if (result.passed) {
          const successLine = grader.successMessage || '✅ Correct!'
          setOutput(appendLine(result.output, successLine))
          setOutputTone('success')
          setDockStatus('pass')
          markLabComplete(labId, 1)
          setProgressCelebrate(true)
          celebrateCheckpoint()
          if (labId === 'lab-1') triggerAha()
          return
        }

        const hintLine =
          grader.hintMessage ||
          '💡 Hint: Make sure your list is exactly named ioai_topics and contains the 3 required strings.'
        setOutput(appendLine(result.output, hintLine))
        setOutputTone('hint')
        setDockStatus('fail')
        setDockMessage(hintLine)
        return
      }

      const runResult = await executeCode(code)
      setOutput(runResult.output)
      if (runResult.isError) {
        setOutputTone('error')
        setDockStatus('error')
        setDockMessage('Fix Python errors before submitting')
        return
      }

      const legacy = gradeLegacy(code, grader, runResult.output)
      if (legacy.ok) {
        setOutput(appendLine(runResult.output, '✅ Correct! Checkpoint cleared.'))
        setOutputTone('success')
        setDockStatus('pass')
        markLabComplete(labId, 1)
        setProgressCelebrate(true)
        celebrateCheckpoint()
        if (labId === 'lab-1') triggerAha()
      } else {
        setOutput(appendLine(runResult.output, `💡 Hint: ${legacy.message}`))
        setOutputTone('hint')
        setDockStatus('fail')
        setDockMessage(legacy.message)
      }
    } finally {
      setChecking(false)
    }
  }, [
    pyodideLoading,
    running,
    checking,
    content.grader,
    pyodideReady,
    pyodideLoadError,
    runAndGrade,
    code,
    executeCode,
    labId,
    markLabComplete,
    triggerAha,
  ])

  if (!lab) {
    return <Navigate to={IOAI_LAB_HREF} replace />
  }

  if (!unlocked) {
    return (
      <div className="ioai-lab-page min-h-screen flex items-center justify-center p-6 bg-slate-950">
        <div className="text-center max-w-md">
          <p className="text-4xl mb-4">🔒</p>
          <h1 className="text-xl font-bold text-white mb-2">Module locked</h1>
          <p className="text-sm text-slate-400 mb-4">{module?.unlockRequirement}</p>
          <Link to={IOAI_LAB_HREF} className="btn-primary text-sm px-5 py-2.5 inline-flex">
            Back to skill tree
          </Link>
        </div>
      </div>
    )
  }

  const labIndex = IOAI_LABS.findIndex((l) => l.id === labId) + 1

  return (
    <>
      <PageMeta title={`${lab.title} · IOAI Training Lab`} description={lab.subtitle} />

      <LabSessionLayout
        backHref={IOAI_LAB_HREF}
        labTitle={`Lab ${lab.number}: ${lab.title}`}
        progressPercent={progressPercent}
        progressLabel={`${stats.completedCount}/${stats.totalLabs} labs · Lab ${labIndex} of ${IOAI_LABS.length}`}
        progressCelebrate={progressCelebrate}
        footer={
          <>
            <AssessmentDock status={dockStatus} message={dockMessage} />
            {dockStatus === 'pass' ? (
              <LabSessionActions
                onSaveProgress={handleSaveProgress}
                onDownloadReport={handleDownloadReport}
                savedHint={progressSynced && isAuthenticated}
              />
            ) : null}
          </>
        }
      >
        <TutorialPane markdown={tutorialMarkdown} sections={content.tutorial} />
        <NotebookPane
          lab={lab}
          code={code}
          onChange={setCode}
          onRun={handleRun}
          onSubmitCheck={handleSubmitCheck}
          onClear={handleClear}
          output={output}
          outputTone={outputTone}
          running={running}
          checking={checking}
          pyodideLoading={pyodideLoading}
          pyodideError={pyodideLoadError?.message}
        />
      </LabSessionLayout>

      <PlgAhaMomentModal open={ahaOpen} onClose={closeAha} />
    </>
  )
}
