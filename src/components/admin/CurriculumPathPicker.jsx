import { useEffect, useMemo, useRef } from 'react'

export const CURRICULUM_NEW = '__new__'

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm'

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
  const initStageRef = useRef(false)

  useEffect(() => {
    if (stageChoice) {
      initStageRef.current = true
      return
    }
    if (initStageRef.current) return
    if (sortedLevels.length === 0) {
      patch({ stageChoice: CURRICULUM_NEW })
    } else {
      patch({ stageChoice: sortedLevels[0].id })
    }
    initStageRef.current = true
  }, [sortedLevels, stageChoice])

  const selectedLevel = useMemo(
    () => sortedLevels.find((l) => l.id === stageChoice),
    [sortedLevels, stageChoice]
  )

  const themes = useMemo(() => sortByOrder(selectedLevel?.themes), [selectedLevel])

  useEffect(() => {
    if (stageChoice === CURRICULUM_NEW) {
      if (themeChoice !== CURRICULUM_NEW) patch({ themeChoice: CURRICULUM_NEW })
      return
    }
    if (themes.length === 0) {
      if (themeChoice !== CURRICULUM_NEW) patch({ themeChoice: CURRICULUM_NEW })
      return
    }
    if (themeChoice === CURRICULUM_NEW) return
    if (!themes.some((t) => t.id === themeChoice)) {
      patch({ themeChoice: themes[0].id })
    }
  }, [stageChoice, themes, themeChoice])

  const selectedTheme = useMemo(
    () => themes.find((t) => t.id === themeChoice),
    [themes, themeChoice]
  )

  const modules = useMemo(() => sortByOrder(selectedTheme?.modules), [selectedTheme])

  useEffect(() => {
    if (themeChoice === CURRICULUM_NEW) {
      if (moduleChoice !== CURRICULUM_NEW) patch({ moduleChoice: CURRICULUM_NEW })
      return
    }
    if (modules.length === 0) {
      if (moduleChoice !== CURRICULUM_NEW) patch({ moduleChoice: CURRICULUM_NEW })
      return
    }
    if (moduleChoice === CURRICULUM_NEW) return
    if (!modules.some((m) => m.id === moduleChoice)) {
      patch({ moduleChoice: modules[0].id })
    }
  }, [themeChoice, modules, moduleChoice])

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label={labels.colStage}>
          <select
            className={inputClass}
            value={stageChoice}
            onChange={(e) => patch({ stageChoice: e.target.value })}
          >
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
            onChange={(e) => patch({ themeChoice: e.target.value })}
          >
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
            onChange={(e) => patch({ moduleChoice: e.target.value })}
          >
            {themeChoice !== CURRICULUM_NEW &&
              modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            <option value={CURRICULUM_NEW}>{labels.newModule}</option>
          </select>
        </Field>
      </div>

      {showNewPanels && stageChoice === CURRICULUM_NEW ? (
        <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-lg bg-white border border-slate-200">
          <Field label={labels.newStageTitle}>
            <input
              className={inputClass}
              value={newStage.title}
              onChange={(e) => patch({ newStage: { ...newStage, title: e.target.value } })}
              placeholder={labels.phStageTitle}
            />
          </Field>
          <Field label={labels.newStageSlug}>
            <input
              className={inputClass}
              value={newStage.slug}
              onChange={(e) => patch({ newStage: { ...newStage, slug: e.target.value } })}
              placeholder={labels.phStageSlug || 'intro'}
            />
          </Field>
          <Field label={labels.newStageEmoji}>
            <input
              className={inputClass}
              value={newStage.emoji}
              onChange={(e) => patch({ newStage: { ...newStage, emoji: e.target.value } })}
              placeholder="🟢"
            />
          </Field>
        </div>
      ) : null}

      {showNewPanels && themeChoice === CURRICULUM_NEW ? (
        <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg bg-white border border-slate-200">
          <Field label={labels.newCategoryTitle}>
            <input
              className={inputClass}
              value={newTheme.category_label || newTheme.title}
              onChange={(e) => {
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
              onChange={(e) => patch({ newTheme: { ...newTheme, slug: e.target.value } })}
              placeholder={labels.phCategorySlug || 'math'}
            />
          </Field>
        </div>
      ) : null}

      {showNewPanels && moduleChoice === CURRICULUM_NEW ? (
        <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg bg-white border border-slate-200">
          <Field label={labels.newModuleTitle}>
            <input
              className={inputClass}
              value={newModule.title}
              onChange={(e) => patch({ newModule: { ...newModule, title: e.target.value } })}
              placeholder={labels.phModuleTitle}
            />
          </Field>
          <Field label={labels.newModuleSlug}>
            <input
              className={inputClass}
              value={newModule.slug}
              onChange={(e) => patch({ newModule: { ...newModule, slug: e.target.value } })}
              placeholder={labels.phModuleSlugExample || 'part-1'}
            />
          </Field>
        </div>
      ) : null}
    </div>
  )
}

export { inputClass as curriculumInputClass }
