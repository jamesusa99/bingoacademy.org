import AdminField from './AdminField'
import AdminMaterialsListEditor from './AdminMaterialsListEditor'

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'

/**
 * L1 pack content fields (intro, outcomes, audience, hours, materials).
 */
export default function AdminLabPackLevel1Fields({ form, set, labels, outcomesLines, setOutcomesLines, showMaterials = true }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AdminField label={labels.colPackIntro} className="sm:col-span-2 lg:col-span-3">
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={4}
          className={inputClass}
          placeholder={labels.colPackIntroHint}
        />
      </AdminField>
      <AdminField label={labels.colOutcomes} className="sm:col-span-2 lg:col-span-3">
        <textarea
          value={outcomesLines}
          onChange={(e) => setOutcomesLines(e.target.value)}
          rows={4}
          className={inputClass}
          placeholder={labels.colOutcomesHint}
        />
      </AdminField>
      <AdminField label={labels.colAudience} className="sm:col-span-2">
        <input value={form.audience} onChange={(e) => set('audience', e.target.value)} className={inputClass} />
      </AdminField>
      <AdminField label={labels.colHours}>
        <input
          value={form.hours}
          onChange={(e) => set('hours', e.target.value)}
          className={inputClass}
          placeholder={labels.colHoursHint}
        />
      </AdminField>
      {showMaterials ? (
        <AdminMaterialsListEditor
          label={labels.colPackMaterials}
          hint={labels.colPackMaterialsHint}
          value={form.materials_list}
          onChange={(json) => set('materials_list', json)}
        />
      ) : null}
    </div>
  )
}
