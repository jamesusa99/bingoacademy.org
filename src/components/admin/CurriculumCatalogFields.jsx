import { COURSE_STATUS } from '../../config/coursesCatalog'
import { formatPriceFromCents, parsePriceStringToCents } from '../../lib/coursePricing'
import { curriculumInputClass } from './CurriculumPathPicker'
import AdminField from './AdminField'

/** Price, status, sort order — synced to courses_catalog (same as Lab和材料管理) */
export default function CurriculumCatalogFields({ form, setForm, labels, moduleCatalog = false }) {
  const currency = form.currency || 'usd'

  const handlePriceChange = (e) => {
    const value = e.target.value
    const cents = parsePriceStringToCents(value)
    if (cents != null) {
      setForm((f) => ({ ...f, price: value, price_cents: cents }))
    } else {
      setForm((f) => ({ ...f, price: value }))
    }
  }

  const handlePriceCentsChange = (e) => {
    setForm((f) => ({ ...f, price_cents: e.target.value }))
  }

  const handlePriceCentsBlur = () => {
    const raw = form.price_cents
    if (raw === '' || raw == null) return
    const cents = parseInt(raw, 10)
    if (!Number.isFinite(cents) || cents <= 0) return
    setForm((f) => ({
      ...f,
      price_cents: cents,
      price: formatPriceFromCents(cents, f.currency || currency),
    }))
  }

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100">
      <div>
        <p className="text-xs font-semibold text-slate-500">{labels.catalogSectionTitle}</p>
        {labels.catalogSectionHint ? (
          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{labels.catalogSectionHint}</p>
        ) : null}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminField label={labels.colStatus} required={moduleCatalog}>
          <select
            value={form.status || COURSE_STATUS.LIVE}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className={curriculumInputClass}
          >
            <option value={COURSE_STATUS.LIVE}>{labels.statusLive}</option>
            <option value={COURSE_STATUS.COMING_SOON}>{labels.statusComingSoon}</option>
            <option value={COURSE_STATUS.OFFLINE}>{labels.statusOffline}</option>
          </select>
        </AdminField>
        <AdminField label={labels.colSortOrder}>
          <input
            type="number"
            value={form.sort_order ?? 0}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
            className={curriculumInputClass}
          />
        </AdminField>
        <AdminField label={labels.colPrice} required={moduleCatalog}>
          <input
            value={form.price || ''}
            onChange={handlePriceChange}
            placeholder={labels.phPrice || '$299'}
            className={curriculumInputClass}
          />
        </AdminField>
        <AdminField label={labels.colPriceCents} required={moduleCatalog}>
          <input
            type="number"
            value={form.price_cents ?? ''}
            onChange={handlePriceCentsChange}
            onBlur={handlePriceCentsBlur}
            placeholder={labels.phPriceCents || '29900'}
            className={curriculumInputClass}
          />
        </AdminField>
        <AdminField label={labels.colCurrency}>
          <input
            value={form.currency || 'usd'}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            placeholder={labels.phCurrency || 'usd'}
            className={curriculumInputClass}
          />
        </AdminField>
        <AdminField label={labels.colRating}>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={form.rating ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
            className={curriculumInputClass}
          />
        </AdminField>
        <AdminField label={labels.colStudents}>
          <input
            type="number"
            value={form.students ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, students: e.target.value }))}
            className={curriculumInputClass}
          />
        </AdminField>
      </div>
    </div>
  )
}

export const CATALOG_FORM_DEFAULTS = {
  status: COURSE_STATUS.LIVE,
  price: '',
  price_cents: '',
  currency: 'usd',
  sort_order: 0,
  rating: 4.85,
  students: 800,
}
