import { useEffect, useMemo, useRef } from 'react'
import { resolveCurriculumPathDisplay } from '../../lib/videoCurriculum'

export const CURRICULUM_NEW = '__new__'

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm'
const readOnlyClass = 'w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700'

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}

function sortByOrder(rows) {
  return [...(rows || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

function isStaleNewPath(path) {
  const { stageChoice, themeChoice, moduleChoice, newStage, newTheme, newModule } = path || {}
  return (
    stageChoice === CURRICULUM_NEW &&
    themeChoice === CURRICULUM_NEW &&
    moduleChoice === CURRICULUM_NEW &&
    !newStage?.title?.trim() &&
    !newTheme?.title?.trim() &&
    !newTheme?.category_label?.trim() &&
    !newModule?.title?.trim()
  )
}

function buildStageModuleOptions(level) {
  if (!level) return []
  const options = []
  for (const theme of sortByOrder(level.themes)) {
    const categoryLabel = theme.category_label || theme.title
    for (const mod of sortByOrder(theme.modules)) {
      options.push({
        moduleId: mod.id,
        themeId: theme.id,
        label: `${categoryLabel} · ${mod.title}`,
        module: mod,
        theme,
      })
    }
  }
  return options
}

function PanelShell({ title, hint, children, variant = 'default' }) {
  const borderClass =
    variant === 'new' ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-white'
  return (
    <div className={`rounded-lg border p-4 space-y-3 ${borderClass}`}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{title}</p>
        {hint ? <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p> : null}
      </div>
      {children}
    </div>
  )
}

function ReadOnlyValue({ value, mono = false }) {
  return (
    <div className={`${readOnlyClass} ${mono ? 'font-mono text-xs' : ''}`.trim()}>{value || '—'}</div>
  )
}

/**
 * Shared stage → category → module picker (matches IOAI / Foundations / K12 course admin).
 * @param {{ levels: object[], labels: object, value: object, onChange: (patch: object) => void, showNewPanels?: boolean }} props
 */
export default function CurriculumPathPicker({ levels, labels, value, onChange, showNewPanels = true }) {
  const {
    stageChoice = '',
    themeChoice = '',
    moduleChoice = '',
    newStage = { title: '', slug: '', emoji: '🟢' },
    newTheme = { title: '', slug: '', category_label: '' },
    newModule = { title: '', slug: '' },
  } = value

  const patch = (updates) => onChange({ ...value, ...updates })

  const sortedLevels = useMemo(() => sortByOrder(levels), [levels])
  const hadLevelsRef = useRef(sortedLevels.length > 0)
  const staleSyncedRef = useRef(false)
  const userEditedRef = useRef(false)

  const markUserEdited = () => {
    userEditedRef.current = true
  }

  const selectedLevel = useMemo(
    () => sortedLevels.find((l) => l.id === stageChoice),
    [sortedLevels, stageChoice]
  )

  const themes = useMemo(() => sortByOrder(selectedLevel?.themes), [selectedLevel])

  const stageModuleOptions = useMemo(
    () => buildStageModuleOptions(selectedLevel),
    [selectedLevel]
  )

  const moduleOptions = useMemo(() => {
    if (stageChoice === CURRICULUM_NEW) return []
    if (themeChoice === CURRICULUM_NEW) return []
    if (themeChoice && themeChoice !== CURRICULUM_NEW) {
      return stageModuleOptions.filter((option) => option.themeId === themeChoice)
    }
    return stageModuleOptions
  }, [stageChoice, themeChoice, stageModuleOptions])

  const selectedTheme = useMemo(() => {
    if (themeChoice && themeChoice !== CURRICULUM_NEW) {
      return themes.find((t) => t.id === themeChoice) || null
    }
    const hit = stageModuleOptions.find((option) => option.moduleId === moduleChoice)
    return hit?.theme || null
  }, [themes, themeChoice, stageModuleOptions, moduleChoice])

  const selectedModule = useMemo(() => {
    if (moduleChoice && moduleChoice !== CURRICULUM_NEW) {
      const hit = stageModuleOptions.find((option) => option.moduleId === moduleChoice)
      return hit?.module || null
    }
    return null
  }, [stageModuleOptions, moduleChoice])

  // Sync path when curriculum tree loads (avoid locking on stale "__new__" before levels arrive)
  useEffect(() => {
    const hasLevels = sortedLevels.length > 0
    const levelsJustLoaded = hasLevels && !hadLevelsRef.current
    hadLevelsRef.current = hasLevels

    if (!hasLevels) return

    if (levelsJustLoaded && !userEditedRef.current && !staleSyncedRef.current && isStaleNewPath(value)) {
      staleSyncedRef.current = true
      const firstLevel = sortedLevels[0]
      const firstTheme = sortByOrder(firstLevel.themes)[0]
      const firstModule = sortByOrder(firstTheme?.modules)[0]
      patch({
        stageChoice: firstLevel.id,
        themeChoice: firstTheme?.id || CURRICULUM_NEW,
        moduleChoice: firstModule?.id || CURRICULUM_NEW,
      })
      return
    }

    if (!stageChoice && !userEditedRef.current) {
      const firstLevel = sortedLevels[0]
      const firstTheme = sortByOrder(firstLevel.themes)[0]
      const firstModule = sortByOrder(firstTheme?.modules)[0]
      patch({
        stageChoice: firstLevel.id,
        themeChoice: firstTheme?.id || CURRICULUM_NEW,
        moduleChoice: firstModule?.id || CURRICULUM_NEW,
      })
    }
  }, [sortedLevels, stageChoice, themeChoice, moduleChoice, newStage, newTheme, newModule])

  useEffect(() => {
    if (!stageChoice || stageChoice === CURRICULUM_NEW) {
      if (themeChoice !== CURRICULUM_NEW || moduleChoice !== CURRICULUM_NEW) {
        patch({ themeChoice: CURRICULUM_NEW, moduleChoice: CURRICULUM_NEW })
      }
      return
    }

    if (themeChoice === CURRICULUM_NEW) return

    if (themes.length === 0) {
      if (themeChoice !== CURRICULUM_NEW) patch({ themeChoice: CURRICULUM_NEW, moduleChoice: CURRICULUM_NEW })
      return
    }

    if (themeChoice && !themes.some((t) => t.id === themeChoice)) {
      const firstTheme = themes[0]
      const firstModule = sortByOrder(firstTheme.modules)[0]
      patch({
        themeChoice: firstTheme.id,
        moduleChoice: firstModule?.id || CURRICULUM_NEW,
      })
    }
  }, [stageChoice, themes, themeChoice, moduleChoice])

  useEffect(() => {
    if (!stageChoice || stageChoice === CURRICULUM_NEW) return
    if (themeChoice === CURRICULUM_NEW) {
      if (moduleChoice !== CURRICULUM_NEW) patch({ moduleChoice: CURRICULUM_NEW })
      return
    }

    if (moduleChoice === CURRICULUM_NEW) return

    if (moduleOptions.length === 0) {
      if (moduleChoice !== CURRICULUM_NEW) patch({ moduleChoice: CURRICULUM_NEW })
      return
    }

    if (moduleChoice && moduleOptions.some((option) => option.moduleId === moduleChoice)) {
      const hit = moduleOptions.find((option) => option.moduleId === moduleChoice)
      if (hit && themeChoice !== hit.themeId) {
        patch({ themeChoice: hit.themeId })
      }
      return
    }

    patch({ moduleChoice: moduleOptions[0].moduleId, themeChoice: moduleOptions[0].themeId })
  }, [stageChoice, themeChoice, moduleChoice, moduleOptions])

  const pathDisplay = useMemo(
    () => resolveCurriculumPathDisplay(sortedLevels, value),
    [sortedLevels, value]
  )

  const summaryTitle = labels.pathSummaryTitle || 'Selected path'
  const summaryEmpty = labels.pathSummaryEmpty || 'Choose stage, category, and module'
  const selectedHint = labels.selectedFromTreeHint || 'Synced from the curriculum tree.'
  const newStagePanelTitle = labels.newStagePanelTitle || labels.newStage || 'New stage'
  const newCategoryPanelTitle = labels.newCategoryPanelTitle || labels.newCategory || 'New category'
  const newModulePanelTitle = labels.newModulePanelTitle || labels.newModule || 'New module'
  const selectedStagePanelTitle = labels.selectedStagePanelTitle || labels.colStage || 'Stage'
  const selectedCategoryPanelTitle = labels.selectedCategoryPanelTitle || labels.colCategory || 'Category'
  const selectedModulePanelTitle = labels.selectedModulePanelTitle || labels.colModule || 'Module'
  const levelsLoadingHint = labels.levelsLoadingHint || 'Loading curriculum tree…'
  const noModulesHint = labels.noModulesForStage || 'No modules in this stage yet — create one below.'

  const showCategorySection = Boolean(stageChoice)
  const showModuleSection = Boolean(stageChoice && stageChoice !== CURRICULUM_NEW)
  const treeLoading = sortedLevels.length === 0

  const handleStageChange = (nextStage) => {
    markUserEdited()
    if (nextStage === CURRICULUM_NEW) {
      patch({ stageChoice: nextStage, themeChoice: CURRICULUM_NEW, moduleChoice: CURRICULUM_NEW })
      return
    }
    const level = sortedLevels.find((l) => l.id === nextStage)
    const firstTheme = sortByOrder(level?.themes)[0]
    const firstModule = sortByOrder(firstTheme?.modules)[0]
    patch({
      stageChoice: nextStage,
      themeChoice: firstTheme?.id || CURRICULUM_NEW,
      moduleChoice: firstModule?.id || CURRICULUM_NEW,
    })
  }

  const handleThemeChange = (nextTheme) => {
    markUserEdited()
    if (nextTheme === CURRICULUM_NEW) {
      patch({ themeChoice: nextTheme, moduleChoice: CURRICULUM_NEW })
      return
    }
    const theme = themes.find((t) => t.id === nextTheme)
    const firstModule = sortByOrder(theme?.modules)[0]
    patch({
      themeChoice: nextTheme,
      moduleChoice: firstModule?.id || CURRICULUM_NEW,
    })
  }

  const handleModuleChange = (nextModule) => {
    markUserEdited()
    if (nextModule === CURRICULUM_NEW) {
      patch({ moduleChoice: nextModule })
      return
    }
    const hit = stageModuleOptions.find((option) => option.moduleId === nextModule)
    patch({
      moduleChoice: nextModule,
      ...(hit ? { themeChoice: hit.themeId } : {}),
    })
  }

  return (
    <div className="space-y-4">
      {treeLoading ? (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {levelsLoadingHint}
        </p>
      ) : null}

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label={labels.colStage}>
          <select
            className={inputClass}
            value={stageChoice}
            onChange={(e) => handleStageChange(e.target.value)}
            disabled={treeLoading}
          >
            {!stageChoice ? <option value="">{summaryEmpty}</option> : null}
            {sortedLevels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.emoji ? `${l.emoji} ` : ''}
                {l.title}
              </option>
            ))}
            <option value={CURRICULUM_NEW}>{labels.newStage}</option>
          </select>
        </Field>

        <Field label={labels.colCategory}>
          <select
            className={inputClass}
            value={themeChoice}
            onChange={(e) => handleThemeChange(e.target.value)}
            disabled={treeLoading || !stageChoice || stageChoice === CURRICULUM_NEW}
          >
            {!themeChoice ? <option value="">{summaryEmpty}</option> : null}
            {stageChoice !== CURRICULUM_NEW &&
              themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.category_label || t.title}
                </option>
              ))}
            <option value={CURRICULUM_NEW}>{labels.newCategory}</option>
          </select>
        </Field>

        <Field label={labels.colModule}>
          <select
            className={inputClass}
            value={moduleChoice}
            onChange={(e) => handleModuleChange(e.target.value)}
            disabled={treeLoading || !stageChoice || stageChoice === CURRICULUM_NEW || themeChoice === CURRICULUM_NEW}
          >
            {!moduleChoice ? <option value="">{summaryEmpty}</option> : null}
            {stageChoice !== CURRICULUM_NEW &&
              themeChoice !== CURRICULUM_NEW &&
              moduleOptions.map((option) => (
                <option key={option.moduleId} value={option.moduleId}>
                  {option.label}
                </option>
              ))}
            {stageChoice !== CURRICULUM_NEW && themeChoice !== CURRICULUM_NEW && !moduleOptions.length ? (
              <option value="" disabled>
                {noModulesHint}
              </option>
            ) : null}
            {stageChoice !== CURRICULUM_NEW && themeChoice !== CURRICULUM_NEW ? (
              <option value={CURRICULUM_NEW}>{labels.newModule}</option>
            ) : null}
          </select>
        </Field>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">{summaryTitle}</p>
        {pathDisplay.stage === '—' && pathDisplay.category === '—' && pathDisplay.module === '—' ? (
          <p className="text-slate-400 text-xs">{summaryEmpty}</p>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-700">
            <span>
              <span className="text-slate-500">{labels.colStage}:</span> <strong>{pathDisplay.stage}</strong>
            </span>
            <span>
              <span className="text-slate-500">{labels.colCategory}:</span>{' '}
              <strong className="text-primary">{pathDisplay.category}</strong>
            </span>
            <span>
              <span className="text-slate-500">{labels.colModule}:</span> <strong>{pathDisplay.module}</strong>
            </span>
          </div>
        )}
      </div>

      {showNewPanels && stageChoice === CURRICULUM_NEW ? (
        <PanelShell title={newStagePanelTitle} variant="new">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label={labels.newStageTitle}>
              <input
                className={inputClass}
                value={newStage.title}
                onChange={(e) => {
                  markUserEdited()
                  patch({ newStage: { ...newStage, title: e.target.value } })
                }}
                placeholder={labels.phStageTitle}
              />
            </Field>
            <Field label={labels.newStageSlug}>
              <input
                className={inputClass}
                value={newStage.slug}
                onChange={(e) => {
                  markUserEdited()
                  patch({ newStage: { ...newStage, slug: e.target.value } })
                }}
                placeholder={labels.phStageSlug || 'intro'}
              />
            </Field>
            <Field label={labels.newStageEmoji}>
              <input
                className={inputClass}
                value={newStage.emoji}
                onChange={(e) => {
                  markUserEdited()
                  patch({ newStage: { ...newStage, emoji: e.target.value } })
                }}
                placeholder="🟢"
              />
            </Field>
          </div>
        </PanelShell>
      ) : showNewPanels && selectedLevel ? (
        <PanelShell title={selectedStagePanelTitle} hint={selectedHint}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label={labels.newStageTitle || labels.colStage}>
              <ReadOnlyValue value={`${selectedLevel.emoji ? `${selectedLevel.emoji} ` : ''}${selectedLevel.title}`} />
            </Field>
            <Field label={labels.newStageSlug || 'Slug'}>
              <ReadOnlyValue value={selectedLevel.slug} mono />
            </Field>
            <Field label={labels.newStageEmoji || 'Emoji'}>
              <ReadOnlyValue value={selectedLevel.emoji || '—'} />
            </Field>
          </div>
        </PanelShell>
      ) : null}

      {showNewPanels && showCategorySection && themeChoice === CURRICULUM_NEW ? (
        <PanelShell title={newCategoryPanelTitle} variant="new">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={labels.newCategoryTitle}>
              <input
                className={inputClass}
                value={newTheme.category_label || newTheme.title}
                onChange={(e) => {
                  markUserEdited()
                  const name = e.target.value
                  patch({
                    newTheme: { ...newTheme, title: name, category_label: name },
                  })
                }}
                placeholder={labels.phCategoryTitle}
              />
            </Field>
            <Field label={labels.newCategorySlug}>
              <input
                className={inputClass}
                value={newTheme.slug}
                onChange={(e) => {
                  markUserEdited()
                  patch({ newTheme: { ...newTheme, slug: e.target.value } })
                }}
                placeholder={labels.phCategorySlug || 'math'}
              />
            </Field>
          </div>
        </PanelShell>
      ) : showNewPanels && selectedTheme && themeChoice !== CURRICULUM_NEW ? (
        <PanelShell title={selectedCategoryPanelTitle} hint={selectedHint}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={labels.newCategoryTitle || labels.colCategory}>
              <ReadOnlyValue value={selectedTheme.category_label || selectedTheme.title} />
            </Field>
            <Field label={labels.newCategorySlug || 'Slug'}>
              <ReadOnlyValue value={selectedTheme.slug} mono />
            </Field>
          </div>
        </PanelShell>
      ) : null}

      {showNewPanels && showModuleSection && moduleChoice === CURRICULUM_NEW ? (
        <PanelShell title={newModulePanelTitle} variant="new">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={labels.newModuleTitle}>
              <input
                className={inputClass}
                value={newModule.title}
                onChange={(e) => {
                  markUserEdited()
                  patch({ newModule: { ...newModule, title: e.target.value } })
                }}
                placeholder={labels.phModuleTitle}
              />
            </Field>
            <Field label={labels.newModuleSlug}>
              <input
                className={inputClass}
                value={newModule.slug}
                onChange={(e) => {
                  markUserEdited()
                  patch({ newModule: { ...newModule, slug: e.target.value } })
                }}
                placeholder={labels.phModuleSlugExample || 'part-1'}
              />
            </Field>
          </div>
        </PanelShell>
      ) : showNewPanels && selectedModule && moduleChoice !== CURRICULUM_NEW ? (
        <PanelShell title={selectedModulePanelTitle} hint={selectedHint}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label={labels.newModuleTitle || labels.colModule}>
              <ReadOnlyValue value={selectedModule.title} />
            </Field>
            <Field label={labels.newModuleSlug || 'Slug'}>
              <ReadOnlyValue value={selectedModule.slug} mono />
            </Field>
            <Field label={labels.moduleLessonCountLabel || labels.colLesson || 'Lessons'}>
              <ReadOnlyValue
                value={
                  typeof labels.moduleLessonCount === 'function'
                    ? labels.moduleLessonCount(selectedModule.lessons?.length ?? 0)
                    : String(selectedModule.lessons?.length ?? 0)
                }
              />
            </Field>
          </div>
        </PanelShell>
      ) : null}
    </div>
  )
}

export { inputClass as curriculumInputClass }
