import { useEffect, useState } from 'react'
import AdminField from '../../../components/admin/AdminField'
import { CrudTable, inputClass } from '../../../components/admin/community/CommunityAdminCrud'
import { useAdminCrud } from '../../../hooks/useAdminCrud'
import { fetchPlatformSetting, upsertPlatformSetting } from '../../../lib/platformSettings'
import { COMMUNITY_CERT_COURSES_DEFAULT } from '../../../config/seed/communityContent'

const emptyCourse = { name: '', age: '', cert: '', scholarPts: '', partnerCert: true }

export default function CommunityCoursesEditor() {
  const c = useAdminCrud()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [courses, setCourses] = useState(COMMUNITY_CERT_COURSES_DEFAULT)
  const [editingIndex, setEditingIndex] = useState(null)
  const [form, setForm] = useState(emptyCourse)

  useEffect(() => {
    let cancelled = false
    fetchPlatformSetting('community_cert_courses')
      .then((value) => {
        if (cancelled) return
        if (Array.isArray(value) && value.length) setCourses(value)
      })
      .catch((e) => setError(e.message))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const saveAll = async (nextCourses) => {
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      await upsertPlatformSetting('community_cert_courses', nextCourses)
      setCourses(nextCourses)
      setSuccess(c.t('pages.community.coursesSaved'))
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    const payload = { ...form, partnerCert: Boolean(form.partnerCert) }
    if (editingIndex !== null) {
      const next = courses.map((item, i) => (i === editingIndex ? payload : item))
      await saveAll(next)
      setEditingIndex(null)
      setForm(emptyCourse)
    } else {
      await saveAll([...courses, payload])
      setForm(emptyCourse)
    }
  }

  const handleDelete = async (index) => {
    if (!confirm(c.t('pages.community.confirmDeleteCourse'))) return
    const next = courses.filter((_, i) => i !== index)
    await saveAll(next)
    if (editingIndex === index) {
      setEditingIndex(null)
      setForm(emptyCourse)
    }
  }

  const rows = courses.map((course, index) => ({ ...course, id: index }))

  if (loading) {
    return <div className="p-8 text-center text-slate-500">{c.loading}</div>
  }

  return (
    <div className="space-y-6">
      {error ? <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div> : null}
      {success ? <div className="p-3 rounded-xl bg-green-50 text-green-700 text-sm">{success}</div> : null}

      <div className="card p-6">
        <h2 className="font-semibold mb-4">
          {editingIndex !== null ? c.editItem(c.t('pages.community.courseItem')) : c.addItem(c.t('pages.community.courseItem'))}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <AdminField label={c.t('pages.community.courseName')} required>
            <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </AdminField>
          <AdminField label={c.t('pages.community.age')}>
            <input className={inputClass} value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} />
          </AdminField>
          <AdminField label={c.t('pages.community.certLevel')}>
            <input className={inputClass} value={form.cert} onChange={(e) => setForm((f) => ({ ...f, cert: e.target.value }))} />
          </AdminField>
          <AdminField label={c.t('pages.community.scholarPtsLabel')}>
            <input className={inputClass} value={form.scholarPts} onChange={(e) => setForm((f) => ({ ...f, scholarPts: e.target.value }))} />
          </AdminField>
          <AdminField label={c.t('pages.community.partnerCert')} className="flex items-end">
            <label className="flex items-center gap-2 text-sm pb-2">
              <input type="checkbox" checked={form.partnerCert} onChange={(e) => setForm((f) => ({ ...f, partnerCert: e.target.checked }))} />
              {c.t('pages.community.partnerCertHint')}
            </label>
          </AdminField>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60">
            {saving ? c.saving : c.save}
          </button>
          {editingIndex !== null ? (
            <button type="button" onClick={() => { setEditingIndex(null); setForm(emptyCourse) }} className="px-5 py-2 border rounded-xl text-sm">
              {c.cancel}
            </button>
          ) : null}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b font-semibold">{c.t('pages.community.coursesList')}</div>
        <CrudTable
          columns={[
            { key: 'name', label: c.t('pages.community.courseName') },
            { key: 'age', label: c.t('pages.community.age') },
            { key: 'cert', label: c.t('pages.community.certLevel') },
          ]}
          rows={rows}
          onEdit={(row) => {
            setEditingIndex(row.id)
            setForm({ ...courses[row.id] })
          }}
          onDelete={(id) => handleDelete(id)}
          editLabel={c.edit}
          deleteLabel={c.delete}
          empty={c.t('pages.community.noCourses')}
        />
      </div>
    </div>
  )
}
