import { Cpu, Save, Tag } from 'lucide-react'
import { LAB_EXPERIMENTS_PORTAL } from '../../config/labExperiments'

function MaterialRow({ item }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <Cpu className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden />
      <div className="min-w-0">
        <p className="text-slate-300">{item.name}</p>
        {item.quantity ? <p className="text-xs text-slate-500">{item.quantity}</p> : null}
      </div>
    </li>
  )
}

function formatSavedAt(ts) {
  if (!ts) return null
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return null
  }
}

export default function LabExperimentNotesPanel({
  experiment,
  noteBody,
  onNoteChange,
  onSave,
  onComplete,
  savedAt,
  saveStatus,
  owned,
}) {
  const materials = experiment?.materialsList || []
  const stepTags = (experiment?.steps || [])
    .map((s) => s.title)
    .filter(Boolean)
    .slice(0, 6)
  const savedLabel = formatSavedAt(savedAt)

  return (
    <aside className="lab-workspace__notes">
      {materials.length > 0 ? (
        <section className="lab-workspace__notes-block">
          <h3 className="lab-workspace__notes-heading">{LAB_EXPERIMENTS_PORTAL.hardwareTitle}</h3>
          <ul className="space-y-2.5">
            {materials.map((item, i) => (
              <MaterialRow key={`${item.name}-${i}`} item={item} />
            ))}
          </ul>
        </section>
      ) : null}

      {stepTags.length > 0 ? (
        <section className="lab-workspace__notes-block">
          <h3 className="lab-workspace__notes-heading">{LAB_EXPERIMENTS_PORTAL.learningTitle}</h3>
          <div className="flex flex-wrap gap-1.5">
            {stepTags.map((tag) => (
              <span key={tag} className="lab-workspace__tag">
                <Tag className="w-3 h-3 shrink-0" aria-hidden />
                {tag}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="lab-workspace__notes-block lab-workspace__notes-block--grow">
        <h3 className="lab-workspace__notes-heading">{LAB_EXPERIMENTS_PORTAL.notesTitle}</h3>
        <p className="text-xs text-slate-500 mb-2">{LAB_EXPERIMENTS_PORTAL.notesHint}</p>
        <textarea
          value={noteBody}
          onChange={(e) => onNoteChange(e.target.value)}
          disabled={!owned}
          placeholder={owned ? LAB_EXPERIMENTS_PORTAL.notesPlaceholder : LAB_EXPERIMENTS_PORTAL.notesLocked}
          className="lab-workspace__notes-input"
          rows={8}
        />
        {savedLabel ? (
          <p className="text-[11px] text-slate-500 mt-2">
            {LAB_EXPERIMENTS_PORTAL.notesSavedAt(savedLabel)}
          </p>
        ) : null}
        <div className="flex flex-col gap-2 mt-3">
          <button
            type="button"
            onClick={onSave}
            disabled={!owned || saveStatus === 'saving'}
            className="lab-workspace__notes-save"
          >
            <Save className="w-4 h-4" aria-hidden />
            {saveStatus === 'saving'
              ? LAB_EXPERIMENTS_PORTAL.savingNotes
              : saveStatus === 'saved'
                ? LAB_EXPERIMENTS_PORTAL.notesSaved
                : LAB_EXPERIMENTS_PORTAL.saveNotes}
          </button>
          {owned ? (
            <button type="button" onClick={onComplete} className="lab-workspace__notes-complete">
              {LAB_EXPERIMENTS_PORTAL.markComplete}
            </button>
          ) : null}
        </div>
      </section>
    </aside>
  )
}
