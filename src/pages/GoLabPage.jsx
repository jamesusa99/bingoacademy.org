import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import NotebookPane from '../components/ioaiLab/NotebookPane'
import PageMeta from '../components/PageMeta'
import { COURSES_PORTAL } from '../config/coursesPortal'
import { useCourseCatalog } from '../hooks/useCourseCatalog'
import { usePyodide } from '../hooks/usePyodide'
import { findCourseInList, inferProgramLineForSlug } from '../lib/catalogCourse'
import { findLessonInTree } from '../lib/ioaiCourseStructure'
import { clearGoLabCode, GOLAB_STARTER_CODE, loadGoLabCode, saveGoLabCode } from '../lib/goLabStorage'
import { lessonPathFromGoLab } from '../lib/goLabPaths'
import { isStudyCenterPath } from '../lib/studyPaths'
import { useProgramCurriculum } from '../hooks/useProgramCurriculum'
import { useLazyAuth } from '../contexts/LazyAuthContext'
import { useAuth } from '../contexts/AuthContext'
import { CloudUpload } from 'lucide-react'
import { consumePendingAuthAction } from '../lib/lazyRegistration'

const GOLAB_LAB = { runtime: 'jupyterlite', compute: 'cpu' }

export default function GoLabPage({ studyCenter: studyCenterProp = false }) {
  const { id: catalogLessonId, lessonId: studyLessonId } = useParams()
  const location = useLocation()
  const studyCenter = studyCenterProp || isStudyCenterPath(location.pathname)
  const lessonId = studyCenter ? studyLessonId : catalogLessonId
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from') || 'ioai'

  const { courses, loading: catalogLoading } = useCourseCatalog()
  const course = useMemo(() => findCourseInList(courses, lessonId), [courses, lessonId])
  const productLine = inferProgramLineForSlug(lessonId, course)
  const { tree, loading: treeLoading } = useProgramCurriculum(productLine)
  const lessonInTree = useMemo(
    () => (lessonId && tree?.length ? findLessonInTree(lessonId, tree) : null),
    [lessonId, tree]
  )
  const golabEnabled = Boolean(
    lessonInTree?.lesson?.golabEnabled ?? course?.golabEnabled
  )
  const lessonTitle = course?.nameEn || course?.name || lessonInTree?.lesson?.title || lessonId
  const loading = catalogLoading || treeLoading

  const [code, setCode] = useState(() => loadGoLabCode(lessonId))
  const [output, setOutput] = useState('')
  const [outputTone, setOutputTone] = useState('normal')
  const [running, setRunning] = useState(false)
  const [codeSaved, setCodeSaved] = useState(false)

  const { isAuthenticated } = useAuth()
  const { gateAction } = useLazyAuth()

  const {
    isLoading: pyodideLoading,
    isReady: pyodideReady,
    loadError: pyodideLoadError,
    runPython,
  } = usePyodide()

  useEffect(() => {
    setCode(loadGoLabCode(lessonId))
    setOutput('')
    setOutputTone('normal')
  }, [lessonId])

  useEffect(() => {
    if (!lessonId) return undefined
    const timer = setTimeout(() => saveGoLabCode(lessonId, code), 400)
    return () => clearTimeout(timer)
  }, [lessonId, code])

  useEffect(() => {
    if (!isAuthenticated || !lessonId) return
    const pending = consumePendingAuthAction()
    if (pending?.type === 'golab-save' && pending.lessonId === lessonId) {
      saveGoLabCode(lessonId, code)
      setCodeSaved(true)
    }
  }, [isAuthenticated, lessonId, code])

  const backHref = lessonPathFromGoLab(lessonId, { from, studyCenter, play: true })

  const handleRun = useCallback(async () => {
    if (pyodideLoading || running) return
    setRunning(true)
    setOutputTone('normal')
    try {
      if (!pyodideReady) {
        setOutput(pyodideLoadError?.message || 'Python engine is still loading…')
        setOutputTone('error')
        return
      }
      const result = await runPython(code)
      setOutput(result.output)
      setOutputTone(result.isError ? 'error' : 'normal')
    } finally {
      setRunning(false)
    }
  }, [code, pyodideLoading, pyodideReady, pyodideLoadError, runPython, running])

  const handleClearOutput = useCallback(() => {
    setOutput('')
    setOutputTone('normal')
  }, [])

  const handleResetCode = useCallback(() => {
    setCode(GOLAB_STARTER_CODE)
    clearGoLabCode(lessonId)
    setCodeSaved(false)
  }, [lessonId])

  const handleSaveToAccount = useCallback(() => {
    saveGoLabCode(lessonId, code)
    gateAction({
      copyKey: 'saveCode',
      pendingAction: { type: 'golab-save', lessonId },
      onAuthed: () => setCodeSaved(true),
    })
  }, [code, gateAction, lessonId])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      <PageMeta
        title={`GoLab · ${lessonTitle}`}
        description="Practice Python alongside your IOAI lesson video in a browser notebook workspace."
      />

      <header className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 h-14 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={backHref} className="text-xs text-slate-400 hover:text-cyan-400 shrink-0">
            {COURSES_PORTAL.goLabBack}
          </Link>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">
              <span className="text-cyan-300">GoLab</span>
              <span className="text-slate-600 font-normal mx-2">·</span>
              <span className="font-medium text-slate-200">{lessonTitle}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveToAccount}
          className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-md border border-cyan-600/50 text-cyan-300 hover:bg-cyan-950/50 transition"
        >
          <CloudUpload className="w-3.5 h-3.5" aria-hidden />
          {codeSaved && isAuthenticated ? 'Saved ✓' : 'Save to account'}
        </button>
        <button
          type="button"
          onClick={handleResetCode}
          className="text-[11px] px-2.5 py-1.5 rounded-md border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition"
        >
          {COURSES_PORTAL.goLabReset}
        </button>
      </header>

      <main className="flex-1 min-h-0 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-6 text-sm text-slate-400">Loading…</div>
        ) : !golabEnabled ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-slate-300">{COURSES_PORTAL.goLabDisabled}</p>
            <Link to={backHref} className="text-sm text-cyan-400 hover:underline">
              {COURSES_PORTAL.goLabBack}
            </Link>
          </div>
        ) : !course && !lessonInTree ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-slate-400">
            {COURSES_PORTAL.goLabLessonNotFound}
          </div>
        ) : (
          <div className="flex-1 min-h-0 w-full [&_.ioai-notebook-pane]:w-full [&_.ioai-notebook-pane]:lg:w-full [&_.ioai-notebook-pane]:max-w-none">
            <NotebookPane
            lab={GOLAB_LAB}
            code={code}
            onChange={setCode}
            onRun={handleRun}
            onClear={handleClearOutput}
            output={output}
            outputTone={outputTone}
            running={running}
            pyodideLoading={pyodideLoading}
            pyodideError={pyodideLoadError?.message}
            showSubmitCheck={false}
          />
          </div>
        )}
      </main>
    </div>
  )
}
